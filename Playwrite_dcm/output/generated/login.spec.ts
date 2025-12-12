import { test, expect } from '@playwright/test';

/**
 * ログイン画面 テストコード
 * 画面ID: SCR-LOGIN-001
 */

test.describe('ログイン画面', () => {

  test.beforeEach(async ({ page }) => {
    // ログイン画面を開く
    await page.goto('https://omni-net.okasan.co.jp/web/rmfCmnCauSysLgiAction.do');

    // ログインフォームが表示されるまで待機
    await expect(page.locator('#rmfCmnCauSysLgiAuthWebDto')).toBeVisible();
  });

  test('TC-010: 正常ログイン', async ({ page }) => {
    // お客様コードを入力
    await page.locator('#passwd2').fill('1234567890');

    // ログインパスワードを入力
    await page.locator('#passwd1').fill('password123');

    // ログインボタンをクリック
    await page.locator("button[name='_ActionID'][value='buttonLogin']").click();

    // URL変更を待機（ログイン画面から遷移）
    await expect(page).not.toHaveURL('https://omni-net.okasan.co.jp/web/rmfCmnCauSysLgiAction.do');
  });

});
