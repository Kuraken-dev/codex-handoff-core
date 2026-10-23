import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Relay, Journal, canonical, verifyEd25519, simulationSignature } from '../src/index.mjs';

const now = 2000000000;
const route = { selection: 'standby', direct: 'unattempted' };
const command = (id='example-one') => ({ version: 1, commandId:id, issuer:'demo-operator', keyId:'public-demo', audience:'local-simulation', target:'fictional-worker', action:'demo.echo', notBefore:now-1, expiresAt:now+60, payload:{message:'Hello, fictional world!'} });
const envelope = c => ({ command:c, signature:{algorithm:'SIMULATION-DIGEST',value:simulationSignature(c)} });
function setup(t, executor=async()=>({status:'succeeded',summary:'Synthetic result'}), options={}) {
  const dir=mkdtempSync(join(tmpdir(),'relay-unit-')); t.after(()=>rmSync(dir,{recursive:true,force:true}));
  const journal=new Journal(dir); let calls=0;
  const relay=new Relay({journal, executor: async c=>{calls++;return executor(c);}, clock:()=>now, signatureMode:'simulation', allowlist:[{target:'fictional-worker',action:'demo.echo'}], ...options});
  return {dir,journal,relay,calls:()=>calls};
}
test('canonical JSON is key-order independent and refuses unsupported values',()=>{
 assert.equal(canonical({b:2,a:1}),'{"a":1,"b":2}'); assert.throws(()=>canonical({x:undefined})); assert.throws(()=>canonical({x:NaN}));
});
// Unchanged public values from RFC 8032 section 7.1 (IRTF); copyright/terms: THIRD_PARTY_NOTICES.md.
// Project MIT grant does not replace these third-party terms. No private seed is included.
test('Ed25519 verifies published RFC 8032 empty-message vector, rejects changed bytes',()=>{
 const key='302a300506032b6570032100d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a';
 const sig='e5564300c360ac729086e2cc806e828a84877f1eb8e5d974d873e065224901555fb8821590a33bacc61e39701cf9b46bd25bf5f0595bbe24655141438e7a100b';
 assert.equal(verifyEd25519(Buffer.alloc(0),sig,key),true); assert.equal(verifyEd25519(Buffer.from('changed'),sig,key),false); assert.equal(verifyEd25519(Buffer.alloc(0),'bad',key),false);
});
test('acceptance does not execute, explicit execution persists distinct stages',async t=>{
 const s=setup(t); assert.equal(s.relay.accept(envelope(command()),route).state,'ACCEPTED'); assert.equal(s.calls(),0);
 assert.equal((await s.relay.execute('example-one',route)).state,'SUCCEEDED'); assert.equal(s.calls(),1);
 assert.deepEqual(s.journal.history('example-one').map(x=>x.state),['ACCEPTED','EXECUTING','SUCCEEDED']);
});
test('duplicate command and repeated execute do not repeat effect',async t=>{
 const s=setup(t); const e=envelope(command()); s.relay.accept(e,route); await s.relay.execute('example-one',route);
 assert.equal(s.relay.accept(e,route).state,'SUCCEEDED'); await s.relay.execute('example-one',route); assert.equal(s.calls(),1);
});
test('same ID changed payload conflicts',t=>{const s=setup(t);s.relay.accept(envelope(command()),route);const c=command();c.payload.message='Changed';assert.throws(()=>s.relay.accept(envelope(c),route),/CONFLICT/);});
for(const direct of ['healthy','accepted','pending','unknown','timeout','error']) test('manual switch blocks direct '+direct,t=>{const s=setup(t);assert.throws(()=>s.relay.accept(envelope(command()),{selection:'standby',direct}),/ROUTE/);assert.equal(s.calls(),0);});
test('explicit before-admission rejection permits local acceptance only',t=>{const s=setup(t);assert.equal(s.relay.accept(envelope(command()),{selection:'standby',direct:'rejected-before-admission'}).state,'ACCEPTED');assert.equal(s.calls(),0);});
for(const [label,mutate] of [['expired',c=>c.expiresAt=now],['future',c=>c.notBefore=now+1],['excessive lifetime',c=>c.expiresAt=now+1000],['wrong target',c=>c.target='other'],['wrong action',c=>c.action='shell.exec'],['wrong audience',c=>c.audience='remote'],['extra command field',c=>c.extra=true],['path traversal ID',c=>c.commandId='../escape'],['extra payload field',c=>c.payload={message:'x',shell:'x'}]]) test('rejects before admission: '+label,t=>{const s=setup(t);const c=command();mutate(c);assert.throws(()=>s.relay.accept(envelope(c),route));assert.equal(s.calls(),0);});
test('tampered synthetic signature rejected',t=>{const s=setup(t);const e=envelope(command());e.command.payload.message='Tampered';assert.throws(()=>s.relay.accept(e,route),/SIGNATURE/);});
test('real signature mode never accepts public simulation digest',t=>{const s=setup(t,undefined,{signatureMode:'ed25519',trustKeys:{}});assert.throws(()=>s.relay.accept(envelope(command()),route),/SIGNATURE/);});
test('real signature mode refuses untrusted issuer/key even with well-shaped signature',t=>{const s=setup(t,undefined,{signatureMode:'ed25519',trustKeys:{}});const e=envelope(command());e.signature={algorithm:'Ed25519',value:'00'.repeat(64)};assert.throws(()=>s.relay.accept(e,route),/SIGNATURE/);});
test('route is rechecked between acceptance and execution',async t=>{const s=setup(t);s.relay.accept(envelope(command()),route);await assert.rejects(s.relay.execute('example-one',{selection:'direct',direct:'healthy'}),/ROUTE/);assert.equal(s.calls(),0);});
test('expiration between acceptance and execution prevents effect',async t=>{let clock=now;const s=setup(t,undefined,{clock:()=>clock});s.relay.accept(envelope(command()),route);clock=now+61;await assert.rejects(s.relay.execute('example-one',route),/EXPIRED/);assert.equal(s.calls(),0);});
test('executor error becomes UNKNOWN without exposing exception or retry',async t=>{const s=setup(t,async()=>{throw Error('private detail');});s.relay.accept(envelope(command()),route);const r=await s.relay.execute('example-one',route);assert.equal(r.state,'UNKNOWN');assert.equal(JSON.stringify(r).includes('private detail'),false);await s.relay.execute('example-one',route);assert.equal(s.calls(),1);});
test('invalid executor result becomes UNKNOWN',async t=>{const s=setup(t,async()=>({status:'accepted'}));s.relay.accept(envelope(command()),route);assert.equal((await s.relay.execute('example-one',route)).state,'UNKNOWN');});
test('timeout is UNKNOWN and does not promise executor cancellation',async t=>{let completed=false;const s=setup(t,async()=>{await new Promise(r=>setTimeout(r,40));completed=true;return {status:'succeeded',summary:'late'};},{timeoutMs:5});s.relay.accept(envelope(command()),route);assert.equal((await s.relay.execute('example-one',route)).state,'UNKNOWN');await new Promise(r=>setTimeout(r,60));assert.equal(completed,true);assert.equal(s.journal.read('example-one').state,'UNKNOWN');assert.equal(s.calls(),1);});
test('persisted execution intent after restart cannot be executed again',async t=>{const s=setup(t);s.relay.accept(envelope(command()),route);s.journal.transition('example-one',['ACCEPTED'],{state:'EXECUTING'});const fresh=new Relay({journal:new Journal(s.dir),executor:async()=>{throw Error('must not call');},clock:()=>now,allowlist:[{target:'fictional-worker',action:'demo.echo'}]});assert.equal((await fresh.execute('example-one',route)).state,'EXECUTING');assert.equal(s.calls(),0);});
test('reconciliation appends evidence but never reopens execution',async t=>{const s=setup(t,async()=>{throw Error();});s.relay.accept(envelope(command()),route);await s.relay.execute('example-one',route);assert.throws(()=>s.relay.reconcile('example-one','NOT_EXECUTED',''));assert.equal(s.relay.reconcile('example-one','NOT_EXECUTED','fictional-receipt-1').state,'RESOLVED_NOT_EXECUTED');await s.relay.execute('example-one',route);assert.equal(s.calls(),1);assert.equal(s.journal.history('example-one').length,4);});
test('journal checksum corruption blocks execution',async t=>{const s=setup(t);s.relay.accept(envelope(command()),route);const f=join(s.dir,'example-one','000001.json');const e=JSON.parse(readFileSync(f,'utf8'));e.data.command.payload.message='damaged';writeFileSync(f,JSON.stringify(e));await assert.rejects(s.relay.execute('example-one',route),/JOURNAL/);assert.equal(s.calls(),0);});
test('injected post-intent storage failure does not cause second effect',async t=>{const s=setup(t);s.relay.accept(envelope(command()),route);const original=s.journal.transition.bind(s.journal);s.journal.transition=(id,from,data)=>{if(data.state==='SUCCEEDED'||data.state==='UNKNOWN')throw Error('disk full');return original(id,from,data);};assert.equal((await s.relay.execute('example-one',route)).state,'UNKNOWN');assert.equal(s.journal.read('example-one').state,'EXECUTING');await s.relay.execute('example-one',route);assert.equal(s.calls(),1);});

