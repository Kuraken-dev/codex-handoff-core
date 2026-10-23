# Security policy and threat boundaries

Status: pre-release local candidate. No production security assurance or hosted service is offered.

## Trust model

The operator, policy configuration, clock, loaded code, executor callback and local disk owner are trusted. An untrusted input may supply command bytes, signature, target or timestamps. Validate exact fields and audience; require trusted issuer/key mapping in Ed25519 mode; match action/target allowlist; enforce a bounded validity interval before acceptance and execution. Journal records and runtime objects are not a secure boundary against an attacker running code in the same process or editing the disk.

An authenticated signature proves possession of a trusted signing key, not that a human approved an action. Enrollment, signing authorization, revocation and remote adapter assurance are intentionally not supplied. No private key is generated or stored. RFC 8032 public vector data is published, non-secret verification material. Simulation digests are intentionally forgeable and require explicit simulation mode; do not use them for real effects.

## Conservative failure behavior

Persist intent before executing; stop after uncertain outcome; preserve journal and inspect. Do not automatically resend, change IDs to escape uncertainty, delete stale locks, erase execution markers, trust queue comments, or claim checksum as authenticity. Read-only reconciliation records an operator assessment and does not reopen execution. A separately verified remote status facility would be needed for trustworthy real reconciliation.

The library does not sandbox callbacks or prevent their network access. No live callback is shipped. Do not import arbitrary executors or trust policy/enrollment from an envelope. Keep a private future queue minimally permissioned and do not expose it to public issue/comment execution. Protect journal directories and backups from untrusted write access.

## Private reporting proposal and release gate

No public repository or vulnerability inbox exists yet. No email address or unverified reporting endpoint is provided. GitHub Private vulnerability reporting is the proposed route; it is NOT enabled or tested for this project.

Before publication/inviting users, the owner must separately authorize repository creation, configure Private vulnerability reporting for the public repository and verify the private report form and maintainer notifications. If the setting cannot be prepared until the repository is public, keep the transition controlled: enable and verify it immediately after the separately authorized visibility step and before announcing the release or inviting reports. Record actual configuration separately. If unavailable, stop release promotion until a real private route is approved and verified. Do not claim a currently usable form from a guessed repository URL.

GitHub documents this feature for public-repository owners/admins: https://docs.github.com/en/code-security/how-tos/report-and-fix-vulnerabilities/configure-vulnerability-reporting/configure-for-a-repository . This document performs no configuration. Do not disclose credentials, signed capabilities, payloads or operational records in public issues. Supported scope at release is v0.1 reference code; no hosted service or security response SLA is promised.

## Release hygiene

Run the provided scan and inspect all files, history (if later initialized), fixtures and screenshots. The scanner is a heuristic, not proof of no secrets. Do not import old Git history or production logs. Keep public code and private operational evidence separate. Review dependency and license inventories and remove generated demo journals before publication.

## Reconciliation and active execution

A per-command local active guard blocks reconciliation while the callback or result persistence is still running, including after a timeout and across cooperating instances sharing the same journal. Normal settlement removes only that execution's guard. A crash or guard-removal failure can leave a stale guard; there is no automatic expiry/removal. Operator investigation of the original process and effects is required before any manual maintenance. The library does not expose an automatic stale-guard recovery path.

An evidence ID is an operator's assertion/reference, not independently verified proof of non-execution. Do not report RESOLVED_NOT_EXECUTED as an authenticated external fact. The route fields likewise do not implement exclusion with a separate direct route. Trusted operator coordination remains necessary.
