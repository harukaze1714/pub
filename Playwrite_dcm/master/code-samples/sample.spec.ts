import { test, expect } from '@playwright/test';

/**
 * サンプルテストコード
 * このファイルの書き方・命名規則に従ってテストコードを生成してください
 */

test.describe('見積選択モーダル', () => {

  test.beforeEach(async ({ page }) => {
    // テスト前の共通処理
    await page.goto('/estimate');
  });

  test('見積一覧が表示される', async ({ page }) => {
    // モーダルを開く
    await page.click('#btn-open-estimate-modal');

    // モーダルが表示されるまで待機
    await expect(page.locator('.modal-estimate')).toBeVisible();

    // 見積一覧が存在することを確認
    const estimateList = page.locator('.estimate-list-item');
    await expect(estimateList).toHaveCount(3);
  });

  test('見積を選択できる', async ({ page }) => {
    // モーダルを開く
    await page.click('#btn-open-estimate-modal');
    await expect(page.locator('.modal-estimate')).toBeVisible();

    // 1件目の見積を選択
    await page.click('.estimate-list-item >> nth=0');

    // 選択状態になることを確認
    await expect(page.locator('.estimate-list-item >> nth=0')).toHaveClass(/selected/);

    // 確定ボタンをクリック
    await page.click('#btn-confirm-estimate');

    // モーダルが閉じることを確認
    await expect(page.locator('.modal-estimate')).not.toBeVisible();
  });

  test('キャンセルでモーダルを閉じる', async ({ page }) => {
    // モーダルを開く
    await page.click('#btn-open-estimate-modal');
    await expect(page.locator('.modal-estimate')).toBeVisible();

    // キャンセルボタンをクリック
    await page.click('#btn-cancel-estimate');

    // モーダルが閉じることを確認
    await expect(page.locator('.modal-estimate')).not.toBeVisible();
  });

});

test.describe('機種選択モーダル', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/device');
  });

  test('機種を検索して選択できる', async ({ page }) => {
    // モーダルを開く
    await page.click('#btn-open-device-modal');
    await expect(page.locator('.modal-device')).toBeVisible();

    // 検索キーワードを入力
    await page.fill('#input-device-search', 'iPhone');

    // 検索ボタンをクリック
    await page.click('#btn-device-search');

    // 検索結果を待機
    await expect(page.locator('.device-list-item')).toHaveCount(5);

    // 1件目を選択
    await page.click('.device-list-item >> nth=0');

    // 確定
    await page.click('#btn-confirm-device');

    // モーダルが閉じる
    await expect(page.locator('.modal-device')).not.toBeVisible();
  });

});
