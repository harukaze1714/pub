# Playwright 関数リファレンス

このファイルはPlaywrightの主要関数一覧です。テストコード生成時はこれらの関数を使用してください。

---

## 1. ページ操作（Page）

### ナビゲーション
```typescript
// ページを開く
await page.goto('/login');
await page.goto('https://example.com/dashboard');

// ページをリロード
await page.reload();

// ブラウザの戻る・進む
await page.goBack();
await page.goForward();
```

### 情報取得
```typescript
// 現在のURL取得
const currentUrl = page.url();

// ページタイトル取得
const title = await page.title();
```

### スクリーンショット
```typescript
// ページ全体のスクリーンショット
await page.screenshot({ path: 'screenshot.png' });

// 全画面スクリーンショット
await page.screenshot({ path: 'full.png', fullPage: true });
```

---

## 2. 要素の取得（Locator）

### 基本的なセレクタ
```typescript
// ID指定
page.locator('#user-id')

// クラス指定
page.locator('.error-message')

// 属性指定
page.locator('input[type="text"]')
page.locator('[data-testid="submit-btn"]')

// 複合セレクタ
page.locator('div.modal button.confirm')
```

### 推奨セレクタ（役割・テキストベース）
```typescript
// 役割（role）で取得 ★推奨
page.getByRole('button', { name: 'ログイン' })
page.getByRole('textbox', { name: 'ユーザーID' })
page.getByRole('checkbox', { name: '同意する' })
page.getByRole('link', { name: '詳細を見る' })

// ラベルで取得 ★推奨
page.getByLabel('パスワード')

// テキストで取得
page.getByText('ログイン')
page.getByText('エラーが発生しました', { exact: true })

// プレースホルダーで取得
page.getByPlaceholder('メールアドレスを入力')

// テストIDで取得
page.getByTestId('submit-button')
```

### 要素の絞り込み
```typescript
// 最初の要素
page.locator('.item').first()

// 最後の要素
page.locator('.item').last()

// N番目の要素（0始まり）
page.locator('.item').nth(2)

// フィルター（テキストで絞り込み）
page.locator('.item').filter({ hasText: '選択中' })

// フィルター（子要素で絞り込み）
page.locator('.card').filter({ has: page.locator('.selected') })

// 要素数を取得
const count = await page.locator('.item').count()

// 全要素を配列で取得
const items = await page.locator('.item').all()
```

---

## 3. 操作（Actions）

### クリック操作
```typescript
// 通常クリック
await page.locator('#btn-login').click()

// ダブルクリック
await page.locator('.item').dblclick()

// 右クリック
await page.locator('.item').click({ button: 'right' })

// 強制クリック（要素が隠れていても実行）
await page.locator('#hidden-btn').click({ force: true })
```

### 入力操作
```typescript
// テキスト入力（既存値をクリアして入力）★推奨
await page.locator('#user-id').fill('testuser')

// 1文字ずつ入力（タイピング模倣）
await page.locator('#search').type('検索キーワード')

// 入力欄をクリア
await page.locator('#user-id').clear()

// キー押下
await page.locator('#password').press('Enter')
await page.locator('#input').press('Control+a')
```

### 選択操作
```typescript
// セレクトボックス（値で選択）
await page.locator('#prefecture').selectOption('tokyo')

// セレクトボックス（ラベルで選択）
await page.locator('#prefecture').selectOption({ label: '東京都' })

// セレクトボックス（複数選択）
await page.locator('#items').selectOption(['item1', 'item2'])

// チェックボックスをON
await page.locator('#agree').check()

// チェックボックスをOFF
await page.locator('#agree').uncheck()

// チェック状態を設定
await page.locator('#agree').setChecked(true)
```

### その他の操作
```typescript
// ホバー（マウスオーバー）
await page.locator('.menu').hover()

// フォーカス
await page.locator('#input').focus()

// フォーカスを外す
await page.locator('#input').blur()

// スクロールして表示
await page.locator('#target').scrollIntoViewIfNeeded()

// ドラッグ＆ドロップ
await page.locator('#source').dragTo(page.locator('#target'))

// ファイルアップロード
await page.locator('input[type="file"]').setInputFiles('path/to/file.pdf')
```

---

## 4. 待機（Wait）

### 要素の待機
```typescript
// 要素が表示されるまで待機
await page.locator('.modal').waitFor({ state: 'visible' })

// 要素が非表示になるまで待機
await page.locator('.loading').waitFor({ state: 'hidden' })

// 要素がDOMから消えるまで待機
await page.locator('.modal').waitFor({ state: 'detached' })
```

### URL・ページ状態の待機
```typescript
// URLが変わるまで待機
await page.waitForURL('/dashboard')
await page.waitForURL('**/dashboard')

// ページ読み込み完了まで待機
await page.waitForLoadState('load')
await page.waitForLoadState('domcontentloaded')
await page.waitForLoadState('networkidle')

// 固定時間待機（非推奨、デバッグ用）
await page.waitForTimeout(1000)
```

