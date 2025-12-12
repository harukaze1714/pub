# AI × Playwright E2Eテスト自動化 プロジェクト計画書

## 1. プロジェクト概要

### 1.1 目的
既存のVBAベース自動化ツールを、AIによるテストコード生成に置き換える。

### 1.2 現状（As-Is）
```
試験仕様書 + 画面情報 → VBA → Playwrightテストコード
```

### 1.3 目標（To-Be）
```
試験仕様書 + 画面情報（JSON） + Playwrightコードサンプル → AI（Claude） → Playwrightテストコード
```

### 1.4 ゴール
**既存VBAが生成しているテストコードと同等のものをAIで生成できること**

---

## 2. システム構成

### 2.1 入力の分類

#### マスタデータ（定期メンテナンス）
| 入力 | 形式 | 説明 |
|------|------|------|
| 画面仕様 | JSON | 操作対象・セレクタ・画面遷移 |
| Playwright関数リファレンス | Markdown | 使用可能な関数一覧 |
| Playwrightコードサンプル | .ts | 書き方の参考となるコード例 |

#### 都度入力（ユーザーが毎回指定）
| 入力 | 形式 | 説明 |
|------|------|------|
| 試験手順 | テキスト | やりたい操作の流れ |

### 2.2 処理フロー
```
┌─────────────────────────────────┐
│  マスタデータ（事前登録済み）    │
│  ┌───────────┐ ┌───────────┐   │
│  │ 画面仕様  │ │コードサンプル│   │
│  │  (JSON)   │ │   (.ts)    │   │
│  └─────┬─────┘ └─────┬─────┘   │
└────────┼─────────────┼──────────┘
         │             │
         └──────┬──────┘
                ↓
        ┌───────────────┐
        │  プロンプト   │ ← マスタを組み込み済み
        └───────┬───────┘
                │
┌───────────────┼───────────────┐
│  都度入力     ↓               │
│  ┌───────────────────────┐   │
│  │ 試験手順（ユーザー入力）│   │
│  └───────────┬───────────┘   │
└──────────────┼────────────────┘
               ↓
      ┌─────────────────┐
      │  AI（Claude）   │
      └────────┬────────┘
               ↓
      ┌─────────────────┐
      │ Playwrightコード │
      └─────────────────┘
```

### 2.3 ディレクトリ構成
```
Playwrite_dcm/
├── master/                           # マスタデータ（定期メンテ）
│   ├── screen-spec/                  # 画面仕様（JSON形式）
│   │   └── {screen-name}-screen.json
│   ├── code-samples/                 # Playwrightコードサンプル
│   │   ├── playwright-functions.md       # 関数リファレンス
│   │   └── sample.spec.ts                # 書き方サンプル
│   └── test-scenarios/               # テストシナリオ（Markdown形式）
│       └── {screen-name}-scenarios.md
├── output/
│   └── generated/                    # AI生成テストコード
├── prompts/
│   └── generate-test.md              # プロンプトテンプレート
└── PROJECT_PLAN.md
```

※ 試験手順はテストシナリオファイルから参照、または都度入力

---

## 3. 画面仕様書（screen-spec）のルール

### 3.1 ファイル形式
- **形式**: JSON（`.json`）
- **命名規則**: `{画面名}-screen.json`（例: `login-screen.json`）
- **文字コード**: UTF-8

### 3.2 JSON構造
```json
{
  "screenId": "SCR-XXX-001",
  "screenName": "画面名",
  "url": "画面URL",
  "formAction": "フォームのaction属性",
  "formMethod": "POST|GET",
  "formId": "フォームのID",
  "elements": {
    "inputs": [],
    "buttons": [],
    "checkboxes": [],
    "links": [],
    "hiddenFields": [],
    "messages": []
  },
  "transitions": {},
  "testScenarios": {},
  "waitConditions": {},
  "metadata": {}
}
```

### 3.3 elements.inputs の構造
```json
{
  "id": "要素の論理ID（テスト内で参照用）",
  "name": "HTMLのname属性",
  "selector": "主要セレクタ（#id推奨）",
  "altSelectors": ["代替セレクタ1", "代替セレクタ2"],
  "type": "text|password|email|number|...",
  "label": "日本語ラベル",
  "placeholder": "プレースホルダー",
  "maxLength": 10,
  "tabIndex": 10,
  "required": true,
  "validation": {
    "pattern": "正規表現パターン",
    "minLength": 1,
    "errorMessage": "エラーメッセージ"
  }
}
```

