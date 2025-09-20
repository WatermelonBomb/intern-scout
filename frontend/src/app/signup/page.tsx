'use client';

import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import type { ApiErrorResponse } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password_confirmation: '',
    first_name: '',
    last_name: '',
    user_type: 'student' as 'student' | 'company',
    // Student fields
    university: '',
    graduation_year: '',
    bio: '',
    skills: '',
    // Company fields
    company_name: '',
    industry: '',
    company_description: '',
    website: '',
    location: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  const { signup } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const typeParam = params.get('type');

    if (typeParam === 'company' || typeParam === 'student') {
      setFormData(prev => ({
        ...prev,
        user_type: typeParam,
      }));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, value: string) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.password_confirmation) {
      setError('パスワードが一致しません');
      setLoading(false);
      return;
    }

    try {
      const signupData = {
        ...formData,
        graduation_year: formData.graduation_year ? Number(formData.graduation_year) : undefined
      };
      await signup(signupData);
      router.push('/dashboard');
    } catch (err) {
      if (isAxiosError<ApiErrorResponse>(err)) {
        const responseErrors = err.response?.data?.errors;
        if (Array.isArray(responseErrors)) {
          setError(responseErrors.join(', '));
        } else if (responseErrors) {
          setError(responseErrors);
        } else {
          setError('登録に失敗しました');
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('登録に失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      // Validate basic info
      if (!formData.email || !formData.password || !formData.first_name || !formData.last_name) {
        setError('必須項目を入力してください');
        return;
      }
      if (formData.password !== formData.password_confirmation) {
        setError('パスワードが一致しません');
        return;
      }
    }
    setError('');
    setCurrentStep(2);
  };

  const prevStep = () => {
    setError('');
    setCurrentStep(1);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #eff6ff 0%, white 50%, #eef2ff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 16px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '448px', width: '100%' }}>
        {/* Header */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#2563eb',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ color: 'white', fontWeight: 'bold', fontSize: '20px' }}>IS</span>
            </div>
          </div>
          <h2 style={{
            marginTop: '24px',
            textAlign: 'center',
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '8px'
          }}>
            {formData.user_type === 'student' ? '学生として登録' : '企業として登録'}
          </h2>
          <p style={{
            marginTop: '8px',
            textAlign: 'center',
            fontSize: '14px',
            color: '#4b5563'
          }}>
            すでにアカウントをお持ちの方は{' '}
            <Link href="/login" style={{ 
              fontWeight: '500', 
              color: '#2563eb', 
              textDecoration: 'none' 
            }}>
              ログイン
            </Link>
          </p>
        </div>

        {/* Progress indicator */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '16px',
          marginTop: '32px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: '500',
            backgroundColor: currentStep >= 1 ? '#2563eb' : '#e5e7eb',
            color: currentStep >= 1 ? 'white' : '#6b7280'
          }}>
            1
          </div>
          <div style={{
            width: '48px',
            height: '1px',
            backgroundColor: currentStep >= 2 ? '#2563eb' : '#e5e7eb'
          }}></div>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: '500',
            backgroundColor: currentStep >= 2 ? '#2563eb' : '#e5e7eb',
            color: currentStep >= 2 ? 'white' : '#6b7280'
          }}>
            2
          </div>
        </div>

        <form style={{ marginTop: '32px' }} onSubmit={handleSubmit}>
          {error && (
            <div style={{
              borderRadius: '8px',
              backgroundColor: '#fef2f2',
              padding: '16px',
              marginBottom: '24px',
              border: '1px solid #fecaca'
            }}>
              <div style={{ display: 'flex' }}>
                <div style={{ flexShrink: 0 }}>
                  <svg style={{ height: '20px', width: '20px', color: '#dc2626' }} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div style={{ marginLeft: '12px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#991b1b', margin: 0 }}>
                    {error}
                  </h3>
                </div>
              </div>
            </div>
          )}

          {/* User type selector */}
          <div style={{
            display: 'flex',
            borderRadius: '8px',
            backgroundColor: '#f3f4f6',
            padding: '4px',
            marginBottom: '24px'
          }}>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, user_type: 'student' }))}
              style={{
                flex: 1,
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: formData.user_type === 'student' ? 'white' : 'transparent',
                color: formData.user_type === 'student' ? '#2563eb' : '#4b5563',
                boxShadow: formData.user_type === 'student' ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' : 'none'
              }}
            >
              学生
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, user_type: 'company' }))}
              style={{
                flex: 1,
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: formData.user_type === 'company' ? 'white' : 'transparent',
                color: formData.user_type === 'company' ? '#2563eb' : '#4b5563',
                boxShadow: formData.user_type === 'company' ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' : 'none'
              }}
            >
              企業
            </button>
          </div>

          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: '#374151',
                    marginBottom: '4px'
                  }}>姓</label>
                  <input
                    name="last_name"
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => handleInputChange(e, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      outline: 'none',
                      fontSize: '14px',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      (e.target as HTMLElement).style.borderColor = '#2563eb';
                      (e.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                    }}
                    onBlur={(e) => {
                      (e.target as HTMLElement).style.borderColor = '#d1d5db';
                      (e.target as HTMLElement).style.boxShadow = 'none';
                    }}
                    placeholder="田中"
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: '#374151',
                    marginBottom: '4px'
                  }}>名</label>
                  <input
                    name="first_name"
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => handleInputChange(e, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      outline: 'none',
                      fontSize: '14px',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      (e.target as HTMLElement).style.borderColor = '#2563eb';
                      (e.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                    }}
                    onBlur={(e) => {
                      (e.target as HTMLElement).style.borderColor = '#d1d5db';
                      (e.target as HTMLElement).style.boxShadow = 'none';
                    }}
                    placeholder="太郎"
                  />
                </div>
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#374151',
                  marginBottom: '4px'
                }}>メールアドレス</label>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange(e, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    outline: 'none',
                    fontSize: '14px',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    (e.target as HTMLElement).style.borderColor = '#2563eb';
                    (e.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                  }}
                  onBlur={(e) => {
                    (e.target as HTMLElement).style.borderColor = '#d1d5db';
                    (e.target as HTMLElement).style.boxShadow = 'none';
                  }}
                  placeholder="your@example.com"
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#374151',
                  marginBottom: '4px'
                }}>パスワード</label>
                <input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => handleInputChange(e, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    outline: 'none',
                    fontSize: '14px',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    (e.target as HTMLElement).style.borderColor = '#2563eb';
                    (e.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                  }}
                  onBlur={(e) => {
                    (e.target as HTMLElement).style.borderColor = '#d1d5db';
                    (e.target as HTMLElement).style.boxShadow = 'none';
                  }}
                  placeholder="8文字以上"
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#374151',
                  marginBottom: '4px'
                }}>パスワード確認</label>
                <input
                  name="password_confirmation"
                  type="password"
                  required
                  value={formData.password_confirmation}
                  onChange={(e) => handleInputChange(e, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    outline: 'none',
                    fontSize: '14px',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    (e.target as HTMLElement).style.borderColor = '#2563eb';
                    (e.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                  }}
                  onBlur={(e) => {
                    (e.target as HTMLElement).style.borderColor = '#d1d5db';
                    (e.target as HTMLElement).style.boxShadow = 'none';
                  }}
                  placeholder="パスワードを再入力"
                />
              </div>

              <button
                type="button"
                onClick={nextStep}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  padding: '12px 16px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  borderRadius: '8px',
                  color: 'white',
                  backgroundColor: '#2563eb',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  marginTop: '8px'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = '#1d4ed8';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = '#2563eb';
                }}
              >
                次へ
              </button>
            </div>
          )}

          {/* Step 2: Profile Information */}
          {currentStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {formData.user_type === 'student' ? (
                <>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      color: '#374151',
                      marginBottom: '4px'
                    }}>大学名</label>
                    <input
                      name="university"
                      type="text"
                      value={formData.university}
                      onChange={(e) => handleInputChange(e, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        outline: 'none',
                        fontSize: '14px',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        (e.target as HTMLElement).style.borderColor = '#2563eb';
                        (e.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                      }}
                      onBlur={(e) => {
                        (e.target as HTMLElement).style.borderColor = '#d1d5db';
                        (e.target as HTMLElement).style.boxShadow = 'none';
                      }}
                      placeholder="東京大学"
                    />
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      color: '#374151',
                      marginBottom: '4px'
                    }}>卒業予定年</label>
                    <input
                      name="graduation_year"
                      type="number"
                      min="2024"
                      max="2030"
                      value={formData.graduation_year}
                      onChange={(e) => handleInputChange(e, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        outline: 'none',
                        fontSize: '14px',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        (e.target as HTMLElement).style.borderColor = '#2563eb';
                        (e.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                      }}
                      onBlur={(e) => {
                        (e.target as HTMLElement).style.borderColor = '#d1d5db';
                        (e.target as HTMLElement).style.boxShadow = 'none';
                      }}
                      placeholder="2025"
                    />
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      color: '#374151',
                      marginBottom: '4px'
                    }}>スキル</label>
                    <input
                      name="skills"
                      type="text"
                      value={formData.skills}
                      onChange={(e) => handleInputChange(e, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        outline: 'none',
                        fontSize: '14px',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        (e.target as HTMLElement).style.borderColor = '#2563eb';
                        (e.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                      }}
                      onBlur={(e) => {
                        (e.target as HTMLElement).style.borderColor = '#d1d5db';
                        (e.target as HTMLElement).style.boxShadow = 'none';
                      }}
                      placeholder="JavaScript, React, Python（カンマ区切り）"
                    />
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      color: '#374151',
                      marginBottom: '4px'
                    }}>自己紹介</label>
                    <textarea
                      name="bio"
                      rows={4}
                      value={formData.bio}
                      onChange={(e) => handleInputChange(e, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        outline: 'none',
                        fontSize: '14px',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        boxSizing: 'border-box',
                        resize: 'vertical',
                        fontFamily: 'inherit'
                      }}
                      onFocus={(e) => {
                        (e.target as HTMLElement).style.borderColor = '#2563eb';
                        (e.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                      }}
                      onBlur={(e) => {
                        (e.target as HTMLElement).style.borderColor = '#d1d5db';
                        (e.target as HTMLElement).style.boxShadow = 'none';
                      }}
                      placeholder="あなたの経験や興味について教えてください"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      color: '#374151',
                      marginBottom: '4px'
                    }}>会社名 *</label>
                    <input
                      name="company_name"
                      type="text"
                      required
                      value={formData.company_name}
                      onChange={(e) => handleInputChange(e, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        outline: 'none',
                        fontSize: '14px',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        (e.target as HTMLElement).style.borderColor = '#2563eb';
                        (e.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                      }}
                      onBlur={(e) => {
                        (e.target as HTMLElement).style.borderColor = '#d1d5db';
                        (e.target as HTMLElement).style.boxShadow = 'none';
                      }}
                      placeholder="株式会社サンプル"
                    />
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      color: '#374151',
                      marginBottom: '4px'
                    }}>業界 *</label>
                    <input
                      name="industry"
                      type="text"
                      required
                      value={formData.industry}
                      onChange={(e) => handleInputChange(e, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        outline: 'none',
                        fontSize: '14px',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        (e.target as HTMLElement).style.borderColor = '#2563eb';
                        (e.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                      }}
                      onBlur={(e) => {
                        (e.target as HTMLElement).style.borderColor = '#d1d5db';
                        (e.target as HTMLElement).style.boxShadow = 'none';
                      }}
                      placeholder="IT・ソフトウェア"
                    />
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      color: '#374151',
                      marginBottom: '4px'
                    }}>所在地</label>
                    <input
                      name="location"
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange(e, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        outline: 'none',
                        fontSize: '14px',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        (e.target as HTMLElement).style.borderColor = '#2563eb';
                        (e.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                      }}
                      onBlur={(e) => {
                        (e.target as HTMLElement).style.borderColor = '#d1d5db';
                        (e.target as HTMLElement).style.boxShadow = 'none';
                      }}
                      placeholder="東京都渋谷区"
                    />
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      color: '#374151',
                      marginBottom: '4px'
                    }}>ウェブサイト</label>
                    <input
                      name="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange(e, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        outline: 'none',
                        fontSize: '14px',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        (e.target as HTMLElement).style.borderColor = '#2563eb';
                        (e.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                      }}
                      onBlur={(e) => {
                        (e.target as HTMLElement).style.borderColor = '#d1d5db';
                        (e.target as HTMLElement).style.boxShadow = 'none';
                      }}
                      placeholder="https://example.com"
                    />
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      color: '#374151',
                      marginBottom: '4px'
                    }}>会社紹介</label>
                    <textarea
                      name="company_description"
                      rows={4}
                      value={formData.company_description}
                      onChange={(e) => handleInputChange(e, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        outline: 'none',
                        fontSize: '14px',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        boxSizing: 'border-box',
                        resize: 'vertical',
                        fontFamily: 'inherit'
                      }}
                      onFocus={(e) => {
                        (e.target as HTMLElement).style.borderColor = '#2563eb';
                        (e.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                      }}
                      onBlur={(e) => {
                        (e.target as HTMLElement).style.borderColor = '#d1d5db';
                        (e.target as HTMLElement).style.boxShadow = 'none';
                      }}
                      placeholder="会社の事業内容や文化について教えてください"
                    />
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={prevStep}
                  style={{
                    flex: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    fontSize: '14px',
                    fontWeight: '500',
                    borderRadius: '8px',
                    color: '#374151',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.backgroundColor = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.backgroundColor = 'white';
                  }}
                >
                  戻る
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '12px 16px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '500',
                    borderRadius: '8px',
                    color: 'white',
                    backgroundColor: loading ? '#9ca3af' : '#2563eb',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s',
                    opacity: loading ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      (e.target as HTMLElement).style.backgroundColor = '#1d4ed8';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      (e.target as HTMLElement).style.backgroundColor = '#2563eb';
                    }
                  }}
                >
                  {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        marginRight: '8px'
                      }}></div>
                      登録中...
                    </div>
                  ) : (
                    '登録'
                  )}
                </button>
              </div>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Link href="/" style={{ 
              fontSize: '14px', 
              color: '#4b5563', 
              textDecoration: 'none' 
            }}>
              ← トップページに戻る
            </Link>
          </div>
        </form>
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
