# Optional real Codex CLI experiment / 任意の実CLI試験

**Not part of offline setup.** Offline tests and demos do not install software, authenticate, start a model or make service calls. This tree deliberately has no live launcher, child-process executor, credential loader or post-install hook.

## Explicit operator preparation

1. Read the [official Codex CLI installation guide](https://learn.chatgpt.com/docs/codex/cli) and choose an official distribution appropriate for your system. A manually chosen npm installation, when Node/npm already meet the official requirements, is `npm install -g @openai/codex`. This downloads software and changes the selected npm installation prefix; it is optional and is never executed by this project. Follow local installation policy rather than assuming administrator access or bypassing a denied location.
2. Use `codex --version` and `codex --help` to check the selected executable. `codex login status` checks the active authentication method; do not publish account/status output.
3. If sign-in is required, the user explicitly runs `codex login` and completes the official browser flow. The project does not run it, read credentials, copy authentication between accounts, generate keys or accept terms on the user's behalf. See [official authentication](https://learn.chatgpt.com/docs/auth).
4. Check [current plan and usage pricing](https://learn.chatgpt.com/docs/pricing) before any task. ChatGPT sign-in uses the applicable plan/workspace access, limits and credits; API-key sign-in uses usage-based API billing. Access and model availability vary. Installing the CLI does not make inference free or guarantee quota. Do not change plans or billing to run a demo.

## Separately review and authorize a one-shot experiment

A real experiment requires a **new fictional job**, separate evidence/ledger and an explicitly approved maximum of one generation process. Keep prior UNKNOWN jobs unchanged. A trusted host must verify input scope/size/schema/hash, preserve a no-answer stdin envelope and submit it through the official `codex exec -` stdin route. Use `--output-schema` for final-response structure, then independently validate schema, job/digest binding and the task result. The model's digest echo is not a model-side hash calculation.

The official [non-interactive guide](https://learn.chatgpt.com/docs/non-interactive-mode) documents stdin, JSONL and final-response schemas. Sandbox/approval boundaries must remain in place. Documented invocation-time restrictions can disable unnecessary shell/apps/multi-agent features and web search; see the [configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference). Do not rewrite persistent settings or relax managed policies. Actual tool availability and exact event schemas depend on the version/environment; do not infer them from a successful offline demo.

Record host checks, submission intent, process start/exit, turn completion, output schema/correlation/result and fixed failure codes separately. Only approved fictional values and redacted structural metadata should be retained. Never collect unrestricted stderr, auth data or user history. An exit0 or turn-completed event alone is not successful task processing. Timeout, unclear outcome, tool use, refusal or recording failure means stop and reconcile; no automatic restart/resend, new-ID workaround or UNKNOWN reset.

No ready-to-run generation command is provided here because it would bypass the required one-shot/evidence review. A version-pinned launcher is separate integration work, not an npm script or part of the public offline demo.

## 日本語要点

CLI導入、本人ログイン、実モデル試験はそれぞれ明示的な操作です。このプロジェクトは自動実行しません。既存ChatGPT契約での利用とAPIキーの従量課金は異なり、無料・無制限とは説明しません。実試験は新しい架空job・別台帳・最大1回として別途確認し、成否不明なら再送しません。ここに実行用ランチャーや個人の導入場所は含めません。
