# Contributing / 開発への参加

This is an unpublished release proposal with a proposed MIT license; final content, rights and publication approval are pending. This local tree is not authorization to publish earlier candidates. Third-party terms remain separate; see LICENSE and THIRD_PARTY_NOTICES.md. Contribution terms and copyright ownership must be settled before accepting external code.

For local review: keep changes small; add a failing behavior test before changing code; run the full local suite, demo and privacy scan; explain trust assumptions and unverified behavior. Never add real credentials, chat IDs, customer data, private logs or a hidden live adapter. Synthetic fixtures must be clearly labeled and unusable as operational authorization.

Protocol, state transitions, trust-key semantics and UNKNOWN recovery require particular care. Do not add automatic retries, lock deletion, public queue command execution, shell interpreters or new-ID replay to make tests pass. Document any increased effect or permission before implementing a live adapter. No network-based tests or dependency downloads are required for this candidate.
