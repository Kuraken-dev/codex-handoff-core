# Dependencies, rights and license inventory

The proposed project MIT grant covers original project material only. It does not relicense third-party material, convey another party's rights or identify the account owner as an upstream author. Final ownership/contribution and release review are pending.

| Item | Bundled? | License / treatment |
|---|---|---|
| Third-party npm packages | None | No runtime/development/optional/peer dependency declarations, lockfile or node_modules tree |
| Node.js built-in modules | External runtime, not bundled | Node project license is primarily MIT plus its bundled third-party notices; use the actual installed distribution's LICENSE. Official reference: https://github.com/nodejs/node/blob/main/LICENSE |
| RFC 8032 verification constants | Public values only in tests | Unmodified empty-message public key/signature values, section 7.1; original RFC/IETF Trust terms and notice below, not the project's MIT grant |
| Official Codex CLI | Not bundled; optional external tool | Consult the actual distribution's license/notices (the previously consulted official package declares Apache-2.0). No upstream code/binary is copied |
| Original project source/docs | Yes | Proposed MIT; see LICENSE and docs/LICENSE_DECISION.md; final publication review pending |

Built-ins: crypto, fs, path, os, url, assert/strict, test. No Node/OpenSSL/CLI binary, upstream implementation source or generated credential is included. Runtime license obligations belong to the runtime distribution; this tree does not redistribute that distribution.

## RFC 8032 public test values

Source: S. Josefsson and I. Liusvaara, RFC 8032, January 2017, section 7.1, Ed25519 TEST 1: https://www.rfc-editor.org/rfc/rfc8032#section-7.1 . Attribution to the RFC published via RFC Editor/IETF Trust; this is an IRTF-stream document. The public key and empty-message signature values in tests/relay.test.mjs are unchanged. A DER public-key container prefix and verification assertions are project-authored wrappers. No private seed, signing key or upstream implementation is copied. These public verification values cannot authorize this project's commands.

Copyright (c) 2017 IETF Trust and the persons identified as the document authors. All rights reserved.

This document is subject to BCP 78 and the IETF Trust's Legal Provisions Relating to IETF Documents (https://trustee.ietf.org/license-info) in effect on the date of publication of this document. Please review these documents carefully, as they describe your rights and restrictions with respect to this document.

Reproduction basis for these unchanged attributed portions: TLP section 3.c.iii (unmodified portions with attribution), read with section 8 for the IRTF stream. Official effective-2015 terms: https://trustee.ietf.org/documents/trust-legal-provisions/tlp-5/ . Do not assume a separate BSD Code Components grant: section 8.g excludes section 4 for IRTF documents. Preserve the RFC notice, attribution and unchanged values on redistribution. The project's MIT notice does not replace them. No modified-RFC or patent license is asserted. Confirm this treatment during final rights review; if broader adaptation is needed, obtain appropriate rights or separately review replacement fixtures.
