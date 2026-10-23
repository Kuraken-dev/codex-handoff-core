import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { dirname,join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Relay,Journal,simulationSignature } from '../src/index.mjs';
import { prepareHandoff,verifyHandoffResponse } from './stdin-handoff.mjs';
export async function runStdinHandoffDemo(){
 const root=dirname(dirname(fileURLToPath(import.meta.url)));
 const prepared=prepareHandoff(readFileSync(new URL('./fictional-handoff.json',import.meta.url)),readFileSync(new URL('./fictional-handoff.sha256',import.meta.url),'utf8').trim());
 const dir=mkdtempSync(join(root,'.demo-'));let effects=0;const now=2000000000;
 const route={selection:'standby',direct:'unattempted'};
 const relay=new Relay({journal:new Journal(dir),clock:()=>now,signatureMode:'simulation',allowlist:[{target:'fictional-worker',action:'demo.stdin'}],executor:async()=>{
  effects++;
  // Synthetic reply literal, NOT a model invocation or a real CLI response.
  const reply={status:'completed',jobId:prepared.jobId,inputSha256:prepared.inputSha256,result:{groups:[{sku:'alpha',units:3,points:15},{sku:'beta',units:3,points:12},{sku:'gamma',units:4,points:8}],totalUnits:10,totalPoints:35}};
  const verified=verifyHandoffResponse(prepared,reply);
  return {status:'succeeded',summary:'Synthetic stdin processing matched independent host result: '+verified.state};
 }});
 const command={version:1,commandId:'demo-stdin-command',issuer:'demo-operator',keyId:'public-demo',audience:'local-simulation',target:'fictional-worker',action:'demo.stdin',notBefore:now-1,expiresAt:now+60,payload:{message:prepared.inputSha256}};
 try{
  console.log('B CONTRACT: OFFLINE SYNTHETIC REPLY ONLY; CLI/model launches: 0');
  console.log('Host input verified; stdin envelope contains data/instruction/hash, no expected answer.');
  console.log('B admission:',relay.accept({command,signature:{algorithm:'SIMULATION-DIGEST',value:simulationSignature(command)}},route).state,'callbacks:',effects);
  console.log('B synthetic execution:',(await relay.execute(command.commandId,route)).state,'callbacks:',effects);
  console.log('B duplicate:',(await relay.execute(command.commandId,route)).state,'callbacks:',effects);
  console.log('Processing result matched; no model file-read or independent hash claim.');
 }finally{rmSync(dir,{recursive:true,force:true});}
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1])await runStdinHandoffDemo();
