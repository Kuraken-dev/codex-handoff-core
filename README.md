# Codex Handoff Core — v0.1

**A small offline reference for conservative command processing and verified content handoff.**

[日本語](README.ja.md) · [Architecture](docs/ARCHITECTURE.md) · [Security](SECURITY.md) · [Limitations](docs/LIMITATIONS.md)

> Published reference project under MIT for original project material; third-party material retains its own terms. No live transport or executor is included. This project has not demonstrated a network-outage bypass, chat automation, or production exactly-once delivery.

## What the demo shows

A fictional operator manually selects standby. The core checks a command, records **ACCEPTED**, records **EXECUTING before the callback**, then records **SUCCEEDED** or **UNKNOWN**. Repeating the same command ID does not repeat its effect. An ambiguous attempt stops; reconciliation records an assessment without reopening execution.

```text
manual standby → validate → ACCEPTED → durable intent → EXECUTING
                                                  ├→ SUCCEEDED
                                                  └→ UNKNOWN → manual reconciliation (no replay)
```

This is useful for reviewing failure behavior and adapter contracts. It does not replace a transport service. Making a relay open source does not make its upstream dependencies independent.

## Try it offline

Requires Node.js 24 or later (tested on Node.js 24 on Windows). No install or dependency download is needed:

```sh
node --test tests/*.test.mjs
node examples/demo.mjs
node scripts/check-public-tree.mjs
```

The demo writes only a temporary local journal under this project and removes it on normal completion. Data, operator names, targets and effects are fictional. Its public `SIMULATION-DIGEST` is a reproducible checksum, **not authentication**. The library defaults to Ed25519 mode and rejects this fixture unless simulation is explicitly selected. No private keys or credentials are supplied or generated.

## B: host-verified content handoff

The host validates a bounded fictional input and its expected SHA256, sends the verified content as stdin context, and checks a structured processing response against an independently computed result. ID/hash echo alone is insufficient. This contract does **not** claim the model read a file or independently calculated the hash.

The offline demo groups fictional order lines, sorts by SKU and checks quantities and point totals using a **synthetic reply**. It launches no Codex CLI or model. A separate bounded local evaluation with the official CLI demonstrated this content-processing contract; the public tree contains no private test paths, records, identifiers or logs from that evaluation. It does not demonstrate old-chat recovery or outage bypass.

- Run `node examples/stdin-handoff-demo.mjs` for the B-only offline demonstration.
- [B contract and limits](docs/STDIN_HANDOFF.md) distinguishes the public synthetic demo from the separate evaluation.
- [Optional real CLI experiment](docs/OPTIONAL_CLI.md) explains manual installation/login, account-dependent usage costs and the need for a separately reviewed one-shot launcher. No live CLI launcher or automatic install/login/model call is shipped.

## Safety properties within this model

- Command ID + canonical command digest; conflicting reuse is rejected.
- Issuer/key trust binding in Ed25519 mode, target/action allowlist, signed audience and validity (at most 300 seconds).
- Manual standby only for an unattempted direct request or a verified pre-admission rejection. Accepted, pending or uncertain direct requests block standby.
- Intent persisted before callback, cooperative single-directory locking, append-only state transitions and conservative restart handling.
- No retry on exception, timeout, ambiguous callback result or incomplete execution. A timeout does not cancel an already-running callback.
- Receipt acceptance, execution and business success are separate. Even local `SUCCEEDED` is the executor's result, not an independent external observation.

The manual route fields and reconciliation evidence IDs are trusted operator inputs, not independently authenticated remote observations. The local journal is trusted storage; checksums are not tamper resistance. See [threat model](SECURITY.md).

## Source layout

| File | Responsibility |
|---|---|
| `src/protocol.mjs` | Canonical encoding, shape/TTL/allowlist checks, Ed25519 verification, simulation-only checksum |
| `src/journal.mjs` | File journal, state history, cooperative lock, one-winner execution claim |
| `src/relay.mjs` | Admission, execution, timeout/UNKNOWN and reconciliation |
| `examples/demo.mjs` | Fictional local executor and B-contract simulation |
| `examples/stdin-handoff.mjs` | Offline input validation and exact processing-result checks |
| `tests/relay.test.mjs` | Positive, rejection, restart, race and failure tests |

Future real adapters must satisfy the [adapter contract](docs/ADAPTERS.md). A private GitHub queue could transport envelopes, but public issues/comments must never be trusted as executable instructions. No GitHub adapter or credential loader is shipped.

## Release checks

Review code, docs, the MIT license and [release checklist](docs/RELEASE_CHECKLIST.md). This tree contains no inherited Git history or real operational records. Local review/test receipts live outside this candidate. There is no CI workflow with repository permissions, publishing script, network client, shell executor, or automatic failover.

## Repository and license

Repository: [kenjikurashiki/codex-handoff-core](https://github.com/kenjikurashiki/codex-handoff-core); display name: **Codex Handoff Core**. The owner handle was confirmed separately; no legal person or company name is inferred. Publication does not establish trademark clearance.

This is an independent community project, not an official OpenAI product, and is not affiliated with or endorsed by OpenAI. The optional official Codex CLI is a separate product, is not bundled and is not needed for offline tests.

The [MIT license](LICENSE) covers original project material, subject to [third-party notices](THIRD_PARTY_NOTICES.md). The RFC verification constants retain their original attribution and terms. See [license rationale](docs/LICENSE_DECISION.md). This repository was published with the owner's approval. Earlier local candidates and their historical status are preserved separately.

Private vulnerability reporting is enabled: its API status and the public Report a vulnerability link were verified. Use the [private reporting route](https://github.com/kenjikurashiki/codex-handoff-core/security/advisories), not public issues, for sensitive reports. No test report or notification-delivery test was submitted; see [SECURITY](SECURITY.md).
