import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 静的ファイルのキャッシュ設定
  async headers() {
    return [
      {
        source: '/(.*)\\.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // APIリクエストをRailsサーバーにプロキシ
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/api/:path*',
      },
    ];
  },

  // ワークスペースルート警告の解決
  outputFileTracingRoot: process.cwd(),

  // 画像最適化
  images: {
    formats: ['image/webp', 'image/avif'],
  },

};

export default nextConfig;
