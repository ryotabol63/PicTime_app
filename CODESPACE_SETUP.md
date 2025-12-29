# Codespaces / Dev Container: セットアップ手順 (Codespace 用)

このファイルはリポジトリを GitHub Codespaces や VS Code Remote Container で起動するための最低限の手順をまとめたものです。

---

## 前提 ✅
- GitHub リポジトリに対する書き込み権限（Secrets を追加できること）
- GitHub Codespaces が利用可能であること（またはローカルで Docker / Docker Compose が利用可能なこと）

---

## 1) 必須シークレットの追加（リポジトリ単位） 🔐
Codespaces で Dev Container を起動する前に、**リポジトリの Secrets (Codespaces)** に `MSSQL_SA_PASSWORD` を登録してください。例: `MyPass@123`

手順:
1. GitHub の該当リポジトリに移動
2. `Settings` → `Secrets and variables` → `Codespaces` を開く
3. `New repository secret` をクリック
4. Name: `MSSQL_SA_PASSWORD` 、 Value: (例) `MyPass@123` を入力して保存

> devcontainer.json は `secrets` と `containerEnv` を使ってこのシークレットをコンテナ内に注入します。

---

## 2) (任意だが推奨) SQL 初期化スクリプトのパスワード確認
- 初期化スクリプト: `backend/sql/V1__init_pct901s.sql`
- 初期化スクリプトで作成される DB ユーザ `pct901s_user` のパスワードは **必須シークレット `PCT901S_USER_PASSWORD`** で提供してください（固定値は使用しません）。
- Codespaces の Secrets に `PCT901S_USER_PASSWORD` を追加してください（例: `S3cureP@ssw0rd`）。

---

## 3) Codespace / Dev Container の起動手順 ▶️
### GitHub Codespaces を使う場合
1. GitHub リポジトリで `Code` ボタン → `Codespaces` → `Create codespace on main` をクリック
2. 初回起動時に `.devcontainer` のビルドが始まり、`init-db.sh` が自動実行されます。
3. 起動後、VS Code のターミナルで SQL Server / 初期化ログを確認できます。

### ローカル (Docker Compose) で試す場合
```bash
# リポジトリ直下で
docker compose -f .devcontainer/docker-compose.yml up --build
```
- 環境変数 `MSSQL_SA_PASSWORD` がホスト環境にある場合、自動的に注入されます。
- 起動後、初期 SQL が実行されデータベース・テーブルが作成されます。

---

## 4) 起動後の確認例 ✅
- SQL Server が応答しているか確認
```bash
# コンテナ内や Codespace 環境で
sqlcmd -S mssql -U SA -P "$MSSQL_SA_PASSWORD" -Q "SELECT name FROM sys.databases;"
```
- テーブル確認
```bash
sqlcmd -S mssql -U SA -P "$MSSQL_SA_PASSWORD" -Q "USE pct901s; SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES;"
```

---

## 5) トラブルシューティング ⚠️
- 初期化が失敗する場合: Docker コンテナのログを確認
  - ローカル: `docker logs <mssql-container-id>`
  - Codespace: VS Code のコンテナ出力 / ターミナルを確認
- `init-db.sh` が `sqlcmd` を見つけられない場合は `.devcontainer/Dockerfile` に mssql-tools のインストールが正しく含まれているか確認してください。

---

## 6) セキュリティ備考 🔒
- `MSSQL_SA_PASSWORD` は必ず Git にコミットしないでください。
- `backend/sql/V1__init_pct901s.sql` 内の `ChangeMe!123` を運用前に必ず変更してください（あるいは安全な方法で動的に扱うように改修してください）。

---

必要ならこの README に *Codespaces のスクリーンショット*、あるいは `init-db.sh` の実行ログ取得手順を追加できます。追加希望があれば教えてください。