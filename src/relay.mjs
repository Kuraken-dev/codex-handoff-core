import { canonical, checkRoute, validateCommand, verifyEnvelope, validId } from './protocol.mjs';
const summary = r => ({commandId:r.command.commandId,digest:r.digest,state:r.state,...(r.summary ? {summary:r.summary} : {})});
export class Relay {
  constructor({journal,executor,clock=()=>Math.floor(Date.now()/1000),allowlist=[],signatureMode='ed25519',trustKeys={},timeoutMs=1000}) {
    if(!journal || typeof executor!=='function' || !['simulation','ed25519'].includes(signatureMode) ||
       !Number.isSafeInteger(timeoutMs) || timeoutMs<1 || timeoutMs>30000) throw new Error('INVALID_CONFIGURATION');
    this.journal=journal;this.executor=executor;this.clock=clock;
    this.allowlist=JSON.parse(JSON.stringify(allowlist));this.signatureMode=signatureMode;this.trustKeys=JSON.parse(JSON.stringify(trustKeys));this.timeoutMs=timeoutMs;
  }
  accept(envelope,route) {
    // Snapshot the complete caller data; mutation after acceptance cannot change the ledger command.
    const e=JSON.parse(canonical(envelope));
    checkRoute(route);validateCommand(e.command,this.clock(),this.allowlist);verifyEnvelope(e,this.signatureMode,this.trustKeys);
    return summary(this.journal.accept(e.command,e.signature));
  }
  async execute(id,route) {
    checkRoute(route);let r=this.journal.read(id);if(!r) throw new Error('COMMAND_NOT_FOUND');
    if(r.state!=='ACCEPTED') return summary(r);
    validateCommand(r.command,this.clock(),this.allowlist);
    verifyEnvelope({command:r.command,signature:r.signature},this.signatureMode,this.trustKeys);
    const claim=this.journal.claimExecution(id);r=claim.record;
    if(!claim.claimed) return summary(r);
    // The synchronous intent transition is complete before invoking an async executor.
    let timer, executorSettled=false, handlerSettled=false;
    const releaseIfSettled=()=>{
      if(executorSettled && handlerSettled) {
        try { this.journal.finishExecution(id); } catch { /* Leave conservative stale guard; no automatic removal. */ }
      }
    };
    try {
      const result=await Promise.race([
        Promise.resolve().then(()=>{validateCommand(r.command,this.clock(),this.allowlist);return this.executor(JSON.parse(canonical(r.command)));}).finally(()=>{executorSettled=true;releaseIfSettled();}),
        new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('TIMEOUT')),this.timeoutMs);})
      ]);
      if(result?.status!=='succeeded' || typeof result.summary!=='string' || result.summary.length>256) throw new Error('INVALID_RESULT');
      return summary(this.journal.transition(id,['EXECUTING'],{state:'SUCCEEDED',summary:result.summary}));
    } catch {
      try { return summary(this.journal.transition(id,['EXECUTING'],{state:'UNKNOWN'})); }
      catch { return {...summary(r),state:'UNKNOWN'}; } // Durable EXECUTING also prevents replay.
    } finally { clearTimeout(timer);handlerSettled=true;releaseIfSettled(); }
  }
  reconcile(id,outcome,evidenceId) {
    if(!['SUCCEEDED','NOT_EXECUTED'].includes(outcome) || !validId(evidenceId)) throw new Error('INVALID_RECONCILIATION');
    return summary(this.journal.reconcile(id,outcome,evidenceId));
  }
}
