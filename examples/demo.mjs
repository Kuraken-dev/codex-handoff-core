import { mkdtempSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Relay, Journal, simulationSignature } from '../src/index.mjs';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const dir=mkdtempSync(join(root,'.demo-'));
const now=2000000000; // Fixed fictional clock, not a real operational window.
const route={selection:'standby',direct:'unattempted'};
let effects=0;
const journal=new Journal(dir);
const relay=new Relay({journal,clock:()=>now,signatureMode:'simulation',allowlist:[{target:'fictional-worker',action:'demo.echo'}],
  executor:async c=>{effects++;if(c.payload.message==='simulate-uncertainty')throw new Error('fictional failure');return {status:'succeeded',summary:'Fictional echo completed'};}});
const command=id=>({version:1,commandId:id,issuer:'demo-operator',keyId:'public-demo',audience:'local-simulation',target:'fictional-worker',action:'demo.echo',notBefore:now-1,expiresAt:now+60,payload:{message:'Hello, fictional world!'}});
const envelope=c=>({command:c,signature:{algorithm:'SIMULATION-DIGEST',value:simulationSignature(c)}});
try {
 console.log('OFFLINE SIMULATION ONLY — no real signatures, network or business effects');
 const c=command('fictional-success');
 console.log('Admission:',relay.accept(envelope(c),route).state,'effects:',effects);
 console.log('Execution:',(await relay.execute(c.commandId,route)).state,'effects:',effects);
 console.log('Duplicate:',(await relay.execute(c.commandId,route)).state,'effects:',effects);
 const uncertain=command('fictional-uncertain');uncertain.payload.message='simulate-uncertainty';
 relay.accept(envelope(uncertain),route);
 console.log('Ambiguity:',(await relay.execute(uncertain.commandId,route)).state);
 console.log('Reconciliation:',relay.reconcile(uncertain.commandId,'NOT_EXECUTED','fictional-observation').state);
 await relay.execute(uncertain.commandId,route);
 console.log('Total synthetic callbacks:',effects,'(no automatic replay after reconciliation)');
 console.log('This demonstrates local state handling, not an outage bypass.');
} finally { rmSync(dir,{recursive:true,force:true}); }

// Fully offline B-contract demonstration; no CLI process is created.
const { runStdinHandoffDemo } = await import('./stdin-handoff-demo.mjs');
await runStdinHandoffDemo();
