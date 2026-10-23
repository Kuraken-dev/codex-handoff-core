# Local validation record

The candidate was checked offline on Windows with Node.js 24.16.0. These are local model results, not deployment or operational certification.

| Check | Result / scope |
|---|---|
| Complete behavior suite | 51 tests passed (38 core + 13 B-contract cases), including real RFC public Ed25519 verification vector and synthetic command processing |
| TDD | Initial missing-feature RED; claim/signature-policy RED (3); review active-reconciliation RED (2), then full GREEN |
| Independent review | Active-reconciliation race corrected; simulation/sandbox wording corrected; final disposition recorded separately |
| Offline demos | Existing acceptance/success/duplicate/UNKNOWN flow plus B synthetic stdin processing; callbacks 0 before acceptance, 1 after execution and still 1 on duplicate |
| Source/privacy scan | No findings in candidate; heuristic, not proof of no secrets |
| Actual signature-to-executor integration | Not performed; no private signing key or credentials generated |
| Network, GitHub, SSH, chat, queue, real business effect | Not performed |
| Publication, push, visibility, permanent permission | Not performed |

Commands: `node --test tests/*.test.mjs`, `node examples/demo.mjs`, `node scripts/check-public-tree.mjs`. Review receipts, full terminal evidence and final source hashes are stored outside the publication candidate. Do not import operational receipts into this source tree.

Crypto test constants are the public empty-message test vector from RFC 8032 section 7.1: https://www.rfc-editor.org/rfc/rfc8032#section-7.1 . No private seed, private key or signing routine is included. The public simulation checksum is not a signature.

The library is not a sandbox. A user-supplied executor could perform external effects; none is supplied or tested here. Release remains subject to owner content and license review. Unverified live adapter work is listed in ADAPTERS.md and LIMITATIONS.md.

## B update validation scope

The public B example adds 13 synthetic tests for bounded canonical input/schema/hash, no-answer stdin envelope, task-result verification beyond echo, refusal/mismatch and immutable host expectation. Full candidate suite: 51 PASS. Both advertised demo commands ran offline; source scan reported no findings. The scan is heuristic and independent source review is recorded outside this publication tree.

A separate bounded local evaluation with the official CLI verified host-supplied fictional stdin processing and structured result matching. That evaluation is summarized, not reproduced by these public demos. No private paths, accounts, internal identifiers or runtime logs are included. Its result does not establish file-reading tools, old-chat recovery or outage bypass. This update performs no additional CLI/model invocation, authentication or service change.
