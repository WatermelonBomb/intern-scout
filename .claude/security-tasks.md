# 🔐 セキュリティ問題解決タスクリスト

## 概要
コードレビューで発見されたセキュリティ問題を解決するための詳細なタスクリストです。優先度順に整理し、各チケットには具体的な実装方法も含まれています。

---

## 🚨 緊急対応（1-2日以内）

### チケット #1: 認証トークン保存方法の変更
**優先度**: 🔴 最高
**工数**: 8-12時間

**現状の問題**:
- localStorageでJWTトークンを保存（XSS脆弱性）
- ユーザー情報もlocalStorageに保存

**対策**:
```typescript
// 現在のコード（脆弱）
localStorage.setItem('token', token);
localStorage.setItem('user', JSON.stringify(user));

// 推奨対策
// 1. httpOnlyクッキーでの保存（バックエンド実装）
// 2. メモリ内保存 + refresh tokenパターン
// 3. セキュアなsessionStorage使用
```

**影響ファイル**:
- `frontend/src/contexts/AuthContext.tsx`
- `frontend/src/lib/api.ts`
- `backend/app/controllers/sessions_controller.rb`

**完了条件**:
- [ ] httpOnlyクッキー実装
- [ ] localStorage削除
- [ ] トークンリフレッシュ機構
- [ ] セキュリティテスト実施

---

### チケット #2: CORS設定のセキュリティ強化
**優先度**: 🔴 最高
**工数**: 4-6時間

**現状の問題**:
```ruby
# 危険な設定
origins "localhost:3000", "127.0.0.1:3000", "localhost:3002", 
        "127.0.0.1:3002", "localhost:3004", "127.0.0.1:3004", 
        "localhost:3008", "127.0.0.1:3008", "localhost:3009", 
        "127.0.0.1:3009"
credentials: true
```

**対策実装**:
```ruby
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins -> { 
      if Rails.env.production?
        ENV['ALLOWED_ORIGINS']&.split(',') || []
      else
        ['localhost:3000', '127.0.0.1:3000']
      end
    }
    
    resource "*",
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: Rails.env.development?
  end
end
```

**影響ファイル**:
- `backend/config/initializers/cors.rb`
- `.env.production`（新規作成）

**完了条件**:
- [ ] 環境変数による制御実装
- [ ] 本番環境でのcredentials制御
- [ ] 開発環境と本番環境の分離
- [ ] 設定テスト

---

## ⚠️ 高優先度（3-5日以内）

### チケット #3: フォーム入力値バリデーション実装
**優先度**: 🟡 高
**工数**: 10-15時間

**現状の問題**:
- クライアント側バリデーション不足
- APIリクエスト前のデータ検証なし

**実装例**:
```typescript
// utils/validation.ts
export const validateJobForm = (data: JobFormData) => {
  const errors: Record<string, string> = {};
  
  if (!data.title?.trim()) {
    errors.title = 'タイトルは必須です';
  } else if (data.title.length > 100) {
    errors.title = 'タイトルは100文字以内で入力してください';
  }
  
  if (!data.description?.trim()) {
    errors.description = '説明は必須です';
  }
  
  // XSS対策：HTMLタグ検出
  const htmlPattern = /<[^>]*>/g;
  if (htmlPattern.test(data.description)) {
    errors.description = 'HTMLタグは使用できません';
  }
  
  return { isValid: Object.keys(errors).length === 0, errors };
};
```

**影響ファイル**:
- `frontend/src/app/jobs/page.tsx`
- `frontend/src/utils/validation.ts`（新規作成）
- `frontend/src/types/forms.ts`（新規作成）

**完了条件**:
- [ ] バリデーション関数実装
- [ ] フォーム送信前チェック
- [ ] エラーメッセージ表示
- [ ] 型安全性確保

---

### チケット #4: XSS対策サニタイゼーション強化
**優先度**: 🟡 高
**工数**: 8-12時間

**対策実装**:
```ruby
# Gemfileに追加
gem 'sanitize'

# app/models/concerns/sanitizable.rb
module Sanitizable
  extend ActiveSupport::Concern
  
  def sanitize_html(content)
    Sanitize.fragment(content, Sanitize::Config::RESTRICTED)
  end
end

# モデルでの使用例
class JobPosting < ApplicationRecord
  include Sanitizable
  
  before_save :sanitize_content
  
  private
  
  def sanitize_content
    self.description = sanitize_html(description) if description.present?
    self.requirements = sanitize_html(requirements) if requirements.present?
  end
end
```

**影響ファイル**:
- `backend/Gemfile`
- `backend/app/models/concerns/sanitizable.rb`（新規作成）
- `backend/app/models/job_posting.rb`
- `backend/app/controllers/*_controller.rb`

**完了条件**:
- [ ] Sanitizeライブラリ導入
- [ ] モデルレベルでのサニタイゼーション
- [ ] コントローラーでの入力チェック
- [ ] XSSテストケース作成

