'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { users } from '@/lib/api';
import { getErrorMessage, validateEmail, validateRequired } from '@/lib/errorHandler';

export default function ProfilePage() {
  const { user, company, loading } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    university: '',
    graduation_year: '',
    bio: '',
    skills: '',
    // Company fields
    name: '',
    industry: '',
    description: '',
    website: '',
    location: '',
  });
  
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        university: user.university || '',
        graduation_year: user.graduation_year?.toString() || '',
        bio: user.bio || '',
        skills: user.skills || '',
        // Company fields
        name: company?.name || '',
        industry: company?.industry || '',
        description: company?.description || '',
        website: company?.website || '',
        location: company?.location || '',
      });
    }
  }, [user, company]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage(null);

    try {
      const updateData: any = {
        first_name: formData.first_name,
        last_name: formData.last_name,
      };

      // Add student-specific fields
      if (user.user_type === 'student') {
        updateData.university = formData.university;
        updateData.graduation_year = formData.graduation_year ? parseInt(formData.graduation_year) : null;
        updateData.bio = formData.bio;
        updateData.skills = formData.skills;
      }

      // Add company-specific fields
      if (user.user_type === 'company') {
        updateData.name = formData.name;
        updateData.industry = formData.industry;
        updateData.description = formData.description;
        updateData.website = formData.website;
        updateData.location = formData.location;
      }

      await users.update(user.id, updateData);
      
      setMessage({ type: 'success', text: 'プロフィールを更新しました' });

      // Update localStorage with new user data
      const updatedUser = {
        ...user,
        first_name: formData.first_name,
        last_name: formData.last_name,
        full_name: `${formData.first_name} ${formData.last_name}`,
        ...(user.user_type === 'student' && {
          university: formData.university,
          graduation_year: formData.graduation_year ? parseInt(formData.graduation_year) : null,
          bio: formData.bio,
          skills: formData.skills,
        })
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      if (user.user_type === 'company' && company) {
        const updatedCompany = {
          ...company,
          name: formData.name,
          industry: formData.industry,
          description: formData.description,
          website: formData.website,
          location: formData.location,
        };
        localStorage.setItem('company', JSON.stringify(updatedCompany));
      }

    } catch (error: any) {
      const errorMessage = getErrorMessage(error, 'プロフィールの更新に失敗しました');
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh'
      }}>
        <div style={{
          animation: 'spin 1s linear infinite',
          borderRadius: '50%',
          height: '32px',
          width: '32px',
          borderBottom: '2px solid #2563eb'
        }}></div>
        <style jsx>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb'
    }}>
      {/* Navigation */}
      <nav style={{
        backgroundColor: '#ffffff',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
      }}>
        <div style={{
          maxWidth: '80rem',
          margin: '0 auto',
          padding: '0 1rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            height: '64px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#2563eb',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{
                    color: '#ffffff',
                    fontWeight: 'bold',
                    fontSize: '18px'
                  }}>IS</span>
                </div>
                <h1 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#111827'
                }}>InternScout</h1>
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <button
                onClick={() => router.push('/dashboard')}
                style={{
                  color: '#4b5563',
                  fontWeight: '500',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.target.style.color = '#111827'}
                onMouseLeave={(e) => e.target.style.color = '#4b5563'}
              >
                ダッシュボード
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div style={{
        maxWidth: '56rem',
        margin: '0 auto',
        padding: '1.5rem 1rem'
      }}>
        <div style={{
          padding: '1.5rem 1rem 1.5rem 0'
        }}>
          <div style={{
            marginBottom: '2rem'
          }}>
            <h1 style={{
              fontSize: '30px',
              fontWeight: 'bold',
              color: '#111827'
            }}>
              プロフィール設定
            </h1>
            <p style={{
              marginTop: '0.5rem',
              color: '#4b5563'
            }}>
              あなたの情報を管理しましょう
            </p>
          </div>

          {message && (
            <div style={{
              marginBottom: '1.5rem',
              borderRadius: '6px',
              padding: '1rem',
              backgroundColor: message.type === 'success' ? '#f0fdf4' : '#fef2f2'
            }}>
              <div style={{
                display: 'flex'
              }}>
                <div style={{
                  flexShrink: 0
                }}>
                  {message.type === 'success' ? (
                    <svg style={{
                      height: '20px',
                      width: '20px',
                      color: '#4ade80'
                    }} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg style={{
                      height: '20px',
                      width: '20px',
                      color: '#f87171'
                    }} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div style={{
                  marginLeft: '0.75rem'
                }}>
                  <h3 style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: message.type === 'success' ? '#166534' : '#991b1b'
                  }}>
                    {message.text}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <div style={{
            backgroundColor: '#ffffff',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            borderRadius: '8px'
          }}>
            <form onSubmit={handleSubmit} style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem'
            }}>
              {/* Basic Information */}
              <div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '500',
                  color: '#111827',
                  marginBottom: '1rem'
                }}>基本情報</h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '1.5rem'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151'
                    }}>姓 *</label>
                    <input
                      name="last_name"
                      type="text"
                      required
                      value={formData.last_name}
                      onChange={handleInputChange}
                      style={{
                        marginTop: '0.25rem',
                        display: 'block',
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.outline = 'none';
                        e.target.style.borderColor = '#2563eb';
                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                      placeholder="田中"
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151'
                    }}>名 *</label>
                    <input
                      name="first_name"
                      type="text"
                      required
                      value={formData.first_name}
                      onChange={handleInputChange}
                      style={{
                        marginTop: '0.25rem',
                        display: 'block',
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.outline = 'none';
                        e.target.style.borderColor = '#2563eb';
                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                      placeholder="太郎"
                    />
                  </div>
                </div>
              </div>

              {/* Student-specific fields */}
              {user.user_type === 'student' && (
                <div>
                  <h3 style={{
                  fontSize: '18px',
                  fontWeight: '500',
                  color: '#111827',
                  marginBottom: '1rem'
                }}>学生情報</h3>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem'
                  }}>
                    <div>
                      <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151'
                    }}>大学名</label>
                      <input
                        name="university"
                        type="text"
                        value={formData.university}
                        onChange={handleInputChange}
                        style={{
                        marginTop: '0.25rem',
                        display: 'block',
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.outline = 'none';
                        e.target.style.borderColor = '#2563eb';
                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                        placeholder="東京大学"
                      />
                    </div>

                    <div>
                      <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151'
                    }}>卒業予定年</label>
                      <select
                        name="graduation_year"
                        value={formData.graduation_year}
                        onChange={(e) => handleInputChange(e as any)}
                        style={{
                        marginTop: '0.25rem',
                        display: 'block',
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.outline = 'none';
                        e.target.style.borderColor = '#2563eb';
                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                      >
                        <option value="">選択してください</option>
                        <option value="2024">2024年</option>
                        <option value="2025">2025年</option>
                        <option value="2026">2026年</option>
                        <option value="2027">2027年</option>
                        <option value="2028">2028年</option>
                      </select>
                    </div>

                    <div>
                      <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151'
                    }}>スキル</label>
                      <input
                        name="skills"
                        type="text"
                        value={formData.skills}
                        onChange={handleInputChange}
                        style={{
                        marginTop: '0.25rem',
                        display: 'block',
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.outline = 'none';
                        e.target.style.borderColor = '#2563eb';
                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                        placeholder="JavaScript, React, Python（カンマ区切り）"
                      />
                      <p style={{
                        marginTop: '0.25rem',
                        fontSize: '14px',
                        color: '#6b7280'
                      }}>
                        複数のスキルはカンマで区切って入力してください
                      </p>
                    </div>

                    <div>
                      <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151'
                    }}>自己紹介</label>
                      <textarea
                        name="bio"
                        rows={4}
                        value={formData.bio}
                        onChange={handleInputChange}
                        style={{
                        marginTop: '0.25rem',
                        display: 'block',
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.outline = 'none';
                        e.target.style.borderColor = '#2563eb';
                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                        placeholder="あなたの経験や興味、目標について教えてください"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Company-specific fields */}
              {user.user_type === 'company' && (
                <div>
                  <h3 style={{
                  fontSize: '18px',
                  fontWeight: '500',
                  color: '#111827',
                  marginBottom: '1rem'
                }}>会社情報</h3>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem'
                  }}>
                    <div>
                      <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151'
                    }}>会社名 *</label>
                      <input
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        style={{
                        marginTop: '0.25rem',
                        display: 'block',
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.outline = 'none';
                        e.target.style.borderColor = '#2563eb';
                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                        placeholder="株式会社サンプル"
                      />
                    </div>

                    <div>
                      <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151'
                    }}>業界 *</label>
                      <input
                        name="industry"
                        type="text"
                        required
                        value={formData.industry}
                        onChange={handleInputChange}
                        style={{
                        marginTop: '0.25rem',
                        display: 'block',
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.outline = 'none';
                        e.target.style.borderColor = '#2563eb';
                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                        placeholder="IT・ソフトウェア"
                      />
                    </div>

                    <div>
                      <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151'
                    }}>所在地</label>
                      <input
                        name="location"
                        type="text"
                        value={formData.location}
                        onChange={handleInputChange}
                        style={{
                        marginTop: '0.25rem',
                        display: 'block',
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.outline = 'none';
                        e.target.style.borderColor = '#2563eb';
                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                        placeholder="東京都渋谷区"
                      />
                    </div>

                    <div>
                      <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151'
                    }}>ウェブサイト</label>
                      <input
                        name="website"
                        type="url"
                        value={formData.website}
                        onChange={handleInputChange}
                        style={{
                        marginTop: '0.25rem',
                        display: 'block',
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.outline = 'none';
                        e.target.style.borderColor = '#2563eb';
                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                        placeholder="https://example.com"
                      />
                    </div>

                    <div>
                      <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151'
                    }}>会社紹介</label>
                      <textarea
                        name="description"
                        rows={4}
                        value={formData.description}
                        onChange={handleInputChange}
                        style={{
                        marginTop: '0.25rem',
                        display: 'block',
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.outline = 'none';
                        e.target.style.borderColor = '#2563eb';
                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                        placeholder="会社の事業内容、文化、ビジョンについて教えてください"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Account Information */}
              <div style={{
                borderTop: '1px solid #e5e7eb',
                paddingTop: '1.5rem'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '500',
                  color: '#111827',
                  marginBottom: '1rem'
                }}>アカウント情報</h3>
                <div style={{
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  padding: '1rem'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <div>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#111827'
                      }}>メールアドレス:</span>
                      <span style={{
                        marginLeft: '0.5rem',
                        fontSize: '14px',
                        color: '#4b5563'
                      }}>{user.email}</span>
                    </div>
                  </div>
                  <p style={{
                    marginTop: '0.5rem',
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    メールアドレスの変更が必要な場合は、サポートまでお問い合わせください。
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid #e5e7eb'
              }}>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    color: '#374151',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease, border-color 0.2s ease',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#ffffff';
                  }}
                  onFocus={(e) => {
                    e.target.style.outline = 'none';
                    e.target.style.borderColor = '#2563eb';
                    e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: saving ? '#9ca3af' : '#2563eb',
                    color: '#ffffff',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.5 : 1,
                    transition: 'background-color 0.2s ease',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => {
                    if (!saving) e.target.style.backgroundColor = '#1d4ed8';
                  }}
                  onMouseLeave={(e) => {
                    if (!saving) e.target.style.backgroundColor = '#2563eb';
                  }}
                  onFocus={(e) => {
                    e.target.style.outline = 'none';
                    e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  {saving ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <div style={{
                        animation: 'spin 1s linear infinite',
                        borderRadius: '50%',
                        height: '16px',
                        width: '16px',
                        borderBottom: '2px solid #ffffff',
                        marginRight: '0.5rem'
                      }}></div>
                      保存中...
                    </div>
                  ) : (
                    '保存'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}