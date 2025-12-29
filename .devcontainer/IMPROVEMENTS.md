# Database Initialization Improvements

このドキュメントは、mssql接続問題に対する改善内容をまとめています。

## 🔧 実装した改善

### 1. init-db.sh の改善 ([.devcontainer/init-db.sh](.devcontainer/init-db.sh))

**追加機能:**
- ✅ mssqlホスト名の事前解決チェック
- ✅ わかりやすいエラーメッセージと原因の説明
- ✅ 具体的な解決策の提示
- ✅ リトライ回数の表示 (例: `1/60` 形式)
- ✅ タイムアウト時の適切な処理（graceful exit）

**動作:**
- mssqlホストが解決できない場合、詳細なエラーメッセージを表示してgracefulに終了
- SQL Serverが起動していない場合、原因と解決策を提示
- 初期化失敗時もコンテナは起動を継続（手動で再実行可能）

### 2. devcontainer.json の改善 ([.devcontainer/devcontainer.json](.devcontainer/devcontainer.json))

**変更内容:**
- `postCreateCommand`: シークレットチェックのみ実行（DB初期化を除外）
- `postStartCommand`: 10秒待機後にDB初期化を実行
- 重複していた`postStartCommand`を統合

**効果:**
- mssqlサービスの起動完了を待ってから初期化実行
- より確実なDB接続

### 3. 手動初期化スクリプトの追加 ([.devcontainer/manual-init.sh](.devcontainer/manual-init.sh))

**用途:**
- 自動初期化が失敗した場合の手動実行用
- トラブルシューティング情報の詳細表示

**使用方法:**
```bash
chmod +x .devcontainer/manual-init.sh
bash .devcontainer/manual-init.sh
```

**出力内容:**
- 環境変数チェック
- ホスト名解決確認
- SQL Server接続テスト（30回リトライ）
- 詳細な診断情報

### 4. ドキュメントの更新 ([CODESPACE_SETUP.md](CODESPACE_SETUP.md))

**追加内容:**
- 詳細なトラブルシューティングセクション
- "waiting for sqlserver..." が終わらない場合の対処法
- 具体的な解決手順
- 診断コマンドの例

## 🚀 現在の問題への対処

### 即座に試すこと

1. **Codespaceの再ビルド（最も確実）:**
   - `Cmd/Ctrl + Shift + P` → 「Dev Containers: Rebuild Container」

2. **または、手動初期化を実行:**
   ```bash
   chmod +x .devcontainer/manual-init.sh
   bash .devcontainer/manual-init.sh
   ```

### 問題が解決しない場合

以下のコマンドで診断情報を収集:
```bash
# ホスト名解決確認
getent hosts mssql

# 環境変数確認
echo "MSSQL_SA_PASSWORD is set: $([ -n "$MSSQL_SA_PASSWORD" ] && echo 'YES' || echo 'NO')"

# 接続テスト
sqlcmd -S mssql -U SA -P "$MSSQL_SA_PASSWORD" -Q "SELECT 1"
```

## 📝 今後の推奨事項

1. **ヘルスチェックの監視**: docker-compose.ymlのhealthcheckステータスをログに出力
2. **タイムアウト値の調整**: 環境に応じてリトライ回数を変更可能にする
3. **CI/CD統合**: GitHub ActionsでCodespace起動の自動テスト
4. **代替案の検討**: Azure SQL Databaseなど外部DBサービスの利用も検討

## 🔗 関連ファイル

- [.devcontainer/init-db.sh](.devcontainer/init-db.sh) - 自動初期化スクリプト
- [.devcontainer/manual-init.sh](.devcontainer/manual-init.sh) - 手動初期化スクリプト
- [.devcontainer/devcontainer.json](.devcontainer/devcontainer.json) - Dev Container設定
- [CODESPACE_SETUP.md](CODESPACE_SETUP.md) - セットアップ手順
