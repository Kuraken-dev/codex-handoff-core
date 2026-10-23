import { mkdirSync, openSync, writeFileSync, fsyncSync, closeSync, readFileSync, readdirSync, lstatSync, rmdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { digest, validId } from './protocol.mjs';

const transitions = { ACCEPTED:['EXECUTING'], EXECUTING:['SUCCEEDED','UNKNOWN','RESOLVED_SUCCEEDED','RESOLVED_NOT_EXECUTED'], UNKNOWN:['RESOLVED_SUCCEEDED','RESOLVED_NOT_EXECUTED'] };
function directory(p) { if (!lstatSync(p).isDirectory() || lstatSync(p).isSymbolicLink()) throw new Error('JOURNAL_UNSAFE_PATH'); }
export class Journal {
  constructor(root) { this.root=resolve(root);mkdirSync(this.root,{recursive:true});directory(this.root); }
  commandPath(id) { if(!validId(id)) throw new Error('JOURNAL_INVALID_ID'); return join(this.root,id); }
  locked(fn) {
    const lock=join(this.root,'.lock');
    try { mkdirSync(lock); } catch { throw new Error('JOURNAL_BUSY_OR_STALE_LOCK'); }
    try { return fn(); } finally { rmdirSync(lock); }
  }
  records(id) {
    const dir=this.commandPath(id);
    let names;
    try { directory(dir);names=readdirSync(dir).sort(); } catch(e) { if(e.code==='ENOENT') return [];throw e; }
    if (!names.length) throw new Error('JOURNAL_INCOMPLETE');
    let previous=null;const records=[];
    for (let i=0;i<names.length;i++) {
      if(names[i] !== String(i+1).padStart(6,'0')+'.json') throw new Error('JOURNAL_SEQUENCE');
      const file=join(dir,names[i]), stat=lstatSync(file);
      if(!stat.isFile() || stat.isSymbolicLink() || stat.size>65536) throw new Error('JOURNAL_UNSAFE_RECORD');
      let r;try { r=JSON.parse(readFileSync(file,'utf8')); } catch { throw new Error('JOURNAL_INVALID_RECORD'); }
      if(r.seq!==i+1 || r.previous!==previous || r.checksum!==digest({seq:r.seq,previous:r.previous,data:r.data}) ||
         (i===0 ? r.data.state!=='ACCEPTED' || r.data.command?.commandId!==id || r.data.digest!==digest(r.data.command) :
         !transitions[records[i-1].data.state]?.includes(r.data.state))) throw new Error('JOURNAL_INTEGRITY');
      records.push(r);previous=r.checksum;
    }
    return records;
  }
  history(id) { return this.records(id).map(r=>r.data); }
  read(id) { const h=this.history(id); return h.length ? {...h[0],...h.at(-1)} : null; }
  append(id, records, data) {
    const record={seq:records.length+1,previous:records.at(-1)?.checksum??null,data};record.checksum=digest(record);
    const dir=this.commandPath(id); if(!records.length) mkdirSync(dir);directory(dir);
    const file=join(dir,String(record.seq).padStart(6,'0')+'.json');
    const fd=openSync(file,'wx',0o600);
    try { writeFileSync(fd,JSON.stringify(record)+'\n','utf8');fsyncSync(fd); } finally { closeSync(fd); }
    // No claim of power-loss durability of parent directory entries or network filesystems.
  }
  accept(command, signature) {
    return this.locked(()=>{
      const records=this.records(command.commandId), hash=digest(command);
      if(records.length) { if(records[0].data.digest!==hash) throw new Error('COMMAND_ID_CONFLICT');return this.read(command.commandId); }
      this.append(command.commandId,records,{state:'ACCEPTED',command:JSON.parse(JSON.stringify(command)),signature:JSON.parse(JSON.stringify(signature)),digest:hash});
      return this.read(command.commandId);
    });
  }
  claimExecution(id) {
    return this.locked(()=>{
      const records=this.records(id);if(!records.length) throw new Error('JOURNAL_NOT_FOUND');
      if(records.at(-1).data.state!=='ACCEPTED') return {claimed:false,record:this.read(id)};
      mkdirSync(join(this.root,'.active-'+id));
      this.append(id,records,{state:'EXECUTING'});
      return {claimed:true,record:this.read(id)};
    });
  }
  finishExecution(id) {
    this.commandPath(id);
    // Only the original in-process executor calls this, after it AND result handling settle.
    rmdirSync(join(this.root,'.active-'+id));
  }
  reconcile(id, outcome, evidenceId) {
    return this.locked(()=>{
      const records=this.records(id);if(!records.length) throw new Error('JOURNAL_NOT_FOUND');
      if(existsSync(join(this.root,'.active-'+id))) throw new Error('EXECUTION_ACTIVE_OR_STALE_GUARD');
      if(!['EXECUTING','UNKNOWN'].includes(records.at(-1).data.state)) throw new Error('RECONCILIATION_NOT_UNCERTAIN');
      this.append(id,records,{state:'RESOLVED_'+outcome,evidenceId});return this.read(id);
    });
  }
  transition(id, from, data) {
    return this.locked(()=>{
      const records=this.records(id);if(!records.length) throw new Error('JOURNAL_NOT_FOUND');
      const state=records.at(-1).data.state;
      if(!from.includes(state)) return this.read(id);
      if(!transitions[state]?.includes(data.state)) throw new Error('JOURNAL_INVALID_TRANSITION');
      this.append(id,records,data);return this.read(id);
    });
  }
}
