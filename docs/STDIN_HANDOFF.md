# B contract / ホスト検証済みstdin方式

## Two different evidence levels

1. **Public offline reproduction:** a new fictional fixture, trusted fixture digest, host schema/size checks and a hard-coded synthetic response. No model, CLI, auth, network or live transport.
2. **Separate bounded local evaluation:** an official CLI accepted host-verified fictional content through stdin and returned a structured grouping/calculation result that matched an independent host calculation. That result is summarized here; private artifacts, internal IDs, paths and operational logs are excluded. It is not evidence that this repository includes a working live executor.

The B contract is distinct from requiring a model to execute a file-reading helper. Earlier inconclusive experiments remain inconclusive; they are not reclassified under B. A model-side filesystem/tool capability is unnecessary for this content-processing claim.

## Offline contract

The example accepts only canonical UTF-8 JSON bytes (sorted object keys, no formatting whitespace, one trailing newline), at most 4096 bytes, with the documented fictional order schema. Re-encoding must match exactly, rejecting duplicate-key/noncanonical representations. The expected source digest must match. A checksum binds bytes; it is not authentication or authorization. Trusted source selection and any signed command envelope remain the host's responsibility.

The stdin envelope contains only an instruction, the fictional handoff and the input digest. Expected group totals stay private to the host's checking logic. The response needs the job/digest binding plus correct grouping, sorted SKU order, quantities and point totals. Refusal, schema error, correlation error or wrong calculation is rejected using a fixed error code without echoing arbitrary response text.

The example keeps its expected basis in a private in-memory association; caller-supplied objects cannot substitute a new expectation. This is a single-process example, not durable provenance or a sandbox.

The relay demo records admission separately from callback execution. A duplicate command does not invoke the synthetic callback again. Exceptions/ambiguity remain UNKNOWN under the existing core; a new ID or different ledger must not be used to bypass that state.

## Permitted claims

- Host-verified content was supplied and a task-dependent result was checked.
- A supplied digest in the response establishes correlation only.
- No claim of model file reading, independent hash computation, existing-chat recovery, outage bypass, GitHub transport or production exactly-once behavior.
- One CLI process in an evaluation does not measure internal API/inference request count.

For any future real experiment, tool actions are unnecessary and prohibited. A reviewed launcher must use the least documented per-invocation restrictions, reject any tool event, preserve limited redacted phase evidence and stop on UNKNOWN. Post-run event rejection alone is not a pre-execution security firewall; effective tool exposure must be evaluated for the intended environment. This candidate provides no live launcher.

## 日本語要点

公開デモは合成のみです。別途の限定評価で確認したのは「ホスト検証済み内容の受け渡しと結果照合」であり、この候補に実行用CLI adapterを組み込んだという意味ではありません。期待値はstdinに含めず、echo以外の内容処理を照合します。旧成否不明を成功へ変更せず、既存chatや障害迂回の実績にも広げません。
