# Codex Handoff Core — v0.1 公開提案候補

**命令処理と検証済み内容の引継ぎを、小さなオフライン実装で示します。**

[English](README.md) · [構成](docs/ARCHITECTURE.md) · [安全性](SECURITY.md) · [限界](docs/LIMITATIONS.md)

公開前の候補です。MITをプロジェクトのライセンス案として収録しています（最終内容・公開確認前）。第三者素材は元の条件を維持し、実 transport / executor は含みません。外部通信、障害迂回、実チャット操作、本番 exactly-once の成功実績を示すものではありません。OSS 化だけでは上流サービスの障害を回避できません。

## デモの流れ

架空の担当者が手動で予備経路を選びます。命令を検証して ACCEPTED、実行直前の intent を保存して EXECUTING、結果を SUCCEEDED または UNKNOWN として記録します。同じ command ID の再入力で作用を繰り返しません。成否不明なら停止し、照合結果を追記しても自動再実行しません。

## オフライン実行

Node.js 24 以降が必要です。Windows / Node.js 24 で確認しています。依存パッケージのインストールやダウンロードは不要です。

```sh
node --test tests/*.test.mjs
node examples/demo.mjs
node scripts/check-public-tree.mjs
```

デモはプロジェクト配下の一時台帳を使い、正常終了時に除去します。対象・担当・結果はすべて架空です。公開の SIMULATION-DIGEST は合成チェックサムで、署名認証ではありません。既定の Ed25519 モードはこのデモ値を拒否します。秘密鍵・実 credential は生成・同梱しません。

## B方式：ホスト検証済み内容の引継ぎ

ホストが架空入力の範囲・サイズ・schema・期待SHA256を検証し、内容をstdinで渡して、構造化された処理結果を独立計算と照合する契約です。ID/hashのechoだけでは合格にしません。モデル自身のファイル読取り・独立hash計算を主張する方式ではありません。

公開デモは架空注文のSKU別集計・並べ替え・数量とポイント合計を、**合成の返答**で確認します。Codex CLIもモデルも起動しません。別途、公式CLIを使った限定的なローカル評価では、この内容処理契約の成立を確認しました。その実ログ・場所・識別子は公開候補へ含めていません。旧チャット復帰や障害迂回の実証ではありません。

- B方式だけのオフライン再現：`node examples/stdin-handoff-demo.mjs`
- [契約と限界](docs/STDIN_HANDOFF.md)：合成デモと別途評価を区別します。
- [任意の実CLI試験](docs/OPTIONAL_CLI.md)：公式導入、本人ログイン、認証方式による料金、別途レビューした単発ランチャーの必要性を説明します。自動インストール・ログイン・モデル呼出しを行うコードは同梱しません。

## このモデルで確認すること

- command ID と命令全体の digest による同一性確認、異なる内容での同 ID 再使用の拒否。
- Ed25519 の issuer/key 対応、対象/action allowlist、audience、最大300秒の期限。実行直前にも再確認。
- 直接経路が未試行、または受理前拒否を正式確認した場合だけ手動予備候補。受理済み・返信待ち・成否不明の依頼は予備送信しない。
- 実行前 intent、協調的な単一ローカル台帳 lock、再起動後の二重実行抑止。
- 例外・timeout・結果不明で自動再試行しない。timeout は executor の取消保証ではない。

受理・実行・業務完了は別です。SUCCEEDED は executor の申告結果で、外部業務の独立証明ではありません。手動経路の申告や照合 evidence ID は信頼された運用者入力です。checksum は悪意ある台帳改変を防ぎません。詳細は SECURITY と LIMITATIONS を参照してください。

## 構成と公開前確認

汎用コアとローカル台帳に、架空デモ executor を接続しています。既存担当chatへ命令を渡す独立transportは未確認です。B方式は別担当への内容受渡しを限定評価したもので、自動チャットAPIは同梱しません。将来の GitHub queue は非公開運用を前提とし、公開 issue/comment を実行権限として信用しません。

実 adapter は [ADAPTERS](docs/ADAPTERS.md) の条件を別途満たす必要があります。現運用の直接経路と予備待機には変更を加えません。旧 Git 履歴・実業務データ・内部チャット識別子・実ログは持ち込んでいません。公開 repo 作成、push、visibility 変更、資格情報や永続権限の追加は行っていません。

日英 README、設計・セットアップ・デモ・tests・安全性・限界・貢献手順・ライセンス候補・依存ライセンス一覧を用意しています。[公開前チェック](docs/RELEASE_CHECKLIST.md)で内容とライセンスを利用者が確認した後に公開を判断します。

## 名称・ライセンスの提案

repo案は `kenjikurashiki/codex-handoff-core`、表示名案は **Codex Handoff Core** です。確認済みのアカウント名だけを使い、氏名・法人名は推測しません。repoは未作成で、名前の予約や商標確認を保証しません。

OpenAIの公式製品ではなく、OpenAIとの提携・推奨を示すものではありません。任意利用の公式Codex CLIは別製品で同梱せず、オフライン検証には不要です。

新規作成した部分のライセンス案は[MIT](LICENSE)です。[第三者表記](THIRD_PARTY_NOTICES.md)のRFC公開値は元の権利・条件を維持します。[選定理由と留意点](docs/LICENSE_DECISION.md)も確認してください。この別ローカル候補を用意したことで、旧候補の状態や公開許可が変更されることはありません。最終内容・権利・公開の確認は未了です。

セキュリティ窓口にはGitHub Private vulnerability reportingを提案していますが、まだ設定していません。公開issueへ秘密を投稿しないでください。公開利用者を招く前に所有者が窓口を設定・確認する条件は[SECURITY](SECURITY.md)に記載しています。