test('cooperating journal instances claim execution only once',t=>{const s=setup(t);s.relay.accept(envelope(command()),route);const other=new Journal(s.dir);assert.equal(s.journal.claimExecution('example-one').claimed,true);assert.equal(other.claimExecution('example-one').claimed,false);});
test('lost claim race never invokes executor',async t=>{const s=setup(t);s.relay.accept(envelope(command()),route);s.journal.claimExecution=()=>({claimed:false,record:{...s.journal.read('example-one'),state:'EXECUTING'}});assert.equal((await s.relay.execute('example-one',route)).state,'EXECUTING');assert.equal(s.calls(),0);});
test('signature policy is rechecked after restart before accepted work executes',async t=>{const s=setup(t);s.relay.accept(envelope(command()),route);const fresh=new Relay({journal:new Journal(s.dir),executor:async()=>{throw Error('not called');},clock:()=>now,allowlist:[{target:'fictional-worker',action:'demo.echo'}],signatureMode:'ed25519',trustKeys:{}});await assert.rejects(fresh.execute('example-one',route),/SIGNATURE/);assert.equal(s.journal.read('example-one').state,'ACCEPTED');});

test('reconciliation cannot race queued or active execution',async t=>{const s=setup(t);s.relay.accept(envelope(command()),route);const pending=s.relay.execute('example-one',route);assert.throws(()=>s.relay.reconcile('example-one','NOT_EXECUTED','fictional-observation'),/ACTIVE/);assert.equal((await pending).state,'SUCCEEDED');assert.equal(s.calls(),1);});
test('timeout keeps active guard until callback settles across relay instances',async t=>{let release;const s=setup(t,()=>new Promise(r=>{release=r;}),{timeoutMs:5});s.relay.accept(envelope(command()),route);assert.equal((await s.relay.execute('example-one',route)).state,'UNKNOWN');const other=new Relay({journal:new Journal(s.dir),executor:async()=>{throw Error();},clock:()=>now});assert.throws(()=>other.reconcile('example-one','NOT_EXECUTED','fictional-observation'),/ACTIVE/);release({status:'succeeded',summary:'late'});await new Promise(r=>setTimeout(r,10));assert.equal(s.journal.read('example-one').state,'UNKNOWN');assert.equal(other.reconcile('example-one','SUCCEEDED','fictional-observation').state,'RESOLVED_SUCCEEDED');});