### 3.4 elements.buttons の構造
```json
{
  "id": "要素の論理ID",
  "selector": "主要セレクタ",
  "altSelectors": ["代替セレクタ"],
  "type": "submit|button",
  "label": "ボタンラベル",
  "tabIndex": 40,
  "action": "submit|click|...",
  "purpose": "機能の説明（任意）"
}
```

### 3.5 elements.links の構造
```json
{
  "id": "要素の論理ID",
  "selector": "主要セレクタ",
  "label": "リンクテキスト",
  "url": "リンク先URL",
  "target": "_blank|_self"
}
```

### 3.6 transitions の構造
```json
{
  "onSuccess": {
    "description": "成功時の説明",
    "destination": "遷移先画面名"
  },
  "onFailure": {
    "description": "失敗時の説明",
    "destination": "遷移先画面名"
  }
}
```

### 3.7 testScenarios の構造
```json
{
  "scenarioName": {
    "steps": [
      {"action": "fill|click|check|wait", "target": "セレクタ", "value": "値（任意）", "description": "説明"}
    ]
  }
}
```

### 3.8 waitConditions の構造
```json
{
  "conditionName": {
    "selector": "待機対象セレクタ",
    "state": "visible|enabled|hidden|attached"
  }
}
```

---

## 4. セレクタのルール

### 4.1 優先順位
1. **#id** - IDセレクタ（最優先）
2. **[name='xxx']** - name属性
3. **[placeholder='xxx']** - placeholder属性
4. **.class** - クラスセレクタ
5. **button:has-text('xxx')** - テキスト含むセレクタ

### 4.2 altSelectors
主セレクタが失敗した場合に試す代替セレクタを配列で定義

---

## 5. テストコード生成ルール

1. `master/code-samples/` のコードサンプルの書き方・命名規則に従う
2. 画面仕様JSONのセレクタを正確に使用
3. `selector` が失敗した場合は `altSelectors` を試す
4. 試験手順を忠実にコード化
5. 適切なwait処理を入れる

---

## 6. HTMLから画面仕様JSONを作成する際のルール

1. **入力フィールド**: `<input>`, `<select>`, `<textarea>` を抽出
2. **ボタン**: `<button>`, `input[type="submit"]` を抽出
3. **リンク**: 重要な `<a>` タグを抽出（ナビゲーション用は除外可）
4. **hidden**: フォーム送信に必要な `<input type="hidden">` を記録
5. **セレクタ**: id > name > placeholder > class の優先順位で決定
6. **altSelectors**: 複数の特定方法がある場合は代替セレクタとして記録

---

## 7. テストシナリオ（test-scenarios）のルール

### 7.1 ファイル形式
- **形式**: Markdown（`.md`）
- **命名規則**: `{画面名}-scenarios.md`（例: `login-scenarios.md`）
- **文字コード**: UTF-8
- **保存場所**: `master/test-scenarios/`

### 7.2 テストシナリオの構造
```markdown
# {画面名} テストシナリオ

## 対象画面
- 画面ID: {画面仕様JSONのscreenId}
- 画面名: {画面名}
- 画面仕様: {対応するJSONファイル名}

---

## TC-XXX: {テストケース名}

### 前提条件
- {テスト実行前の状態}

### 手順
1. {操作1}
2. {操作2}
3. ...

### 期待結果
- {確認項目1}
- {確認項目2}
```

### 7.3 テストケースID命名規則
- **TC-001**: 画面表示確認系
- **TC-002〜099**: 正常系テスト
- **TC-100〜199**: 異常系テスト（バリデーション等）
- **TC-200〜299**: 境界値テスト
- **TC-300〜**: その他

### 7.4 記述ルール
1. **手順は具体的に**: 「入力する」ではなく「〇〇に『xxx』を入力」
2. **期待結果は検証可能に**: 曖昧な表現を避ける
3. **画面仕様JSONとの整合性**: セレクタやラベルは画面仕様と一致させる
4. **1シナリオ1目的**: 複数の目的を混ぜない

---

## 8. AI用プロンプト設計

### 8.1 プロンプト構成
```
【役割】
Playwrightテストコード生成の専門家

【入力情報】
1. Playwright関数リファレンス（使える関数一覧）
2. コードサンプル（書き方の参考）
3. 画面仕様JSON（セレクタ・要素一覧）
4. 試験手順（やりたいこと）

【出力】
Playwrightテストコード（.spec.ts）

【ルール】
- 関数リファレンスに記載された関数のみ使用
- コードサンプルの書き方・命名規則に従う
- 画面仕様JSONのセレクタを正確に使用
- selectorが失敗した場合はaltSelectorsを試す
- 試験手順を忠実にコード化
- 適切なwait処理を入れる
```

