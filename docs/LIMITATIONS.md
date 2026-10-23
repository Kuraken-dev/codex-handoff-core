# Limits / 検証の限界

## Verified locally

Meaningful behavior tests cover admission without execution, manual routing, idempotency conflicts, expiry, allowlist, signature boundary, trusted Ed25519 verification vector, unknown/timeout, restart intent, one-winner journal claim, reconciliation, checksum damage and failed result persistence. Synthetic callbacks and temporary local files only.

## Not verified or supplied by this public tree

- Real chat, SSH, GitHub, network, queue, transport or business executor integration in this public tree.
- A full real signed-command-to-executor acceptance cycle; RFC 8032 verifies the crypto primitive, not key management or operational authorization.
- Outage bypass, independent transport/executor availability, high availability or global exactly-once delivery.
- Multi-host leases, hostile ledger rollback, malicious local administrator, power-loss directory durability, NFS or clock rollback protection.
- OS-level permissions on every platform. File mode is advisory on Windows. Protect the parent directory using OS access controls.
- Force cancellation of timed-out callbacks. A timeout can return UNKNOWN while the callback is still running.
- Independent truth of executor success, manual route disposition or reconciliation evidence. They are trusted inputs in this local model.
- Repeated effects under a new ID, different journal, removed ledger, direct route or external system. Operator protocol and executor idempotency remain necessary.

A stale lock, truncated file, sequence gap or checksum error stops work. There is no automatic repair, lock expiry, retry, ledger deletion, resend or UNKNOWN-to-ACCEPTED path. Even RESOLVED_NOT_EXECUTED remains terminal; designing a new authorized action is outside automatic recovery.

The simulation checksum is public and forgeable, never authentication. The demo's fictional success must not be marketed as an external communication test or production deployment. Future publication updates still require human content and ownership/third-party-rights review; the current project license is MIT for original material.

## Reconciliation and active execution

A per-command local active guard blocks reconciliation while the callback or result persistence is still running, including after a timeout and across cooperating instances sharing the same journal. Normal settlement removes only that execution's guard. A crash or guard-removal failure can leave a stale guard; there is no automatic expiry/removal. Operator investigation of the original process and effects is required before any manual maintenance. The library does not expose an automatic stale-guard recovery path.

An evidence ID is an operator's assertion/reference, not independently verified proof of non-execution. Do not report RESOLVED_NOT_EXECUTED as an authenticated external fact. The route fields likewise do not implement exclusion with a separate direct route. Trusted operator coordination remains necessary.

## B contract evidence boundary

The added public stdin example is offline and uses a synthetic reply. A separate bounded official-CLI evaluation demonstrated host-verified fictional content processing and independent structured-result matching. It did not prove model-side file reading/hash calculation, old-chat recovery, outage bypass or a fully independent route. No private evidence/paths/IDs are bundled. Previous inconclusive outcomes remain unchanged.

This public tree includes no live CLI launcher or transport. Its source digest is not source authentication. The offline input/result helpers do not enforce OS permissions or prevent arbitrary effects by another executor. Optional live use requires separate official setup, user authentication, plan/billing review and a reviewed one-shot launcher with limited redacted evidence. Post-run tool-event rejection is not an execution firewall. See STDIN_HANDOFF.md and OPTIONAL_CLI.md.
