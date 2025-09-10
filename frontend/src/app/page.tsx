'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <div style={{ 
          width: '32px', 
          height: '32px', 
          border: '2px solid #e5e7eb', 
          borderTop: '2px solid #2563eb', 
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'white', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                backgroundColor: '#2563eb', 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '20px' }}>IS</span>
              </div>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>InternScout</span>
            </div>
            <nav style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Link
                href="/login"
                style={{ 
                  color: '#4b5563', 
                  fontWeight: '500', 
                  padding: '8px 12px', 
                  textDecoration: 'none',
                  borderRadius: '6px',
                  transition: 'color 0.2s'
                }}
              >
                ログイン
              </Link>
              <Link
                href="/signup"
                style={{ 
                  backgroundColor: '#2563eb', 
                  color: 'white', 
                  padding: '8px 24px', 
                  borderRadius: '8px', 
                  fontWeight: '500', 
                  textDecoration: 'none',
                  transition: 'background-color 0.2s'
                }}
              >
                新規登録
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section style={{ 
          background: 'linear-gradient(to bottom, #eff6ff, white)', 
          padding: '80px 0' 
        }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
            <div style={{ textAlign: 'center' }}>
              <h1 style={{ 
                fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
                fontWeight: 'bold', 
                color: '#111827', 
                marginBottom: '24px',
                lineHeight: '1.2'
              }}>
                インターン生と企業を
                <br />
                <span style={{ color: '#2563eb' }}>つなぐ</span>
                プラットフォーム
              </h1>
              <p style={{ 
                fontSize: '20px', 
                color: '#4b5563', 
                marginBottom: '40px', 
                maxWidth: '768px', 
                margin: '0 auto 40px auto',
                lineHeight: '1.6'
              }}>
                InternScoutは、優秀なインターン生と成長企業をマッチングする新しいスカウトサービスです。
                あなたのキャリアの次のステップを見つけませんか？
              </p>
              <div style={{ 
                display: 'flex', 
                flexDirection: window.innerWidth < 640 ? 'column' : 'row', 
                gap: '16px', 
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Link
                  href="/signup?type=student"
                  style={{ 
                    display: 'inline-block',
                    backgroundColor: '#2563eb', 
                    color: 'white', 
                    padding: '16px 32px', 
                    borderRadius: '8px', 
                    fontSize: '18px', 
                    fontWeight: '500', 
                    textDecoration: 'none',
                    transition: 'background-color 0.2s'
                  }}
                >
                  学生として登録
                </Link>
                <Link
                  href="/signup?type=company"
                  style={{ 
                    display: 'inline-block',
                    border: '2px solid #2563eb', 
                    color: '#2563eb', 
                    padding: '14px 32px', 
                    borderRadius: '8px', 
                    fontSize: '18px', 
                    fontWeight: '500', 
                    textDecoration: 'none',
                    backgroundColor: 'transparent',
                    transition: 'background-color 0.2s'
                  }}
                >
                  企業として登録
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section style={{ padding: '80px 0', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <h2 style={{ fontSize: '36px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>
                InternScoutの特徴
              </h2>
              <p style={{ fontSize: '18px', color: '#4b5563', maxWidth: '768px', margin: '0 auto' }}>
                最新のテクノロジーと人材マッチングの専門知識を組み合わせ、最高のインターン体験をお届けします。
              </p>
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(3, 1fr)', 
              gap: '32px' 
            }}>
              <div style={{ textAlign: 'center', padding: '24px' }}>
                <div style={{ 
                  width: '64px', 
                  height: '64px', 
                  backgroundColor: '#dbeafe', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '0 auto 24px auto' 
                }}>
                  <svg style={{ width: '32px', height: '32px', color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                  スマートマッチング
                </h3>
                <p style={{ color: '#4b5563' }}>
                  スキルや興味に基づいて、最適なインターン生と企業をマッチング
                </p>
              </div>
              
              <div style={{ textAlign: 'center', padding: '24px' }}>
                <div style={{ 
                  width: '64px', 
                  height: '64px', 
                  backgroundColor: '#dcfce7', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '0 auto 24px auto' 
                }}>
                  <svg style={{ width: '32px', height: '32px', color: '#16a34a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                  ダイレクトメッセージ
                </h3>
                <p style={{ color: '#4b5563' }}>
                  企業から学生へ直接スカウトメッセージを送信可能
                </p>
              </div>
              
              <div style={{ textAlign: 'center', padding: '24px' }}>
                <div style={{ 
                  width: '64px', 
                  height: '64px', 
                  backgroundColor: '#f3e8ff', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '0 auto 24px auto' 
                }}>
                  <svg style={{ width: '32px', height: '32px', color: '#9333ea' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                  成長機会
                </h3>
                <p style={{ color: '#4b5563' }}>
                  実践的なインターンシップで実務経験を積める
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section style={{ padding: '80px 0', backgroundColor: '#2563eb' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 style={{ fontSize: '36px', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>
                信頼される実績
              </h2>
              <p style={{ fontSize: '20px', color: '#bfdbfe' }}>
                多くの学生と企業に選ばれ続けています
              </p>
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: window.innerWidth < 768 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', 
              gap: '32px', 
              textAlign: 'center' 
            }}>
              <div>
                <div style={{ fontSize: '48px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>1,500+</div>
                <div style={{ color: '#bfdbfe' }}>登録学生数</div>
              </div>
              <div>
                <div style={{ fontSize: '48px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>300+</div>
                <div style={{ color: '#bfdbfe' }}>参加企業数</div>
              </div>
              <div>
                <div style={{ fontSize: '48px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>95%</div>
                <div style={{ color: '#bfdbfe' }}>マッチング成功率</div>
              </div>
              <div>
                <div style={{ fontSize: '48px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>24h</div>
                <div style={{ color: '#bfdbfe' }}>平均マッチング時間</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section style={{ padding: '80px 0', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '1024px', margin: '0 auto', textAlign: 'center', padding: '0 16px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 'bold', color: '#111827', marginBottom: '24px' }}>
              今すぐ始めましょう
            </h2>
            <p style={{ fontSize: '20px', color: '#4b5563', marginBottom: '40px' }}>
              あなたの可能性を最大限に引き出すインターンシップがここにあります。
              未来への第一歩を踏み出してください。
            </p>
            
            <div style={{ 
              display: 'flex', 
              flexDirection: window.innerWidth < 640 ? 'column' : 'row', 
              gap: '16px', 
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Link
                href="/signup?type=student"
                style={{ 
                  display: 'inline-block',
                  backgroundColor: '#2563eb', 
                  color: 'white', 
                  padding: '16px 40px', 
                  borderRadius: '8px', 
                  fontSize: '20px', 
                  fontWeight: '500', 
                  textDecoration: 'none',
                  transition: 'background-color 0.2s'
                }}
              >
                学生として始める
              </Link>
              <Link
                href="/signup?type=company"
                style={{ 
                  display: 'inline-block',
                  border: '2px solid #2563eb', 
                  color: '#2563eb', 
                  padding: '14px 40px', 
                  borderRadius: '8px', 
                  fontSize: '20px', 
                  fontWeight: '500', 
                  textDecoration: 'none',
                  backgroundColor: 'transparent',
                  transition: 'background-color 0.2s'
                }}
              >
                企業として始める
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: '#111827', color: '#d1d5db', padding: '48px 0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                backgroundColor: '#2563eb', 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>IS</span>
              </div>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>InternScout</span>
            </div>
            <p style={{ color: '#9ca3af', marginBottom: '24px' }}>
              インターン生と企業の出会いを創造し、日本の成長を支える人材エコシステムの構築を目指しています。
            </p>
            <div style={{ borderTop: '1px solid #374151', paddingTop: '24px' }}>
              <p style={{ color: '#6b7280' }}>
                &copy; 2024 InternScout. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
