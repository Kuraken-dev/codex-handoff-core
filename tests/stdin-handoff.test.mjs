import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { canonical } from '../src/index.mjs';
import { prepareHandoff, verifyHandoffResponse } from '../examples/stdin-handoff.mjs';
const input=()=>({jobId:'demo-handoff',task:'group-order-lines',lines:[{sku:'alpha',units:2,unitPoints:5},{sku:'beta',units:3,unitPoints:4},{sku:'alpha',units:1,unitPoints:5},{sku:'gamma',units:4,unitPoints:2}]});
const bytes=v=>Buffer.from(canonical(v)+'\n');
const hash=b=>createHash('sha256').update(b).digest('hex');
const prepared=()=>{const b=bytes(input());return prepareHandoff(b,hash(b));};
const reply=p=>({status:'completed',jobId:'demo-handoff',inputSha256:p.inputSha256,result:{groups:[{sku:'alpha',units:3,points:15},{sku:'beta',units:3,points:12},{sku:'gamma',units:4,points:8}],totalUnits:10,totalPoints:35}});
test('B host validates bytes and binds a non-answer stdin envelope',()=>{
 const p=prepared();assert.equal(p.inputSha256,hash(bytes(input())));
 const e=JSON.parse(p.stdin);assert.deepEqual(e.handoff,input());assert.deepEqual(Object.keys(e).sort(),['handoff','inputSha256','instruction']);assert.equal(e.result,undefined);assert.equal(e.expected,undefined);
});
test('B correct grouping sorting and totals are verified',()=>{const p=prepared();assert.equal(verifyHandoffResponse(p,reply(p)).state,'RESULT_VERIFIED');});
test('B echo without processing result is rejected',()=>{const p=prepared();assert.throws(()=>verifyHandoffResponse(p,{jobId:p.jobId,inputSha256:p.inputSha256}),/RESPONSE_SCHEMA_REJECTED/);});
test('B incorrect arithmetic is rejected',()=>{const p=prepared(),r=reply(p);r.result.totalPoints=34;assert.throws(()=>verifyHandoffResponse(p,r),/RESULT_MISMATCH/);});
test('B mismatched correlation is rejected',()=>{const p=prepared(),r=reply(p);r.jobId='different-demo';assert.throws(()=>verifyHandoffResponse(p,r),/INPUT_BINDING_MISMATCH/);});
test('B refusal remains a fixed failure',()=>{const p=prepared();assert.throws(()=>verifyHandoffResponse(p,{status:'refused',jobId:p.jobId,inputSha256:p.inputSha256,result:null}),/MODEL_REFUSED/);});
test('B expected source hash is required',()=>assert.throws(()=>prepareHandoff(bytes(input()),'0'.repeat(64)),/INPUT_HASH_MISMATCH/));
test('B oversized input is rejected',()=>assert.throws(()=>prepareHandoff(Buffer.alloc(4097),'0'.repeat(64)),/INPUT_SIZE_REJECTED/));
test('B unknown fields and invalid scalar types are rejected',()=>{const x=input();x.lines[0].units=true;const b=bytes(x);assert.throws(()=>prepareHandoff(b,hash(b)),/INPUT_SCHEMA_REJECTED/);});
test('B duplicate or noncanonical JSON is rejected',()=>{const b=Buffer.from('{"jobId":"demo-handoff",'+canonical(input()).slice(1)+'\n');assert.throws(()=>prepareHandoff(b,hash(b)),/INPUT_ENCODING_REJECTED/);const pretty=Buffer.from(JSON.stringify(input(),null,2)+'\n');assert.throws(()=>prepareHandoff(pretty,hash(pretty)),/INPUT_ENCODING_REJECTED/);});
test('B unknown response field is rejected without echoing its content',()=>{const p=prepared(),r=reply(p);r.extra='fictional-sensitive-value';assert.throws(()=>verifyHandoffResponse(p,r),e=>e.message==='RESPONSE_SCHEMA_REJECTED');});

test('B forged host preparation cannot substitute an expected result',()=>{const p=prepared();assert.throws(()=>verifyHandoffResponse({...p},reply(p)),/UNTRUSTED_PREPARATION/);});
test('B changing decoded stdin does not change the host verification basis',()=>{const p=prepared(),decoded=JSON.parse(p.stdin);decoded.handoff.lines[0].units=50;assert.equal(verifyHandoffResponse(p,reply(p)).state,'RESULT_VERIFIED');});
