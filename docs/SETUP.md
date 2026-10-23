# Offline setup / セットアップ

1. Use an existing Node.js 24+ runtime. This candidate was tested with Node.js 24 on Windows; other operating systems are unverified.
2. Copy this clean directory as a unit. No `.env`, credentials, historical journal or existing repository is needed.
3. Run `node --test tests/*.test.mjs`, `node examples/demo.mjs`, and `node scripts/check-public-tree.mjs` from this directory. No `npm install` is required. The corresponding `npm test`, `npm run demo`, `npm run scan` scripts are conveniences.
4. Read SECURITY.md and LIMITATIONS.md before modifying the executor. Do not configure a production action from this example.

The offline path has no network setup steps, login commands, queue creation, keys to generate, server ports or Git remote operations. The separate OPTIONAL_CLI.md describes optional manual setup; none is run by these scripts. A `.gitignore` excludes generated local journals and common secret files, but ignore rules are not a privacy control; run the source scan and manually review the release artifact.

Tests use temporary directories and remove them. Demo temporarily writes `.demo-*` under the project and removes it on normal completion. A killed process can leave a fictional journal; inspect and remove it before publication. Never apply that cleanup procedure to an operational ledger.

For a local experiment, import Relay and Journal from `src/index.mjs`. Explicitly select `signatureMode: 'simulation'` only for fictional data. The default mode is `ed25519`, and no trust keys are provided. This is intentional fail-closed behavior.

B-only offline demo: `node examples/stdin-handoff-demo.mjs`. The main demo includes it as a second synthetic example. No CLI or model is started.
