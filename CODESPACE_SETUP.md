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
   - 直接アクセス: https://github.com/ryotabol63/PicTime_app/settings/secrets/codespaces
3. `New repository secret` をクリック
4. Name: `MSSQL_SA_PASSWORD` 、 Value: (例) `MyPass@123` を入力して保存
5. さらに `PCT901S_USER_PASSWORD` を追加（例: `S3cureP@ssw0rd`）

> 注: Devcontainer は起動時にシークレットの有無をチェックします。シークレットがない場合は起動が停止し、ログに設定箇所の案内が表示されます。

> devcontainer.json は `secrets` と `containerEnv` を使ってこのシークレットをコンテナ内に注入します。

---

## 2) (任意だが推奨) SQL 初期化スクリプトのパスワード確認
- 初期化スクリプト: `backend/sql/V1__init_pct901s.sql`
- 初期化スクリプトで作成される DB ユーザ `pct901s_user` のパスワードは **必須シークレット `PCT901S_USER_PASSWORD`** で提供してください（固定値は使用しません）。
- Codespaces の Secrets に `PCT901S_USER_PASSWORD` を追加してください（例: `S3cureP@ssw0rd`）。

---

## 3) Codespace / Dev Container の起動手順 ▶️

### 構成について
このプロジェクトは **Docker-in-Docker** を使用して、Codespace内でSQL Serverコンテナを起動します。
- Codespace起動時に自動的にSQL Serverコンテナが作成・起動されます
- SQL Serverは `localhost:1433` でアクセス可能です
- データは永続化されません（Codespaceを削除すると消えます）

### GitHub Codespaces を使う場合
1. GitHub リポジトリで `Code` ボタン → `Codespaces` → `Create codespace on main` をクリック
2. 初回起動時に:
   - Dev Containerのビルド
   - Docker-in-Dockerのセットアップ
   - SQL Serverコンテナの起動 (`.devcontainer/start-mssql.sh`)
   - データベース初期化 (`.devcontainer/init-db.sh`)
   が自動実行されます
3. 起動後、VS Code のターミナルで以下で確認できます:
   ```bash
   docker ps  # SQL Serverコンテナが動いているか確認
   sqlcmd -S localhost -U SA -P "$MSSQL_SA_PASSWORD" -Q "SELECT name FROM sys.databases;"
   ```

### ローカル (Docker Desktop) で試す場合
```bash
# VS Code で Dev Container として開く
# または docker コマンドで起動:
cd .devcontainer
docker build -t pictime-dev .
docker run -it --privileged \
  -e MSSQL_SA_PASSWORD="YourPassword123" \
  -e PCT901S_USER_PASSWORD="UserPassword123" \
  -v "$(pwd)/..:/workspaces/PicTime_app" \
  -p 1433:1433 -p 8080:8080 \
  pictime-dev
```
- `--privileged` フラグが必要（Docker-in-Docker のため）
- 環境変数で必須パスワードを渡してください

---

## 4) 起動後の確認例 ✅

- Docker コンテナ確認
```bash
docker ps
# mssql という名前のコンテナが動いているはず
```

- SQL Server が応答しているか確認
```bash
sqlcmd -S localhost -U SA -P "$MSSQL_SA_PASSWORD" -Q "SELECT name FROM sys.databases;"
```

- テーブル確認
```bash
sqlcmd -S localhost -U pct901s_user -P "$PCT901S_USER_PASSWORD" -d pct901s -Q "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES;"
```

- Spring Boot アプリケーションの起動
```bash
cd /workspaces/PicTime_app/backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

---

## 5) トラブルシューティング ⚠️

### 問題: SQL Server コンテナが起動していない

**確認:**
```bash
docker ps -a
```

**解決:**
```bash
# 手動でSQL Serverを起動
bash .devcontainer/start-mssql.sh

# またはDockerコマンドで直接起動
docker start mssql

# コンテナが存在しない場合
docker run -d --name mssql \
  -e 'ACCEPT_EULA=Y' \
  -e "MSSQL_SA_PASSWORD=$MSSQL_SA_PASSWORD" \
  -e 'MSSQL_PID=Developer' \
  -p 1433:1433 \
  mcr.microsoft.com/mssql/server:2022-latest
```

### 問題: データベースが初期化されていない

**確認:**
```bash
sqlcmd -S localhost -U SA -P "$MSSQL_SA_PASSWORD" -Q "SELECT name FROM sys.databases WHERE name='pct901s';"
```

**解決:**
```bash
# 手動で初期化を実行
bash .devcontainer/manual-init.sh
```

### 問題: Docker-in-Docker が動作しない

**症状:** `docker: command not found` または `Cannot connect to the Docker daemon`

**解決:**
1. Codespaceを再ビルド: `Cmd/Ctrl + Shift + P` → 「Dev Containers: Rebuild Container」
2. `devcontainer.json` の `features` セクションに `docker-in-docker` が含まれているか確認

### 問題: "waiting for sqlserver..." が終わらない (旧構成での問題)

この問題は **Docker-in-Docker構成に変更することで解決済み** です。
旧構成（docker-compose）では複数サービスがうまく起動しませんでしたが、
新構成ではCodespace内でDockerコンテナを直接管理するため解決しています。

### その他のトラブルシューティング

- 初期化が失敗する場合: Dockerコンテナのログを確認
  ```bash
  docker logs mssql
  ```
- `init-db.sh` が `sqlcmd` を見つけられない場合は `.devcontainer/Dockerfile` に mssql-tools のインストールが正しく含まれているか確認してください

---

## 6) セキュリティ備考 🔒
- `MSSQL_SA_PASSWORD` は必ず Git にコミットしないでください
- `PCT901S_USER_PASSWORD` も Git にコミットしないでください
- これらはCodespaces Secretsまたは環境変数として管理してください
- 本番環境では必ず強力なパスワードを使用してください

---

## 7) アーキテクチャ概要

```
GitHub Codespace
├─ Dev Container (workspace)
│  ├─ Java/Maven 環境
│  ├─ sqlcmd ツール
│  └─ Docker-in-Docker (Docker daemon)
│     └─ SQL Server Container (mssql)
│        └─ Database: pct901s
│           ├─ User: SA (管理者)
│           └─ User: pct901s_user (アプリ用)
```

**利点:**
- ✅ 外部DBサービス不要
- ✅ Codespace内で完結
- ✅ 開発環境の再現性が高い
- ✅ 起動が自動化されている

**注意点:**
- ⚠️ データは永続化されない（Codespace削除時に消える）
- ⚠️ Dockerコンテナが追加のリソースを消費

---

必要ならこの README に *Codespaces のスクリーンショット*、あるいは `init-db.sh` の実行ログ取得手順を追加できます。追加希望があれば教えてください。