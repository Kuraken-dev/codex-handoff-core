# Security policy and threat boundaries

Status: published v0.1 reference project. No production security assurance or hosted service is offered.

## Trust model

The operator, policy configuration, clock, loaded code, executor callback and local disk owner are trusted. An untrusted input may supply command bytes, signature, target or timestamps. Validate exact fields and audience; require trusted issuer/key mapping in Ed25519 mode; match action/target allowlist; enforce a bounded validity interval before acceptance and execution. Journal records and runtime objects are not a secure boundary against an attacker running code in the same process or editing the disk.

An authenticated signature proves possession of a trusted signing key, not that a human approved an action. Enrollment, signing authorization, revocation and remote adapter assurance are intentionally not supplied. No private key is generated or stored. RFC 8032 public vector data is published, non-secret verification material. Simulation digests are intentionally forgeable and require explicit simulation mode; do not use them for real effects.

## Conservative failure behavior

Persist intent before executing; stop after uncertain outcome; preserve journal and inspect. Do not automatically resend, change IDs to escape uncertainty, delete stale locks, erase execution markers, trust queue comments, or claim checksum as authenticity. Read-only reconciliation records an operator assessment and does not reopen execution. A separately verified remote status facility would be needed for trustworthy real reconciliation.

The library does not sandbox callbacks or prevent their network access. No live callback is shipped. Do not import arbitrary executors or trust policy/enrollment from an envelope. Keep a private future queue minimally permissioned and do not expose it to public issue/comment execution. Protect journal directories and backups from untrusted write access.

## Private vulnerability reporting

The public repository is [kenjikurashiki/codex-handoff-core](https://github.com/kenjikurashiki/codex-handoff-core). GitHub Private vulnerability reporting is enabled. Its API status was verified as enabled and the public Advisories page showed Report a vulnerability. Use [that private reporting route](https://github.com/kenjikurashiki/codex-handoff-core/security/advisories); GitHub sign-in may be required. No email address is provided.

No test vulnerability report or notification-delivery test was submitted. Enabled configuration and the visible private-report link do not establish end-to-end notification delivery. Recheck the setting and reporting link for future releases; if unavailable, pause release promotion until a private route is verified.

GitHub documents this feature for public-repository owners/admins: https://docs.github.com/en/code-security/how-tos/report-and-fix-vulnerabilities/configure-vulnerability-reporting/configure-for-a-repository . Configuration was performed separately using the authorized repository administration API. Do not disclose credentials, signed capabilities, payloads or operational records in public issues. Supported scope at release is v0.1 reference code; no hosted service or security response SLA is promised.

## Release hygiene

Run the provided scan and inspect all files, Git history, fixtures and screenshots. The scanner is a heuristic, not proof of no secrets. Do not import old Git history or production logs. Keep public code and private operational evidence separate. Review dependency and license inventories and remove generated demo journals before future publication updates.

## Reconciliation and active execution

A per-command local active guard blocks reconciliation while the callback or result persistence is still running, including after a timeout and across cooperating instances sharing the same journal. Normal settlement removes only that execution's guard. A crash or guard-removal failure can leave a stale guard; there is no automatic expiry/removal. Operator investigation of the original process and effects is required before any manual maintenance. The library does not expose an automatic stale-guard recovery path.

An evidence ID is an operator's assertion/reference, not independently verified proof of non-execution. Do not report RESOLVED_NOT_EXECUTED as an authenticated external fact. The route fields likewise do not implement exclusion with a separate direct route. Trusted operator coordination remains necessary.
