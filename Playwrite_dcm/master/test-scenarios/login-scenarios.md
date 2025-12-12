# ログイン画面 テストシナリオ

## 対象画面
- 画面ID: SCR-LOGIN-001
- 画面名: ログイン画面
- 画面仕様: .\screen-spec\login-screen.json
---

## TC-010: 正常ログイン

### 前提条件
- なし

### 手順
1. [開く] https://omni-net.okasan.co.jp/web/rmfCmnCauSysLgiAction.do
2. [待機] #rmfCmnCauSysLgiAuthWebDto が表示される
3. [入力] #passwd2 に 1234567890 を入力
4. [入力] #passwd1 に password123 を入力
5. [クリック] button[name='_ActionID'][value='buttonLogin']
6. [待機] URL変更

### 期待結果
- ホーム画面に遷移する
- URLがログイン画面のURLから変わっている
