# Playwrightテストコード生成プロンプト

あなたはPlaywrightテストコード生成の専門家です。
以下の情報をもとに、Playwrightテストコードを生成してください。

---
## 出力先
output\generated

## Playwright関数リファレンス

master\code-samples\playwright-functions.md

---

## コードサンプル（書き方の参考）

master\code-samples\sample.spec.ts

---

## 画面仕様

master\screen-spec\login-screen.json

---

## 試験手順（ユーザー入力）

master\test-scenarios\login-scenarios.md

---

## 生成ルール

### 必須ルール
1. **インポート**: `import { test, expect } from '@playwright/test';`
2. **構造**: `test.describe` でグループ化、`test.beforeEach` で共通処理
3. **セレクタ**: 画面仕様のセレクタを正確に使用
4. **待機**: 要素の表示確認には `await expect(...).toBeVisible()` を使用
5. **コメント**: 各操作の前に日本語コメントを記載
6. **命名**: テスト名は日本語で、操作内容がわかるように記載

### 使用する関数
- 関数リファレンスに記載された関数のみを使用すること
- 推奨（★）マークの関数を優先して使用
- 入力には `fill()` を使用（`type()` は特別な理由がない限り使わない）

### 検証の書き方
- 要素表示: `await expect(locator).toBeVisible()`
- 要素非表示: `await expect(locator).toBeHidden()` または `not.toBeVisible()`
- テキスト確認: `await expect(locator).toHaveText()` または `toContainText()`
- URL遷移: `await expect(page).toHaveURL()`

---

## 出力形式

```typescript
// 生成されたテストコード
```
