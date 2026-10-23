import { readdirSync, readFileSync, lstatSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=dirname(dirname(fileURLToPath(import.meta.url)));
const findings=[];let count=0;
const rules=[
 ['absolute-local-drive-path',/\b[A-Za-z]:[\\/]/],
 ['private-evaluation-job-id',/fictional-handoff-[0-9]{8}-[0-9]{3}/],
 ['private-key-header',/-----BEGIN (?:[A-Z]+ )?PRIVATE KEY-----/],
 ['credential-token',/(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|xox[baprs]-[A-Za-z0-9-]{15,}|sk-[A-Za-z0-9]{24,})/],
 ['internal-chat-id',/\b01a[0-9a-f]{5}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i],
 ['personal-absolute-path',/[A-Z]:[\\/]Users[\\/][^\s]+/i],
 ['chat-service-link',/(?:slack:\/\/|slack\.com\/archives\/)/i],
 ['suspicious-secret-assignment',/(?:password|api[_-]?key|access[_-]?token)\s*[:=]\s*["'][^"']{12,}["']/i]
];
function walk(dir){for(const name of readdirSync(dir)){
 const p=join(dir,name),r=relative(root,p).replaceAll('\\','/'),s=lstatSync(p);
 if(s.isSymbolicLink()){findings.push({file:r,rule:'symlink'});continue;}
 if(s.isDirectory()){if(['.git','node_modules'].includes(name)||name.startsWith('.demo-'))findings.push({file:r,rule:'unexpected-generated-directory'});else walk(p);continue;}
 count++;if(/(?:^|\/)(?:\.env(?:\..*)?|.*\.(?:pem|key|log))$/.test(r))findings.push({file:r,rule:'sensitive-filename'});
 if(s.size>1000000){findings.push({file:r,rule:'unexpected-large-file'});continue;}
 const text=readFileSync(p,'utf8');for(const[label,re]of rules)if(re.test(text))findings.push({file:r,rule:label});
}}
walk(root);console.log(JSON.stringify({kind:'HEURISTIC_PUBLIC_TREE_SCAN',filesScanned:count,findings,notProofOfSecretAbsence:true},null,2));
if(findings.length)process.exitCode=1;
