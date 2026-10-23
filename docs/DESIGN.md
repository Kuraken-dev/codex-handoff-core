# v0.1 design and implementation plan

Status: authorized local-only public candidate; not published, MIT proposed; final content/rights/publication approval pending.
Purpose: an inspectable portfolio demonstrating conservative command processing, not a working chat outage bypass.

## Boundary
Existing deployment is read-only and separate. Its transport depends on the same official service as its direct route. No independently callable transport or executor has been verified in this scope. No new chat automation API is implied. A private GitHub queue could be a future transport, not a source of execution authority. Public issues/comments must never authorize commands.

## Selected approach
Dependency-free Node.js ES modules. Small command validator, signature boundary, append-only local journal, manual coordinator and synthetic executor. No live adapter shipped. Compared with copying the existing deployment this avoids history/data leakage; compared with implementing a network queue it avoids unverified interfaces and effects.

Command ID plus canonical digest binds idempotency. Signed command includes version, issuer/key, audience, target/action, payload and bounded validity. Allowlist and route selection are rechecked immediately before execution. Direct healthy/accepted/uncertain blocks standby. Manual assertions are not independent evidence of remote non-admission.

Accepted, executing, succeeded, unknown and reconciled outcomes are distinct. Persist executing intent before invoking executor. Never automatically retry an executing/unknown command, including after restart. Reconciliation appends evidence; even NOT_EXECUTED resolution does not enable automatic replay. Journal checksum detects accidental damage, not malicious rewriting. One cooperative local process lock; stale lock requires human inspection. Not multi-host exactly-once.

Ed25519 verifier uses Node crypto and configured public trust keys. No keys or credentials generated. RFC public verification vector tests crypto; synthetic demo verifier uses a public domain-separated digest, explicitly not authentication, and can run only in simulation. Real signed command integration and key management remain unverified. No production-effect adapter is shipped or tested. The callback is trusted, unsandboxed code; simulation must never be connected to real effects.

## Plan
1. Write public behavior tests, observe expected RED from missing implementation.
2. Implement minimum modules and offline demo; run complete suite.
3. Add bilingual README/setup/architecture/security/limitations/contribution/proposed MIT license/third-party rights inventory.
4. Independent code review; fix justified findings with regression tests.
5. Run full suite, demo and source/privacy scan, save manifest and separate verification evidence. No remote calls, Git initialization, publishing or activation.

## Acceptance
Offline deterministic demo, meaningful failure/restart/idempotency/signature/expiry/route tests; review without unresolved critical/important findings; public tree contains only new generic code and fictional data. No real operational identifiers or keys. Final approval of the MIT proposal, ownership/third-party rights and future live adapter assurance remain explicit gates; this local candidate grants no runtime or publication authorization.