---

## 5. 検証（Assertions）

### 要素の状態検証
```typescript
// 要素が表示されている
await expect(page.locator('.modal')).toBeVisible()

// 要素が非表示
await expect(page.locator('.loading')).toBeHidden()

// 要素が有効（操作可能）
await expect(page.locator('#btn-submit')).toBeEnabled()

// 要素が無効（グレーアウト）
await expect(page.locator('#btn-submit')).toBeDisabled()

// チェックボックスがON
await expect(page.locator('#agree')).toBeChecked()

// チェックボックスがOFF
await expect(page.locator('#agree')).not.toBeChecked()

// フォーカスされている
await expect(page.locator('#input')).toBeFocused()

// 入力可能
await expect(page.locator('#input')).toBeEditable()

// 空である
await expect(page.locator('#input')).toBeEmpty()
```

### テキスト・値の検証
```typescript
// テキストが一致
await expect(page.locator('.message')).toHaveText('登録完了')

// テキストを含む
await expect(page.locator('.message')).toContainText('完了')

// 入力値が一致
await expect(page.locator('#user-id')).toHaveValue('testuser')

// 入力値を含む（部分一致）
await expect(page.locator('#user-id')).toHaveValue(/test/)
```

### 属性・クラスの検証
```typescript
// 属性が一致
await expect(page.locator('#link')).toHaveAttribute('href', '/dashboard')

// クラスを持つ
await expect(page.locator('.item')).toHaveClass(/selected/)

// IDが一致
await expect(page.locator('.main')).toHaveId('main-content')

// CSSプロパティの検証
await expect(page.locator('.error')).toHaveCSS('color', 'rgb(255, 0, 0)')
```

### 要素数の検証
```typescript
// 要素数が一致
await expect(page.locator('.item')).toHaveCount(5)

// 要素が存在しない
await expect(page.locator('.error')).toHaveCount(0)
```

### ページの検証
```typescript
// URLが一致
await expect(page).toHaveURL('/dashboard')

// URLを含む
await expect(page).toHaveURL(/dashboard/)

// タイトルが一致
await expect(page).toHaveTitle('ダッシュボード')

// タイトルを含む
await expect(page).toHaveTitle(/ダッシュボード/)
```

### 否定（NOT）
```typescript
// 表示されていない
await expect(page.locator('.modal')).not.toBeVisible()

// テキストを含まない
await expect(page.locator('.message')).not.toContainText('エラー')

// URLではない
await expect(page).not.toHaveURL('/login')
```

---

## 6. テスト構造

### 基本構造
```typescript
import { test, expect } from '@playwright/test';

test.describe('テストグループ名', () => {

  test.beforeEach(async ({ page }) => {
    // 各テスト前の共通処理
    await page.goto('/login');
  });

  test.afterEach(async ({ page }) => {
    // 各テスト後の共通処理
  });

  test('テスト名', async ({ page }) => {
    // テスト処理
  });

});
```

### テストのスキップ・限定実行
```typescript
// テストをスキップ
test.skip('スキップするテスト', async ({ page }) => {});

// このテストのみ実行
test.only('このテストのみ実行', async ({ page }) => {});

// 条件付きスキップ
test('条件付きテスト', async ({ page, browserName }) => {
  test.skip(browserName === 'firefox', 'Firefoxでは未対応');
});
```

---

## 関数一覧（クイックリファレンス）

| カテゴリ | 関数 | 用途 |
|---------|------|------|
| ナビゲーション | `goto()` | ページを開く |
| | `reload()` | リロード |
| | `goBack()` | 戻る |
| セレクタ | `locator()` | CSS/属性で取得 |
| | `getByRole()` | 役割で取得★ |
| | `getByLabel()` | ラベルで取得★ |
| | `getByText()` | テキストで取得 |
| 絞り込み | `first()` | 最初の要素 |
| | `last()` | 最後の要素 |
| | `nth()` | N番目の要素 |
| | `filter()` | 条件で絞り込み |
| 操作 | `click()` | クリック |
| | `fill()` | テキスト入力★ |
| | `clear()` | クリア |
| | `selectOption()` | 選択 |
| | `check()` | チェックON |
| | `uncheck()` | チェックOFF |
| | `hover()` | ホバー |
| | `press()` | キー押下 |
| 待機 | `waitFor()` | 要素を待機 |
| | `waitForURL()` | URL変化を待機 |
| 検証 | `toBeVisible()` | 表示確認 |
| | `toBeHidden()` | 非表示確認 |
| | `toBeEnabled()` | 有効確認 |
| | `toBeDisabled()` | 無効確認 |
| | `toBeChecked()` | チェック確認 |
| | `toHaveText()` | テキスト一致 |
| | `toContainText()` | テキスト含む |
| | `toHaveValue()` | 値一致 |
| | `toHaveCount()` | 要素数確認 |
| | `toHaveURL()` | URL確認 |
| | `toHaveAttribute()` | 属性確認 |

★ = 推奨される書き方
