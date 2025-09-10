'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      let errorMessage = 'ログインに失敗しました';
      
      if (err.response?.data?.errors) {
        if (Array.isArray(err.response.data.errors)) {
          errorMessage = err.response.data.errors[0];
        } else {
          errorMessage = err.response.data.errors;
        }
      } else if (err.response?.status === 401) {
        errorMessage = 'メールアドレスまたはパスワードが正しくありません';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #eff6ff 0%, white 50%, #f9fafb 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      position: 'relative'
    }}>
      {/* Background Elements */}
      <div style={{
        position: 'absolute',
        top: '-160px',
        right: '-128px',
        width: '384px',
        height: '384px',
        borderRadius: '50%',
        background: 'linear-gradient(to right, rgba(147, 197, 253, 0.3), rgba(196, 181, 253, 0.3))',
        filter: 'blur(48px)',
        zIndex: 0
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '-128px',
        left: '-128px',
        width: '384px',
        height: '384px',
        borderRadius: '50%',
        background: 'linear-gradient(to right, rgba(196, 181, 253, 0.3), rgba(147, 197, 253, 0.3))',
        filter: 'blur(48px)',
        zIndex: 0
      }}></div>

      <div style={{ 
        position: 'relative', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh', 
        padding: '48px 16px',
        zIndex: 1
      }}>
        <div style={{ maxWidth: '448px', width: '100%' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                backgroundColor: '#2563eb', 
                borderRadius: '16px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
              }}>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '24px' }}>IS</span>
              </div>
            </div>
            <h1 style={{ 
              fontSize: '48px', 
              fontWeight: 'bold', 
              color: '#111827', 
              marginBottom: '16px',
              lineHeight: '1.2'
            }}>
              おかえりなさい
            </h1>
            <p style={{ 
              fontSize: '18px', 
              color: '#4b5563', 
              marginBottom: '24px',
              lineHeight: '1.6'
            }}>
              アカウントにログインして、素晴らしいインターン体験を続けましょう
            </p>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px', 
              fontSize: '14px', 
              color: '#6b7280' 
            }}>
              <span>まだアカウントをお持ちでない方は</span>
              <Link 
                href="/signup" 
                style={{ 
                  fontWeight: '500', 
                  color: '#2563eb', 
                  textDecoration: 'none',
                  transition: 'color 0.2s'
                }}
              >
                新規登録
              </Link>
            </div>
          </div>

          {/* Demo Credentials */}
          <div style={{ 
            marginBottom: '32px', 
            padding: '24px', 
            background: 'linear-gradient(to right, #eff6ff, #f3e8ff)', 
            borderRadius: '16px', 
            border: '1px solid #e0e7ff',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ width: '8px', height: '8px', backgroundColor: '#2563eb', borderRadius: '50%' }}></div>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1e3a8a', margin: 0 }}>
                デモアカウントでお試しください
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '12px', 
                backgroundColor: 'rgba(255, 255, 255, 0.6)', 
                borderRadius: '12px' 
              }}>
                <div>
                  <div style={{ fontWeight: '500', color: '#111827' }}>学生アカウント</div>
                  <div style={{ color: '#4b5563' }}>test@example.com</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#6b7280' }}>password:</div>
                  <div style={{ fontFamily: 'monospace', color: '#374151' }}>password123</div>
                </div>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '12px', 
                backgroundColor: 'rgba(255, 255, 255, 0.6)', 
                borderRadius: '12px' 
              }}>
                <div>
                  <div style={{ fontWeight: '500', color: '#111827' }}>企業アカウント</div>
                  <div style={{ color: '#4b5563' }}>company@example.com</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#6b7280' }}>password:</div>
                  <div style={{ fontFamily: 'monospace', color: '#374151' }}>password123</div>
                </div>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <div style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.8)', 
            backdropFilter: 'blur(8px)',
            borderRadius: '24px', 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.2)', 
            padding: '32px' 
          }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {error && (
                <div style={{ 
                  borderRadius: '8px', 
                  backgroundColor: '#fef2f2', 
                  padding: '16px', 
                  border: '1px solid #fecaca' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ flexShrink: 0 }}>
                      <svg style={{ height: '20px', width: '20px', color: '#dc2626' }} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div style={{ marginLeft: '12px' }}>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: '#991b1b', margin: 0 }}>
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label htmlFor="email" style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: '#374151', 
                    marginBottom: '8px' 
                  }}>
                    メールアドレス
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '12px',
                        outline: 'none',
                        backgroundColor: 'white',
                        color: '#111827',
                        fontSize: '16px',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#2563eb';
                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                      placeholder="your@example.com"
                    />
                    <div style={{ 
                      position: 'absolute', 
                      right: '12px', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      pointerEvents: 'none' 
                    }}>
                      <svg style={{ height: '20px', width: '20px', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="password" style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: '#374151', 
                    marginBottom: '8px' 
                  }}>
                    パスワード
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '12px',
                        outline: 'none',
                        backgroundColor: 'white',
                        color: '#111827',
                        fontSize: '16px',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#2563eb';
                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                      placeholder="パスワードを入力してください"
                    />
                    <div style={{ 
                      position: 'absolute', 
                      right: '12px', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      pointerEvents: 'none' 
                    }}>
                      <svg style={{ height: '20px', width: '20px', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ paddingTop: '16px' }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ 
                    position: 'relative',
                    width: '100%', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    padding: '16px 24px', 
                    border: 'none', 
                    fontSize: '18px', 
                    fontWeight: '500', 
                    borderRadius: '12px', 
                    color: 'white', 
                    backgroundColor: loading ? '#9ca3af' : '#2563eb',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s',
                    boxShadow: loading ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    transform: loading ? 'none' : 'scale(1)',
                    boxSizing: 'border-box'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.target.style.transform = 'scale(1.02)';
                      e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                    }
                  }}
                >
                  {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        marginRight: '12px'
                      }}></div>
                      <span>ログイン中...</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span>ログイン</span>
                      <svg style={{ 
                        marginLeft: '8px', 
                        width: '20px', 
                        height: '20px',
                        transition: 'transform 0.2s'
                      }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  )}
                </button>
              </div>

              <div style={{ textAlign: 'center', paddingTop: '16px' }}>
                <Link 
                  href="/" 
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    fontSize: '14px', 
                    color: '#4b5563', 
                    textDecoration: 'none',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#111827';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#4b5563';
                  }}
                >
                  <svg style={{ 
                    width: '16px', 
                    height: '16px', 
                    marginRight: '8px',
                    transition: 'transform 0.2s'
                  }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  トップページに戻る
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}