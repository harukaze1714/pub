# Azure AI Foundry 構築手順書

## 📋 目次
1. [事前準備](#事前準備)
2. [リソース作成（ステップバイステップ）](#リソース作成ステップバイステップ)
3. [設定・接続](#設定接続)
4. [トラブルシューティング](#トラブルシューティング)
5. [運用・管理](#運用管理)

---

## 🚀 事前準備

### 必要なツールとアカウント

#### 1. Azureアカウント
- Azure サブスクリプションの有効化
- 適切な権限（Contributor以上）

#### 2. Azure CLI
```powershell
# Azure CLIのインストール確認
az --version

# インストールされていない場合
# https://docs.microsoft.com/ja-jp/cli/azure/install-azure-cli からダウンロード
```

#### 3. PowerShell（Windows環境）
- PowerShell 7 推奨
- UTF-8エンコーディング対応

### Azure CLIでの認証

```powershell
# 1. Azureにログイン
az login

# 2. 使用するサブスクリプションの確認
az account show

# 3. 必要に応じてサブスクリプション切り替え
az account set --subscription "サブスクリプション名またはID"
```

---

## 🏗️ リソース作成（ステップバイステップ）

### Step 1: リソースグループの作成

```powershell
# リソースグループの作成
az group create --name "dsol-test" --location "japaneast"

# 作成確認
az group show --name "dsol-test"
```

**期待される出力例：**
```json
{
  "id": "/subscriptions/.../resourceGroups/dsol-test",
  "location": "japaneast",
  "name": "dsol-test",
  "properties": {
    "provisioningState": "Succeeded"
  }
}
```

### Step 2: Azure OpenAIサービスの作成

```powershell
# Azure OpenAIアカウントの作成
az cognitiveservices account create \
  --name "dsol-test-openai" \
  --resource-group "dsol-test" \
  --kind "OpenAI" \
  --sku "S0" \
  --location "japaneast" \
  --custom-domain "dsol-test-openai"
```

**期待される出力：**
- `"provisioningState": "Succeeded"`
- エンドポイント: `https://dsol-test-openai.openai.azure.com/`

### Step 3: 依存リソースの作成

#### 3-1. Storage Accountの作成
```powershell
az storage account create \
  --name "dsolteststorage" \
  --resource-group "dsol-test" \
  --location "japaneast" \
  --sku "Standard_LRS"
```

#### 3-2. Key Vaultの作成
```powershell
az keyvault create \
  --name "dsol-test-kv" \
  --resource-group "dsol-test" \
  --location "japaneast"
```

#### 3-3. Application Insightsの作成
```powershell
# Application Insights拡張機能の追加（初回のみ）
az extension add --name application-insights

# Application Insightsの作成
az monitor app-insights component create \
  --app "dsol-test-insights" \
  --location "japaneast" \
  --resource-group "dsol-test"
```

### Step 4: Azure AI Foundryワークスペースの作成

```powershell
# Azure ML拡張機能の追加（初回のみ）
az extension add --name ml

# サブスクリプションIDの取得
$subscriptionId = az account show --query id --output tsv

# ワークスペースの作成（自動でサブスクリプションIDを設定）
az ml workspace create --name "dsol-test-aifoundry" --resource-group "dsol-test" --location "japaneast" --storage-account "/subscriptions/$subscriptionId/resourceGroups/dsol-test/providers/Microsoft.Storage/storageAccounts/dsolteststorage" --key-vault "/subscriptions/$subscriptionId/resourceGroups/dsol-test/providers/Microsoft.KeyVault/vaults/dsol-test-kv" --application-insights "/subscriptions/$subscriptionId/resourceGroups/dsol-test/providers/microsoft.insights/components/dsol-test-insights"
```

### Step 5: モデルのデプロイ

#### 5-1. 利用可能モデルの確認
```powershell
# アカウントで利用可能なモデル一覧
az cognitiveservices account list-models \
  --name "dsol-test-openai" \
  --resource-group "dsol-test" \
  --output table
```

#### 5-2. GPT-4o-miniのデプロイ
```powershell
# GPT-4o-miniのデプロイ
az cognitiveservices account deployment create \
  --name "dsol-test-openai" \
  --resource-group "dsol-test" \
  --deployment-name "gpt-4o-mini" \
  --model-name "gpt-4o-mini" \
  --model-version "2024-07-18" \
  --model-format "OpenAI" \
  --sku-capacity 10 \
  --sku-name "GlobalStandard"
```

#### 5-3. GPT-5-miniのデプロイ（オプション）
```powershell
# GPT-5-miniのデプロイ
az cognitiveservices account deployment create \
  --name "dsol-test-openai" \
  --resource-group "dsol-test" \
  --deployment-name "gpt-5-mini" \
  --model-name "gpt-5-mini" \
  --model-version "2025-08-07" \
  --model-format "OpenAI" \
  --sku-capacity 3 \
  --sku-name "GlobalStandard"
```

#### 5-4. デプロイ確認
```powershell
# デプロイされたモデルの確認
az cognitiveservices account deployment list \
  --name "dsol-test-openai" \
  --resource-group "dsol-test" \
  --output table
```

#### 5-5. APIキーの取得
```powershell
# APIキーの取得
az cognitiveservices account keys list \
  --name "dsol-test-openai" \
  --resource-group "dsol-test"
```

---

## ⚙️ 設定・接続

### Clineでの接続設定

#### GPT-4o-mini用設定 ✅推奨
1. **Provider**: `OpenAI Compatible` を選択
2. **Base URL**: `https://dsol-test-openai.openai.azure.com/openai/deployments/gpt-4o-mini`
3. **API Key**: `[取得したAPIキー1]`
4. **Model ID**: 空白のまま
5. **Azure API Version**: `2024-08-01-preview`

#### GPT-5-mini用設定 ⚠️制限あり
1. **Provider**: `OpenAI Compatible` を選択
2. **Base URL**: `https://dsol-test-openai.openai.azure.com/openai/deployments/gpt-5-mini`
3. **API Key**: `[取得したAPIキー1]`
4. **Model ID**: 空白のまま
5. **Azure API Version**: `2024-08-01-preview`

**注意：** GPT-5-miniはClineでの完全対応が限定的な場合があります。

### 接続テスト

#### GPT-4o-miniテスト用cURLコマンド
```bash
curl -X POST "https://dsol-test-openai.openai.azure.com/openai/deployments/gpt-4o-mini/chat/completions?api-version=2024-08-01-preview" \
  -H "Content-Type: application/json" \
  -H "api-key: [APIキー]" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Hello, Azure OpenAI!"
      }
    ],
    "max_tokens": 100,
    "temperature": 0.7
  }'
```

#### GPT-5-miniテスト用PowerShellスクリプト
```powershell
$headers = @{ 
    "api-key" = "[APIキー]"
    "Content-Type" = "application/json"
}

$body = @{
    messages = @(@{
        role = "user"
        content = "Hello! Please respond briefly."
    })
    max_completion_tokens = 50
} | ConvertTo-Json -Depth 10

$response = Invoke-WebRequest -Uri "https://dsol-test-openai.openai.azure.com/openai/deployments/gpt-5-mini/chat/completions?api-version=2024-08-01-preview" -Method Post -Headers $headers -Body $body

$response.Content | ConvertFrom-Json
```

---

## 🔧 トラブルシューティング

### よくある問題と解決策

#### 1. 認証エラー
**問題:** `Interactive authentication is needed`
```
解決策:
az login --scope https://management.core.windows.net//.default
```

#### 2. リージョンでモデルが利用できない
**問題:** `The specified SKU 'Standard' for model is not supported in this region`
```
解決策:
- SKUを 'Standard' から 'GlobalStandard' に変更
- リージョンを 'japaneast' 以外（'eastus', 'westeurope'）に変更
```

#### 3. GPT-5-miniでパラメータエラー
**問題:** `Unsupported parameter: 'max_tokens'`
```
解決策:
- max_tokens → max_completion_tokens に変更
- temperatureパラメータを削除（最小構成でテスト）
```

#### 4. デプロイ容量不足
**問題:** `Insufficient quota`
```
解決策:
- sku-capacityを3に下げる
- 別のリージョンで試行
- Azureサポートに容量拡大を要求
```

### デバッグ用コマンド

#### リソース状態確認
```powershell
# リソースグループ内のリソース一覧
az resource list --resource-group "dsol-test" --output table

# OpenAIアカウントの詳細確認
az cognitiveservices account show \
  --name "dsol-test-openai" \
  --resource-group "dsol-test"

# デプロイメント状態確認
az cognitiveservices account deployment list \
  --name "dsol-test-openai" \
  --resource-group "dsol-test"
```

#### APIエンドポイント疎通確認
```powershell
# モデル一覧取得
curl -H "api-key: [APIキー]" \
  "https://dsol-test-openai.openai.azure.com/openai/models?api-version=2024-08-01-preview"
```

---

## 🛠️ 運用・管理

### コスト管理

#### 料金体系の理解
- **GPT-4o-mini**: 入力 $0.15/1Mトークン、出力 $0.6/1Mトークン
- **GPT-5-mini**: より高価格（具体的な料金は要確認）
- **固定費**: Azure AI Foundryワークスペース、Storage等

#### コスト監視設定
```powershell
# コストアラートの設定（Azure Portal経由推奨）
# 予算設定: リソースグループレベルで月額上限を設定
```

### セキュリティ考慮事項

#### 1. APIキー管理
- APIキーの定期ローテーション
- Key Vaultへの保存（本格運用時）
- 最小権限の原則

#### 2. ネットワークセキュリティ
```powershell
# VNetによる制限（オプション）
az cognitiveservices account network-rule add \
  --name "dsol-test-openai" \
  --resource-group "dsol-test" \
  --ip-address "[許可するIPアドレス]"
```

#### 3. プライベートエンドポイント（本格運用時）
```powershell
# プライベートエンドポイントの作成
az network private-endpoint create \
  --name "dsol-test-openai-pe" \
  --resource-group "dsol-test" \
  --vnet-name "[VNet名]" \
  --subnet "[サブネット名]" \
  --private-connection-resource-id "[OpenAIリソースID]" \
  --group-id "account" \
  --connection-name "dsol-test-connection"
```

### 削除・クリーンアップ

#### 個別リソース削除
```powershell
# デプロイメント削除
az cognitiveservices account deployment delete \
  --name "dsol-test-openai" \
  --resource-group "dsol-test" \
  --deployment-name "gpt-4o-mini"

# OpenAIアカウント削除
az cognitiveservices account delete \
  --name "dsol-test-openai" \
  --resource-group "dsol-test"
```

#### 一括削除
```powershell
# リソースグループ全体削除（注意: 元に戻せません）
az group delete --name "dsol-test" --yes --no-wait
```

---

## 📊 チェックリスト

### 構築完了チェック
- [ ] Azure CLIでの認証完了
- [ ] リソースグループ作成完了
- [ ] Azure OpenAIサービス作成完了
- [ ] 依存リソース（Storage、Key Vault、App Insights）作成完了
- [ ] Azure AI Foundryワークスペース作成完了
- [ ] GPT-4o-miniデプロイ完了
- [ ] APIキー取得完了
- [ ] Cline接続設定完了
- [ ] 接続テスト成功

### オプション
- [ ] GPT-5-miniデプロイ完了
- [ ] セキュリティ設定（IP制限等）
- [ ] コスト監視設定
- [ ] バックアップ・DR設定

---

## ⚠️ 注意事項

1. **APIキーは機密情報**：安全に管理し、GitやGoogleドライブ等のパブリックな場所に保存しない
2. **Japan Eastの制限**：一部モデルやSKUが制限される場合がある
3. **レート制限**：各モデルには分単位の利用制限がある
4. **コスト**：使用量に応じて課金される。予期しない高額請求を避けるため、予算設定を推奨
5. **GPT-5-mini特性**：新しいパラメータ仕様のため、一部ツールで制限がある

---

## 🆘 サポート・リソース

### 公式ドキュメント
- [Azure OpenAI Service](https://docs.microsoft.com/ja-jp/azure/cognitive-services/openai/)
- [Azure AI Foundry](https://docs.microsoft.com/ja-jp/azure/machine-learning/)
- [Azure CLI リファレンス](https://docs.microsoft.com/ja-jp/cli/azure/)

### コミュニティ
- [Azure OpenAI GitHub](https://github.com/Azure/azure-openai-service)
- [Microsoft Tech Community](https://techcommunity.microsoft.com/t5/azure-ai-services/ct-p/Azure-AI-Services)

---

**作成日**: 2025-10-15  
**バージョン**: 1.0  
**想定環境**: Windows PowerShell / Azure CLI
