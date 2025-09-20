# InternScout

> **次世代の技術重視型インターンマッチングプラットフォーム**

InternScoutは、技術スタックを軸とした革新的なマッチングシステムを搭載し、企業が優秀なエンジニアインターン生を発見し、学生が理想的な技術環境でのインターンシップ機会を見つけられるプラットフォームです。Rails API + Next.jsで構築された現代的なWebアプリケーションです。

![InternScout](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Rails](https://img.shields.io/badge/Rails-8.0.2-red)
![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue)
![Tech Stack Search](https://img.shields.io/badge/Tech%20Stack%20Search-Active-orange)

## 🎯 主要機能

### 🔍 技術スタック検索（**ENHANCED**）
- **高度な技術マッチング** - 必須・歓迎・除外技術による精密な検索
- **企業技術スタック検索** - 特定技術を使用する企業の発見
- **求人技術フィルタ** - 技術要件に基づく求人検索
- **マッチングスコア算出** - AI による技術適合度の自動計算
- **トレンド技術表示** - 市場で人気の技術の可視化
- **リアルタイム検索UI** - 直感的で高速な検索インターフェース
- **データベース最適化** - パフォーマンス向上のためのクエリ最適化

### 👨‍🎓 学生向け機能
- **技術プロフィール管理** - プログラミング言語、フレームワーク、ツールの登録
- **技術興味登録** - 学習したい技術の管理と推薦システム
- **スカウト受信・管理** - 企業からの技術スカウトの受信・対応
- **求人応募システム** - ワンクリック応募と応募状況追跡
- **学習パス提案** - 企業の技術スタックに基づく学習ロードマップ

### 🏢 企業向け機能
- **高度な学生検索** - 技術スキル、大学、専攻、経験レベルでの多面的検索
- **技術スタック管理** - 自社で使用する技術の詳細登録・管理
- **スマートスカウト** - AI による候補者の自動レコメンド
- **スカウトテンプレート** - 再利用可能なメッセージテンプレートの作成・管理
- **一括スカウト機能** - 複数の学生への効率的なスカウト送信
- **応募管理ダッシュボード** - 応募者の一元管理と選考プロセス追跡

### 💬 コミュニケーション機能
- **リアルタイムメッセージング** - 学生・企業間の直接コミュニケーション
- **会話スレッド管理** - 継続的な対話の整理・追跡
- **既読・未読管理** - メッセージ状態の可視化
- **通知システム** - 重要なアクティビティのリアルタイム通知

### 📊 分析・管理機能
- **統合ダッシュボード** - アクティビティとパフォーマンスの可視化
- **マッチング分析** - 成功率と改善点の分析
- **技術トレンド分析** - 市場動向と需要の把握
- **選考プロセス管理** - カスタマイズ可能な採用フロー

### 🔐 セキュリティ・認証
- **JWT認証** - セキュアなトークンベース認証
- **ロールベースアクセス制御** - 学生・企業権限の厳密な管理
- **データ保護** - 個人情報の暗号化と安全な保存
- **レスポンシブデザイン** - 全デバイス対応の現代的UI

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
- **Heroicons** - 高品質SVGアイコンライブラリ
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
rails db:seed # 推奨: デモアカウントと技術データセットを読み込み
rails server -p 3000
```

### 3. フロントエンドのセットアップ
```bash
cd ../frontend
npm install
npm run dev
```

### 4. アクセス
- **フロントエンド**: http://localhost:3001
- **バックエンド API**: http://localhost:3000
- **技術スタック検索**: http://localhost:3001/search/tech

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

### Technologies テーブル (**NEW**)
- `id` - プライマリキー
- `name` - 技術名
- `category` - カテゴリ（frontend, backend, database, etc.）
- `description` - 技術説明
- `popularity_score`, `market_demand_score` - 人気度・需要スコア

### CompanyTechStacks テーブル (**NEW**)
- `id` - プライマリキー
- `company_id` - 会社外部キー
- `technology_id` - 技術外部キー
- `proficiency_level` - 習熟度レベル

### StudentTechInterests テーブル (**NEW**)
- `id` - プライマリキー
- `user_id` - 学生外部キー
- `technology_id` - 技術外部キー
- `interest_level` - 興味レベル

### Invitations テーブル (**NEW**)
- `id` - プライマリキー
- `company_id`, `student_id` - 送受信者
- `job_posting_id` - 関連求人
- `message` - スカウトメッセージ
- `status` - ステータス（sent, accepted, rejected）

### ScoutTemplates テーブル (**NEW**)
- `id` - プライマリキー
- `company_id` - 会社外部キー
- `name`, `subject`, `message` - テンプレート内容

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

### 技術スタック管理 (**NEW**)
- `GET /api/v1/technologies` - 技術一覧
- `GET /api/v1/technologies/trending` - トレンド技術
- `POST /api/v1/search/companies` - 技術による企業検索
- `POST /api/v1/search/jobs` - 技術による求人検索

### スカウト機能 (**NEW**)
- `GET /api/v1/invitations` - スカウト一覧
- `POST /api/v1/invitations` - スカウト送信
- `POST /api/v1/invitations/bulk_create` - 一括スカウト
- `PATCH /api/v1/invitations/:id/accept` - スカウト受諾
- `PATCH /api/v1/invitations/:id/reject` - スカウト拒否

### スカウトテンプレート (**NEW**)
- `GET /api/v1/scout_templates` - テンプレート一覧
- `POST /api/v1/scout_templates` - テンプレート作成
- `PATCH /api/v1/scout_templates/:id` - テンプレート編集
- `POST /api/v1/scout_templates/:id/clone` - テンプレート複製

### 学生検索 (**NEW**)
- `GET /api/v1/students` - 学生検索（企業向け）
- `GET /api/v1/students/filter_options` - 検索フィルタオプション

### ダッシュボード (**NEW**)
- `GET /api/v1/dashboard/stats` - 統計情報

## 🎨 使用方法

### 🎓 学生ユーザーの場合
1. **アカウント作成** - 学生として新規登録
2. **技術プロフィール設定** - 習得済み技術・興味技術を詳細入力
3. **大学・専攻情報登録** - 学歴・卒業予定年度の設定
4. **技術スタック検索** - `/search/tech` で理想的な技術環境の企業を発見
5. **スカウト受信・対応** - 企業からの技術スカウトの確認・返信
6. **求人応募** - 技術要件に合致する求人への応募
7. **学習パス確認** - 企業の技術スタックに基づく学習計画の取得

### 🏢 企業ユーザーの場合
1. **アカウント作成** - 企業として新規登録
2. **会社情報設定** - 企業詳細・業界・所在地情報を入力
3. **技術スタック登録** - 自社で使用している技術の詳細登録
4. **学生検索** - 技術スキル・大学・専攻での高度な学生検索
5. **スカウトテンプレート作成** - 再利用可能なスカウトメッセージの作成
6. **ターゲットスカウト** - 個別または一括での学生スカウト送信
7. **求人投稿・管理** - 技術要件を含むインターン求人の投稿
8. **応募管理** - 学生からの応募の一元管理と選考プロセス追跡

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

## 🌟 主要ページ

### 学生向けページ
- **ホーム**: `/` - ランディングページ・機能紹介
- **ダッシュボード**: `/dashboard` - アクティビティ概要・統計情報
- **技術スタック検索**: `/search/tech` - 企業の技術スタック検索
- **プロフィール**: `/profile` - 個人情報・技術スキル管理
- **求人一覧**: `/jobs` - インターン求人の検索・閲覧
- **応募履歴**: `/my-applications` - 応募状況の追跡
- **スカウト**: `/invitations` - 企業からのスカウト管理
- **メッセージ**: `/messages` - 企業との双方向コミュニケーション

### 企業向けページ
- **学生検索**: `/search` - 高度な学生検索・フィルタリング
- **スカウト管理**: `/scout-management` - 送信済みスカウトの管理
- **一括スカウト**: `/bulk-scout` - 複数学生への効率的スカウト
- **スカウトテンプレート**: `/scout-templates` - メッセージテンプレート管理
- **応募管理**: `/applications` - 学生からの応募の一元管理
- **求人管理**: `/jobs` - インターン求人の投稿・編集

---

**InternScout** - 技術を軸とした次世代インターンマッチングプラットフォーム

[![GitHub](https://img.shields.io/badge/GitHub-WatermelonBomb/intern--scout-blue?logo=github)](https://github.com/WatermelonBomb/intern-scout)
