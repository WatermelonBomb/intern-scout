'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { dashboard } from '@/lib/api';

interface DashboardStats {
  received_messages?: number;
  unread_messages?: number;
  available_jobs?: number;
  conversations?: number;
  posted_jobs?: number;
  active_jobs?: number;
  sent_messages?: number;
  total_applications?: number;
  new_applications?: number;
  reviewed_applications?: number;
  accepted_applications?: number;
}

export default function DashboardPage() {
  const { user, company, loading, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({});
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      try {
        setStatsLoading(true);
        const response = await dashboard.stats();
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh', 
        backgroundColor: '#f9fafb' 
      }}>
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

  if (!user) {
    return null;
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Navigation */}
      <nav style={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            height: '64px' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                backgroundColor: '#2563eb', 
                borderRadius: '12px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>IS</span>
              </div>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>InternScout</span>
            </div>
            <div>
              <button
                onClick={logout}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  padding: '8px 16px', 
                  backgroundColor: 'transparent', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '8px', 
                  color: '#6b7280', 
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f9fafb';
                  e.target.style.color = '#374151';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#6b7280';
                }}
              >
                <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>ログアウト</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 16px' }}>
        {/* Header Section */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ 
              width: '64px', 
              height: '64px', 
              backgroundColor: '#2563eb', 
              borderRadius: '16px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}>
              <svg style={{ width: '32px', height: '32px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {user.user_type === 'student' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                )}
              </svg>
            </div>
            <div>
              <h1 style={{ 
                fontSize: '48px', 
                fontWeight: 'bold', 
                color: '#111827', 
                marginBottom: '8px',
                margin: 0
              }}>
                {user.user_type === 'student' ? 'マイダッシュボード' : '企業ダッシュボード'}
              </h1>
              <p style={{ 
                fontSize: '20px', 
                color: '#4b5563',
                margin: 0
              }}>
                {user.user_type === 'student' 
                  ? 'あなたのインターン活動を効率的に管理し、理想の企業を見つけましょう' 
                  : '優秀なインターン生を発見し、あなたの会社の未来を築きましょう'
                }
              </p>
            </div>
          </div>

          {/* Welcome Message */}
          <div style={{ 
            backgroundColor: '#2563eb', 
            borderRadius: '16px', 
            padding: '24px', 
            color: 'white',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  marginBottom: '8px',
                  margin: 0
                }}>
                  こんにちは、{user.full_name}さん！
                </h2>
                <p style={{ 
                  color: '#bfdbfe', 
                  fontSize: '18px',
                  margin: 0
                }}>
                  {user.user_type === 'student' 
                    ? '新しいスカウトメッセージやインターン機会をチェックしましょう。'
                    : '今日も素晴らしい人材との出会いが待っています。'
                  }
                </p>
              </div>
              <div style={{ display: window.innerWidth >= 1024 ? 'block' : 'none' }}>
                <div style={{ 
                  width: '96px', 
                  height: '96px', 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <svg style={{ width: '48px', height: '48px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: window.innerWidth >= 1280 ? 'repeat(4, 1fr)' : window.innerWidth >= 1024 ? 'repeat(3, 1fr)' : window.innerWidth >= 768 ? 'repeat(2, 1fr)' : '1fr',
          gap: '24px', 
          marginBottom: '48px' 
        }}>
          {user.user_type === 'student' ? (
            <>
              <div 
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                  borderRadius: '16px', 
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.2)', 
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onClick={() => router.push('/messages')}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.02)';
                  e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
                }}
              >
                <div style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ 
                      width: '56px', 
                      height: '56px', 
                      background: 'linear-gradient(to right, #dbeafe, #e0e7ff)', 
                      borderRadius: '16px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      transition: 'all 0.3s'
                    }}>
                      <svg style={{ height: '28px', width: '28px', color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ 
                        width: '8px', 
                        height: '8px', 
                        backgroundColor: '#22c55e', 
                        borderRadius: '50%',
                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                      }}></div>
                      <span style={{ fontSize: '12px', color: '#059669', fontWeight: '500' }}>LIVE</span>
                    </div>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <h3 style={{ 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      color: '#4b5563', 
                      marginBottom: '4px',
                      margin: 0
                    }}>
                      受信メッセージ
                    </h3>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
                      {statsLoading ? (
                        <div style={{ 
                          width: '48px', 
                          height: '32px', 
                          backgroundColor: '#e5e7eb',
                          borderRadius: '4px',
                          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                        }}></div>
                      ) : (
                        `${stats.received_messages || 0}件`
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px', color: '#6b7280' }}>
                    <span>メッセージを確認</span>
                    <svg style={{ 
                      marginLeft: '4px', 
                      width: '16px', 
                      height: '16px',
                      transition: 'transform 0.2s'
                    }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                <div style={{ height: '4px', backgroundColor: '#2563eb' }}></div>
              </div>

              <div 
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                  borderRadius: '16px', 
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.2)', 
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onClick={() => router.push('/jobs')}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.02)';
                  e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
                }}
              >
                <div style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ 
                      width: '56px', 
                      height: '56px', 
                      background: 'linear-gradient(to right, #dcfce7, #d1fae5)', 
                      borderRadius: '16px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      transition: 'all 0.3s'
                    }}>
                      <svg style={{ height: '28px', width: '28px', color: '#16a34a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                      </svg>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ 
                        width: '8px', 
                        height: '8px', 
                        backgroundColor: '#f59e0b', 
                        borderRadius: '50%'
                      }}></div>
                      <span style={{ fontSize: '12px', color: '#d97706', fontWeight: '500' }}>HOT</span>
                    </div>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <h3 style={{ 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      color: '#4b5563', 
                      marginBottom: '4px',
                      margin: 0
                    }}>
                      利用可能な求人
                    </h3>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
                      {statsLoading ? (
                        <div style={{ 
                          width: '48px', 
                          height: '32px', 
                          backgroundColor: '#e5e7eb',
                          borderRadius: '4px',
                          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                        }}></div>
                      ) : (
                        `${stats.available_jobs || 0}件`
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px', color: '#6b7280' }}>
                    <span>求人を見る</span>
                    <svg style={{ 
                      marginLeft: '4px', 
                      width: '16px', 
                      height: '16px',
                      transition: 'transform 0.2s'
                    }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                <div style={{ height: '4px', background: 'linear-gradient(to right, #16a34a, #22c55e)' }}></div>
              </div>

              {/* Tech Stack Search Card */}
              <div 
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                  borderRadius: '16px', 
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.2)', 
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onClick={() => router.push('/search/tech')}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.02)';
                  e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
                }}
              >
                <div style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ 
                      width: '56px', 
                      height: '56px', 
                      background: 'linear-gradient(to right, #fef3c7, #fed7aa)', 
                      borderRadius: '16px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      transition: 'all 0.3s'
                    }}>
                      <svg style={{ height: '28px', width: '28px', color: '#f59e0b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ 
                        width: '8px', 
                        height: '8px', 
                        backgroundColor: '#8b5cf6', 
                        borderRadius: '50%'
                      }}></div>
                      <span style={{ fontSize: '12px', color: '#7c3aed', fontWeight: '500' }}>NEW</span>
                    </div>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <h3 style={{ 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      color: '#4b5563', 
                      marginBottom: '4px',
                      margin: 0
                    }}>
                      技術で企業検索
                    </h3>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                      使いたい技術から企業を発見
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px', color: '#6b7280' }}>
                    <span>技術検索を始める</span>
                    <svg style={{ 
                      marginLeft: '4px', 
                      width: '16px', 
                      height: '16px',
                      transition: 'transform 0.2s'
                    }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                <div style={{ height: '4px', background: 'linear-gradient(to right, #f59e0b, #fbbf24)' }}></div>
              </div>
            </>
          ) : (
            <>
              <div 
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                  borderRadius: '16px', 
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.2)', 
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onClick={() => router.push('/jobs')}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.02)';
                  e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
                }}
              >
                <div style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ 
                      width: '56px', 
                      height: '56px', 
                      background: 'linear-gradient(to right, #fef3c7, #fed7aa)', 
                      borderRadius: '16px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      transition: 'all 0.3s'
                    }}>
                      <svg style={{ height: '28px', width: '28px', color: '#d97706' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                      </svg>
                    </div>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <h3 style={{ 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      color: '#4b5563', 
                      marginBottom: '4px',
                      margin: 0
                    }}>
                      投稿した求人
                    </h3>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
                      {statsLoading ? (
                        <div style={{ 
                          width: '48px', 
                          height: '32px', 
                          backgroundColor: '#e5e7eb',
                          borderRadius: '4px',
                          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                        }}></div>
                      ) : (
                        `${stats.posted_jobs || 0}件`
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px', color: '#6b7280' }}>
                    <span>求人管理</span>
                    <svg style={{ 
                      marginLeft: '4px', 
                      width: '16px', 
                      height: '16px',
                      transition: 'transform 0.2s'
                    }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                <div style={{ height: '4px', background: 'linear-gradient(to right, #d97706, #f59e0b)' }}></div>
              </div>

              <div 
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                  borderRadius: '16px', 
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.2)', 
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onClick={() => router.push('/messages')}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.02)';
                  e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
                }}
              >
                <div style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ 
                      width: '56px', 
                      height: '56px', 
                      background: 'linear-gradient(to right, #dbeafe, #e0e7ff)', 
                      borderRadius: '16px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      transition: 'all 0.3s'
                    }}>
                      <svg style={{ height: '28px', width: '28px', color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                      </svg>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ 
                        width: '8px', 
                        height: '8px', 
                        backgroundColor: '#22c55e', 
                        borderRadius: '50%',
                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                      }}></div>
                      <span style={{ fontSize: '12px', color: '#059669', fontWeight: '500' }}>LIVE</span>
                    </div>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <h3 style={{ 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      color: '#4b5563', 
                      marginBottom: '4px',
                      margin: 0
                    }}>
                      送信メッセージ
                    </h3>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
                      {statsLoading ? (
                        <div style={{ 
                          width: '48px', 
                          height: '32px', 
                          backgroundColor: '#e5e7eb',
                          borderRadius: '4px',
                          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                        }}></div>
                      ) : (
                        `${stats.sent_messages || 0}件`
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px', color: '#6b7280' }}>
                    <span>メッセージ履歴</span>
                    <svg style={{ 
                      marginLeft: '4px', 
                      width: '16px', 
                      height: '16px',
                      transition: 'transform 0.2s'
                    }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                <div style={{ height: '4px', backgroundColor: '#2563eb' }}></div>
              </div>
            </>
          )}
        </div>

        {/* Recent Activity */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '16px', 
          padding: '32px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: '#111827', 
            marginBottom: '24px',
            margin: '0 0 24px 0'
          }}>
            最近のアクティビティ
          </h2>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '48px', 
            color: '#6b7280' 
          }}>
            <div style={{ textAlign: 'center' }}>
              <svg style={{ 
                width: '48px', 
                height: '48px', 
                margin: '0 auto 16px auto',
                color: '#d1d5db'
              }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p style={{ margin: 0 }}>アクティビティがありません</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}