### 8.2 プロンプト例
```markdown
# Playwrightテストコード生成

## Playwright関数リファレンス
{playwright-functions.mdの内容}

## コードサンプル（この書き方に従ってください）
```typescript
{sample.spec.tsの内容}
```

## 画面仕様（JSON）
{画面仕様JSONの内容}

## 試験手順
{試験手順の内容}

## 指示
上記の情報をもとに、コードサンプルと同じ書き方で
Playwrightテストコードを生成してください。
```

---

## 9. 作業ステップ

### Step 1: マスタデータ整備（初回のみ）
- [ ] 既存の画面仕様をJSON形式で `master/screen-spec/` に配置
- [ ] 動作するPlaywrightコードサンプルを `master/code-samples/` に配置
- [ ] Playwright関数リファレンスを `master/code-samples/playwright-functions.md` に配置
- [ ] テストシナリオを `master/test-scenarios/` に配置

### Step 2: プロンプト作成（初回のみ）
- [ ] マスタデータを組み込んだプロンプトテンプレート作成
- [ ] `prompts/generate-test.md` に保存

### Step 3: 生成・検証
- [ ] ユーザーが試験手順をClaude Codeに入力
- [ ] AIがテストコード生成
- [ ] 既存VBA生成コードと比較・動作確認

### Step 4: 調整
- [ ] プロンプト改善
- [ ] 再生成・検証の繰り返し

---

## 10. 成功基準

| 基準 | 内容 |
|------|------|
| 機能等価 | VBA生成コードと同じ操作ができる |
| 実行可能 | `npx playwright test` で動作する |
| 再現性 | 同じ入力から安定したコード生成 |

---

## 11. 運用フロー

### 初回セットアップ（1回のみ）
1. **画面仕様JSON**を `master/screen-spec/` に配置
2. **Playwrightコードサンプル**を `master/code-samples/sample.spec.ts` に配置
3. **Playwright関数リファレンス**を `master/code-samples/playwright-functions.md` に配置
4. **テストシナリオ**を `master/test-scenarios/` に配置
5. **プロンプトテンプレート**を `prompts/generate-test.md` に作成

### 通常運用（毎回）
1. ユーザーが**試験手順**をClaude Codeに入力（またはテストシナリオファイルを参照）
2. AIがテストコード生成
3. 生成コードを `output/generated/` に保存
4. 生成コードを確認・実行

---

## 付録: 入力ファイルテンプレート

### 画面仕様JSONテンプレート（master/screen-spec/example.json）
```json
{
  "screenId": "SCR-LOGIN-001",
  "screenName": "ログイン画面",
  "url": "/login",
  "formAction": "/auth/login",
  "formMethod": "POST",
  "formId": "loginForm",
  "elements": {
    "inputs": [
      {
        "id": "userId",
        "name": "user-id",
        "selector": "#user-id",
        "altSelectors": ["[name='user-id']", "[placeholder='ユーザーID']"],
        "type": "text",
        "label": "ユーザーID",
        "placeholder": "ユーザーID",
        "required": true
      },
      {
        "id": "password",
        "name": "password",
        "selector": "#password",
        "altSelectors": ["[name='password']"],
        "type": "password",
        "label": "パスワード",
        "required": true
      }
    ],
    "buttons": [
      {
        "id": "loginButton",
        "selector": "#btn-login",
        "altSelectors": ["button:has-text('ログイン')"],
        "type": "submit",
        "label": "ログイン",
        "action": "submit"
      }
    ],
    "links": [],
    "hiddenFields": [],
    "messages": []
  },
  "transitions": {
    "onSuccess": {
      "description": "ログイン成功",
      "destination": "ダッシュボード画面"
    },
    "onFailure": {
      "description": "ログイン失敗（エラー表示）",
      "destination": "ログイン画面"
    }
  },
  "testScenarios": {},
  "waitConditions": {},
  "metadata": {}
}
```

### 試験手順テンプレート
```markdown
# テスト: 正常ログイン

## 前提条件
- ログイン画面を開いている

## 手順
1. ユーザーIDに「admin」を入力
2. パスワードに「password」を入力
3. ログインボタンをクリック

## 期待結果
- ダッシュボード画面に遷移する
- URLが /dashboard になる
```
