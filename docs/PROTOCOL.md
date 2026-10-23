# Command protocol v1

Example command (fictional; fixed demonstration clock):

```json
{
  "version": 1,
  "commandId": "fictional-command-one",
  "issuer": "demo-operator",
  "keyId": "public-demo",
  "audience": "local-simulation",
  "target": "fictional-worker",
  "action": "demo.echo",
  "notBefore": 1999999999,
  "expiresAt": 2000000060,
  "payload": { "message": "Fictional data only" }
}
```

Envelope: `{ "command": <command>, "signature": { "algorithm": "Ed25519", "value": "<128 lowercase hex characters>" } }`. There is deliberately no operational signature here. Trust keys are supplied by trusted configuration as `{ issuer: { keyId: publicKeySpkiDerHex } }`, never read from the envelope. Unknown keys or algorithms fail closed. The demo uses a separate `SIMULATION-DIGEST` envelope and explicit `signatureMode: 'simulation'`; it is not authentication.

The signature covers UTF-8 canonical(command), including all identity, audience, payload and time fields. Objects sort keys, arrays retain order, values use JSON serialization, unsupported and non-finite values are rejected. This format is implementation-specific; interoperability with another signer is not verified. An authenticated command ID reused with different content conflicts rather than replaces work.

IDs (command, issuer, key) match `[a-z0-9][a-z0-9-]{0,63}`. Audience is exactly `local-simulation`. The sole payload field is `message` (at most 256 JavaScript UTF-16 code units). No extra envelope, command, signature or payload fields are accepted. Time is integral Unix seconds, interval `[notBefore, expiresAt)`, maximum length 300 seconds. Allowlist entries match exact target and action strings; there is no wildcard or command interpreter. Real applications need a separately reviewed purpose/schema; this v1 cannot be repurposed by changing only the audience.

Public methods:

- `accept(envelope, route)` checks policy and records acceptance, without invoking the executor.
- `execute(commandId, route)` rechecks policy, wins a durable execution claim, then invokes the callback at most once within this cooperative journal model.
- `reconcile(commandId, outcome, evidenceId)` records a trusted operator assessment for uncertainty. Outcomes are `SUCCEEDED` or `NOT_EXECUTED`, with an opaque ID reference. It refuses active or stale execution guards and cannot reopen execution.

Route is `{ selection: 'standby', direct: 'unattempted' }` or `direct: 'rejected-before-admission'`. It is an operator assertion, not remote proof. No automatic route selection occurs. Cross-route coordination and the reliability of that assertion are outside the implementation.

Ledger states are ACCEPTED, EXECUTING, SUCCEEDED, UNKNOWN, RESOLVED_SUCCEEDED and RESOLVED_NOT_EXECUTED. Only ACCEPTED may claim an execution. Returning an existing state is idempotent lookup, not another execution. Unknown/terminal states never become ACCEPTED again. Do not create another ID to replay an ambiguous business effect.