---

### チケット #5: 本番環境ログ制御
**優先度**: 🟡 高
**工数**: 6-8時間

**現状の問題**:
```typescript
// 本番環境で露出される危険なログ
console.error('Failed to load job postings:', error);
console.log('User data:', userData);
```

**対策実装**:
```typescript
// lib/logger.ts
class Logger {
  static error(message: string, error?: Error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(message, error);
    } else {
      // 本番環境では安全なログサービスに送信
      this.sendToLogService({ level: 'error', message, error: error?.message });
    }
  }
  
  static info(message: string, data?: any) {
    if (process.env.NODE_ENV === 'development') {
      console.log(message, data);
    }
    // 本番環境では重要な情報のみログ
  }
  
  private static sendToLogService(logData: any) {
    // 外部ログサービスまたはAPIエンドポイントに送信
  }
}
```

**完了条件**:
- [ ] Logger クラス実装
- [ ] console.* の置換
- [ ] 環境別ログレベル設定
- [ ] ログローテーション設定

---

## 📋 中優先度（1週間以内）

### チケット #6: APIレート制限機能追加
**優先度**: 🟢 中
**工数**: 6-10時間

**実装方法**:
```ruby
# Gemfileに追加
gem 'rack-attack'

# config/initializers/rack_attack.rb
class Rack::Attack
  # APIへの過度なリクエストを制限
  throttle('api/ip', limit: 100, period: 1.hour) do |req|
    req.ip if req.path.start_with?('/api/')
  end
  
  # ログイン試行回数制限
  throttle('login/email', limit: 5, period: 20.minutes) do |req|
    if req.path == '/api/v1/sessions' && req.post?
      req.params['email']
    end
  end
end
```

**完了条件**:
- [ ] rack-attack導入
- [ ] レート制限ルール設定
- [ ] Redis設定（必要に応じて）
- [ ] 制限時のエラーレスポンス

---

### チケット #7: Content Security Policy実装
**優先度**: 🟢 中
**工数**: 4-6時間

**実装例**:
```ruby
# config/application.rb or security initializer
config.force_ssl = true if Rails.env.production?

# CSP ヘッダー設定
config.middleware.use Rack::Protection, 
  reaction: :deny,
  content_security_policy: {
    default_src: "'self'",
    script_src: "'self' 'unsafe-inline'",
    style_src: "'self' 'unsafe-inline'",
    img_src: "'self' data: https:",
    connect_src: "'self'",
    font_src: "'self'",
    object_src: "'none'",
    media_src: "'self'",
    frame_src: "'none'"
  }
```

**完了条件**:
- [ ] CSPヘッダー実装
- [ ] フロントエンドとの互換性確認
- [ ] XSSテスト実施
- [ ] ブラウザサポート確認

---

### チケット #8: APIレスポンスフィルタリング
**優先度**: 🟢 中
**工数**: 8-12時間

**実装方法**:
```ruby
# app/serializers/user_serializer.rb
class UserSerializer < ActiveModel::Serializer
  attributes :id, :email, :name, :user_type
  
  # 機密情報は除外
  # password_digest, created_at, updated_at など
  
  def email
    # 管理者以外にはメールアドレスを部分的にマスク
    return object.email if scope&.admin?
    mask_email(object.email)
  end
  
  private
  
  def mask_email(email)
    local, domain = email.split('@')
    "#{local[0..1]}***@#{domain}"
  end
end
```

**完了条件**:
- [ ] Active Model Serializers導入
- [ ] 機密情報のフィルタリング
- [ ] ロール別レスポンス制御
- [ ] APIドキュメント更新

---

## 📊 進捗管理

### 全体スケジュール
- **Week 1**: チケット #1, #2 (緊急対応)
- **Week 2**: チケット #3, #4, #5 (高優先度)  
- **Week 3**: チケット #6, #7, #8 (中優先度)

### 工数見積もり
- **合計工数**: 64-91時間
- **緊急対応**: 12-18時間
- **高優先度**: 24-35時間
- **中優先度**: 18-28時間

### チェックリスト
各チケット完了時に以下を確認：
- [ ] セキュリティテスト実施
- [ ] パフォーマンス影響確認
- [ ] ドキュメント更新
- [ ] コードレビュー実施
- [ ] 本番環境デプロイ準備

---

## 🛠️ 開発環境セットアップ

### 必要なツール
```bash
# セキュリティテストツール
npm install -g @typescript-eslint/eslint-plugin
npm install -g eslint-plugin-security

# Ruby セキュリティチェック
gem install brakeman
gem install bundler-audit
```

### テスト実行
```bash
# フロントエンドセキュリティチェック
npm run security-check

# バックエンドセキュリティ監査
brakeman -o brakeman-report.json
bundle-audit check --update
```

---

**最終更新**: 2025-09-12
**作成者**: Claude Code Review Agent
**レビュー予定**: 実装完了後