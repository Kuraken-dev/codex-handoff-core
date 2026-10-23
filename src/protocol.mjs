import { createHash, createPublicKey, verify } from 'node:crypto';

export function canonical(value) {
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number' && Number.isFinite(value)) return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    return '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + canonical(value[k])).join(',') + '}';
  }
  throw new Error('INVALID_JSON');
}
export const digest = value => createHash('sha256').update(canonical(value)).digest('hex');
export const validId = value => typeof value === 'string' && /^[a-z0-9][a-z0-9-]{0,63}$/.test(value);
export function exactKeys(value, keys) {
  return value !== null && typeof value === 'object' && !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype && Object.keys(value).sort().join('|') === [...keys].sort().join('|');
}
export function validateCommand(c, now, allowlist) {
  if (!exactKeys(c, ['version','commandId','issuer','keyId','audience','target','action','notBefore','expiresAt','payload']) ||
      c.version !== 1 || !validId(c.commandId) || !validId(c.issuer) || !validId(c.keyId) ||
      c.audience !== 'local-simulation' || !exactKeys(c.payload,['message']) ||
      typeof c.payload.message !== 'string' || c.payload.message.length > 256 ||
      !Number.isSafeInteger(now) || !Number.isSafeInteger(c.notBefore) || !Number.isSafeInteger(c.expiresAt) ||
      c.expiresAt <= c.notBefore || c.expiresAt-c.notBefore > 300) throw new Error('INVALID_COMMAND');
  if (now < c.notBefore) throw new Error('NOT_YET_VALID');
  if (now >= c.expiresAt) throw new Error('EXPIRED');
  if (!allowlist.some(x => x.target === c.target && x.action === c.action)) throw new Error('ALLOWLIST_DENIED');
}
export function verifyEd25519(bytes, signatureHex, publicKeyDerHex) {
  try {
    if (!/^[a-f0-9]{128}$/.test(signatureHex) || !/^[a-f0-9]+$/.test(publicKeyDerHex)) return false;
    const key=createPublicKey({key:Buffer.from(publicKeyDerHex,'hex'),format:'der',type:'spki'});
    return key.asymmetricKeyType === 'ed25519' && verify(null,bytes,key,Buffer.from(signatureHex,'hex'));
  } catch { return false; }
}
// Public, reproducible fixture checksum. It is NOT a cryptographic signature or authorization.
export const simulationSignature = command => digest({domain:'PUBLIC-SIMULATION-NOT-AUTHENTICATION',command});
export function verifyEnvelope(e, mode, trustKeys) {
  if (!exactKeys(e,['command','signature']) || !exactKeys(e.signature,['algorithm','value'])) throw new Error('SIGNATURE_REJECTED');
  let ok=false;
  if (mode === 'simulation') ok=e.signature.algorithm === 'SIMULATION-DIGEST' && e.signature.value === simulationSignature(e.command);
  if (mode === 'ed25519' && e.signature.algorithm === 'Ed25519') {
    const issuer=Object.hasOwn(trustKeys,e.command.issuer) ? trustKeys[e.command.issuer] : null;
    const key=issuer && Object.hasOwn(issuer,e.command.keyId) ? issuer[e.command.keyId] : null;
    ok=!!key && verifyEd25519(Buffer.from(canonical(e.command),'utf8'),e.signature.value,key);
  }
  if (!ok) throw new Error('SIGNATURE_REJECTED');
}
export function checkRoute(route) {
  if (!exactKeys(route,['selection','direct']) || route.selection !== 'standby' ||
      !['unattempted','rejected-before-admission'].includes(route.direct)) throw new Error('ROUTE_HOLD');
}
