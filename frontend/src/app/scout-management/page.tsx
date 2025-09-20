'use client';

import Link from 'next/link';

export default function ScoutManagementRedirect() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            スカウト機能が改善されました！
          </h2>
          <p className="text-gray-600 mb-6">
            より効率的な一括スカウト機能とスカウト管理機能をご利用ください。
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/bulk-scout"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 inline-block"
          >
            一括スカウト送信
          </Link>
          
          <Link
            href="/scout-campaigns"
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 inline-block"
          >
            スカウト管理・追跡
          </Link>
          
          <Link
            href="/scout-templates"
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 inline-block"
          >
            スカウトテンプレート管理
          </Link>
          
          <Link
            href="/dashboard"
            className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 inline-block"
          >
            ダッシュボードに戻る
          </Link>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <p>新機能の特徴：</p>
          <ul className="mt-2 space-y-1">
            <li>• 条件に合う学生を一括検索・選択</li>
            <li>• スカウトテンプレートで効率化</li>
            <li>• 送信結果の詳細な分析機能</li>
            <li>• キャンペーン単位での効果測定</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
