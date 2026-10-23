# Future adapters: contracts, not available integrations

No transport adapter is included. The executor port is a trusted async function:

```js
async function fictionalExecutor(command) {
  return { status: 'succeeded', summary: 'Synthetic result only' };
}
```

Its `succeeded` must have a precise adapter-owned meaning. A remote admission receipt must not be mislabeled as completed execution. Ambiguous receipts must throw or return an unsupported status, resulting in UNKNOWN. Return only a safe summary, never raw errors or secrets. The callback is NOT sandboxed. Supplying one that performs network I/O changes the assurance and authorization scope.

## Formal readiness required before a live adapter

- Officially documented and authorized transport AND executor entry, with owner and independent failure domains established.
- Exact target/action schema, identity mapping, operator authorization and manual route evidence.
- Public trust-key enrollment/rotation/revocation; protected command-signing process outside this repository. No trust key obtained from the command or queue.
- Signed, canonical, audience-bound envelope; private queue access; finite limits; remote idempotency and query/reconciliation interface.
- Durable multi-process/multi-host ownership if needed, with rollback/hostile-writer assumptions addressed. The local journal is insufficient for that scenario.
- End-to-end signed command and real effect/result verification, cancellation limits, retention, incident procedure and permission review.

A private GitHub queue is only a potential store/transport. Public issues, comments, pull-request content, labels and author display names are never execution authorization. Access to a private repository also does not replace a trusted signature or approval. Read pinned versions, validate envelope and binding, use conditional writes, and stop on conflicts/unknowns. No polling, API endpoints, repository IDs, tokens or permissions are configured in this candidate.

Different queues that call the same upstream execution service do not provide independent execution availability. No automatic failover, parallel send, or new-ID replay after uncertainty is supported.
