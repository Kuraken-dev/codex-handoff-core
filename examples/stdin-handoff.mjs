// Offline B-contract helpers. No process, network, credential or installer APIs.
import { createHash } from 'node:crypto';
import { canonical } from '../src/index.mjs';
import { exactKeys, validId } from '../src/protocol.mjs';
const trustedBasis=new WeakMap();
const sha=b=>createHash('sha256').update(b).digest('hex');
const integer=(v,max)=>Number.isSafeInteger(v)&&v>=1&&v<=max;
const sku=v=>typeof v==='string'&&/^[a-z][a-z0-9-]{0,31}$/.test(v);
function inputShape(v){return exactKeys(v,['jobId','task','lines'])&&validId(v.jobId)&&v.task==='group-order-lines'&&Array.isArray(v.lines)&&v.lines.length>=1&&v.lines.length<=8&&v.lines.every(x=>exactKeys(x,['sku','units','unitPoints'])&&sku(x.sku)&&integer(x.units,50)&&integer(x.unitPoints,100));}
function expectedResult(input){
 const groups=new Map();
 for(const line of input.lines){const row=groups.get(line.sku)??{sku:line.sku,units:0,points:0};row.units+=line.units;row.points+=line.units*line.unitPoints;groups.set(line.sku,row);}
 const rows=[...groups.keys()].sort().map(k=>groups.get(k));
 return {groups:rows,totalUnits:rows.reduce((s,x)=>s+x.units,0),totalPoints:rows.reduce((s,x)=>s+x.points,0)};
}
export function prepareHandoff(bytes,expectedSha256){
 if(!Buffer.isBuffer(bytes)||bytes.length<1||bytes.length>4096)throw new Error('INPUT_SIZE_REJECTED');
 let input;try{input=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));}catch{throw new Error('INPUT_ENCODING_REJECTED');}
 if(!inputShape(input))throw new Error('INPUT_SCHEMA_REJECTED');
 if(!bytes.equals(Buffer.from(canonical(input)+'\n')))throw new Error('INPUT_ENCODING_REJECTED');
 const inputSha256=sha(bytes);
 if(typeof expectedSha256!=='string'||!/^[a-f0-9]{64}$/.test(expectedSha256)||inputSha256!==expectedSha256)throw new Error('INPUT_HASH_MISMATCH');
 const instruction='Process only this fictional handoff. Group lines by sku; sum units and units*unitPoints per sku, sort sku ascending and calculate totalUnits/totalPoints. Return status, jobId, inputSha256 and result (groups with sku/units/points and totals), or status refused with result null. Use no tools or external actions. The hash is supplied by the host for correlation, not independently calculated by you.';
 const prepared=Object.freeze({jobId:input.jobId,inputSha256,stdin:canonical({instruction,handoff:input,inputSha256})+'\n'});
 trustedBasis.set(prepared,expectedResult(input));return prepared;
}
function resultShape(r){return exactKeys(r,['groups','totalUnits','totalPoints'])&&Array.isArray(r.groups)&&r.groups.length>=1&&r.groups.length<=8&&r.groups.every(x=>exactKeys(x,['sku','units','points'])&&sku(x.sku)&&integer(x.units,400)&&integer(x.points,40000))&&integer(r.totalUnits,400)&&integer(r.totalPoints,40000);}
export function verifyHandoffResponse(prepared,response){
 const expected=trustedBasis.get(prepared);if(!expected)throw new Error('UNTRUSTED_PREPARATION');
 if(!exactKeys(response,['status','jobId','inputSha256','result'])||!['completed','refused'].includes(response.status)||typeof response.jobId!=='string'||typeof response.inputSha256!=='string'||!/^[a-f0-9]{64}$/.test(response.inputSha256)||(response.status==='refused'?response.result!==null:!resultShape(response.result)))throw new Error('RESPONSE_SCHEMA_REJECTED');
 if(response.jobId!==prepared.jobId||response.inputSha256!==prepared.inputSha256)throw new Error('INPUT_BINDING_MISMATCH');
 if(response.status==='refused')throw new Error('MODEL_REFUSED');
 if(canonical(response.result)!==canonical(expected))throw new Error('RESULT_MISMATCH');
 return {state:'RESULT_VERIFIED',result:structuredClone(response.result),modelFileReadClaim:false,modelIndependentHashClaim:false};
}
