# InternScout

> **企業とインターン生をつなぐプラットフォーム**

InternScoutは、企業が優秀なインターン生を見つけ、学生が理想的なインターンシップ機会を発見できるプラットフォームです。Rails API + Next.jsで構築された現代的なWebアプリケーションです。

![InternScout](https://img.shields.io/badge/Status-MVP%20Complete-brightgreen)
![Rails](https://img.shields.io/badge/Rails-8.0.2-red)
![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## 🎯 主要機能

### 👨‍🎓 学生向け機能
- **プロフィール管理** - スキル、大学情報、自己紹介の編集
- **スカウト受信** - 企業からのスカウトメッセージを受信・確認
- **求人閲覧** - インターンシップ求人情報の検索・詳細表示

### 🏢 企業向け機能
- **学生検索** - スキル、大学、卒業年での学生フィルタリング
- **スカウト送信** - 気になる学生へのダイレクトメッセージ
- **求人管理** - インターン求人の投稿・編集・削除

### 🔐 共通機能
- **認証システム** - JWT認証によるセキュアなログイン
- **ダッシュボード** - ユーザータイプ別のカスタマイズ画面
- **レスポンシブデザイン** - PC・タブレット・スマートフォン対応

## 🛠️ 技術スタック

### バックエンド
- **Ruby on Rails 8.0.2** (API モード)
- **PostgreSQL** - メインデータベース
- **JWT認証** - トークンベースの認証
- **bcrypt** - パスワードハッシュ化
- **rack-cors** - Cross-Origin Resource Sharing

### フロントエンド
- **Next.js 15.5.2** - React フレームワーク
- **TypeScript** - 型安全な開発
- **Tailwind CSS** - ユーティリティファーストCSS
- **Axios** - HTTP クライアント
- **React Context** - 状態管理

## 🚀 クイックスタート

### 必要な環境
- **Node.js** 18.0以上
- **Ruby** 3.2.0以上
- **PostgreSQL** 14.0以上
- **Git**

### 1. リポジトリのクローン
```bash
git clone https://github.com/WatermelonBomb/intern-scout.git
cd intern-scout
```

### 2. バックエンドのセットアップ
```bash
cd backend
bundle install
rails db:create
rails db:migrate
rails server -p 3001
```

### 3. フロントエンドのセットアップ
```bash
cd ../frontend
npm install
npm run dev
```

### 4. アクセス
- **フロントエンド**: http://localhost:3008
- **バックエンド API**: http://localhost:3001

## 📋 データベース設計

### Users テーブル
- `id` - プライマリキー
- `email` - メールアドレス (ユニーク)
- `password_digest` - ハッシュ化パスワード
- `first_name`, `last_name` - 名前
- `user_type` - ユーザータイプ ('student' | 'company')
- `university`, `graduation_year`, `bio`, `skills` - 学生情報

### Companies テーブル
- `id` - プライマリキー
- `user_id` - ユーザー外部キー
- `name` - 会社名
- `industry` - 業界
- `description`, `website`, `location` - 会社詳細

### Messages テーブル
- `id` - プライマリキー
- `sender_id`, `receiver_id` - 送受信者
- `subject`, `content` - メッセージ内容
- `read`, `read_at` - 既読情報

### JobPostings テーブル
- `id` - プライマリキー
- `company_id` - 会社外部キー
- `title`, `description`, `requirements` - 求人詳細
- `employment_type`, `location`, `salary_range` - 雇用条件

## 🔌 API エンドポイント

### 認証
- `POST /api/v1/auth/signup` - ユーザー登録
- `POST /api/v1/auth/login` - ログイン
- `DELETE /api/v1/auth/logout` - ログアウト

### ユーザー管理
- `GET /api/v1/users` - ユーザー一覧 (学生のみ)
- `GET /api/v1/users/search` - 学生検索
- `PUT /api/v1/users/:id` - プロフィール更新

### メッセージング
- `GET /api/v1/messages` - メッセージ一覧
- `POST /api/v1/messages` - メッセージ送信
- `PATCH /api/v1/messages/:id/mark_as_read` - 既読マーク

### 求人管理
- `GET /api/v1/job_postings` - 求人一覧
- `POST /api/v1/job_postings` - 求人投稿
- `PUT /api/v1/job_postings/:id` - 求人編集
- `DELETE /api/v1/job_postings/:id` - 求人削除

## 🎨 使用方法

### 学生ユーザーの場合
1. **アカウント作成** - 学生として新規登録
2. **プロフィール設定** - スキル・大学情報を入力
3. **スカウト確認** - 企業からのメッセージを確認
4. **求人検索** - 興味のある求人を検索・閲覧

### 企業ユーザーの場合
1. **アカウント作成** - 企業として新規登録
2. **会社情報設定** - 会社詳細・業界情報を入力
3. **学生検索** - 条件に合う学生を検索
4. **スカウト送信** - 気になる学生にメッセージ送信
5. **求人投稿** - インターン求人を投稿・管理

## 🔒 セキュリティ

- **JWT認証** - トークンベースの安全な認証
- **パスワードハッシュ化** - bcryptによる強固なハッシュ
- **CORS設定** - 適切なCross-Origin制御
- **入力検証** - フロント・バックエンド双方での検証

## 🤝 開発への参加

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルをご覧ください。

## 🙏 謝辞

- [Ruby on Rails](https://rubyonrails.org/) - 強力なWebフレームワーク
- [Next.js](https://nextjs.org/) - 現代的なReactフレームワーク
- [Tailwind CSS](https://tailwindcss.com/) - ユーティリティファーストCSS
- [PostgreSQL](https://postgresql.org/) - 信頼性の高いデータベース

---

**InternScout** - 企業とインターン生の理想的なマッチングを実現するプラットフォーム

[![GitHub](https://img.shields.io/badge/GitHub-WatermelonBomb/intern--scout-blue?logo=github)](https://github.com/WatermelonBomb/intern-scout)