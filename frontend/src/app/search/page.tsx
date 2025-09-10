'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { users, messages, User } from '@/lib/api';

// Add CSS animation for spinner
const spinnerStyles = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

export default function StudentSearchPage() {
  const { user, company, loading, isCompany } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  
  const [students, setStudents] = useState<User[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<User[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageForm, setMessageForm] = useState({
    subject: '',
    content: ''
  });
  const [sendingMessage, setSendingMessage] = useState(false);

  // Search filters
  const [filters, setFilters] = useState({
    skills: '',
    university: '',
    graduation_year: ''
  });

  useEffect(() => {
    if (!loading && (!user || !isCompany)) {
      router.push('/dashboard');
    }
  }, [user, loading, isCompany, router]);

  useEffect(() => {
    if (isCompany) {
      loadStudents();
    }
  }, [isCompany]);

  const loadStudents = async (searchParams?: any) => {
    setSearchLoading(true);
    try {
      const response = searchParams && Object.keys(searchParams).length > 0 
        ? await users.search(searchParams)
        : await users.index();
      setStudents(response.data);
      setFilteredStudents(response.data);
    } catch (error) {
      console.error('Failed to load students:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearch = async () => {
    const searchParams: any = {};
    if (filters.skills) searchParams.skills = filters.skills;
    if (filters.university) searchParams.university = filters.university;
    if (filters.graduation_year) searchParams.graduation_year = filters.graduation_year;

    await loadStudents(searchParams);
  };

  const handleSendMessage = async () => {
    if (!selectedStudent || !messageForm.subject || !messageForm.content) return;

    setSendingMessage(true);
    try {
      await messages.create({
        receiver_id: selectedStudent.id,
        subject: messageForm.subject,
        content: messageForm.content
      });

      setMessageModalOpen(false);
      setSelectedStudent(null);
      setMessageForm({ subject: '', content: '' });
      
      // Show success message (you could implement a toast notification here)
      showToast('スカウトメッセージを送信しました！', 'success');
    } catch (error: any) {
      const errorMessage = error.response?.data?.errors?.[0] || 'メッセージの送信に失敗しました';
      showToast(errorMessage, 'error');
    } finally {
      setSendingMessage(false);
    }
  };

  const openMessageModal = (student: User) => {
    setSelectedStudent(student);
    setMessageForm({
      subject: `${student.full_name}さんへのスカウトメッセージ`,
      content: `${student.full_name}さん、こんにちは。

あなたのプロフィールを拝見し、弊社でのインターンシップにご興味をお持ちいただけないかと思い、ご連絡いたしました。

【会社概要】
${company?.name}

【インターンシップ内容】
（具体的な業務内容をご記載ください）

ぜひ一度お話しする機会をいただければと思います。
ご質問等ございましたら、お気軽にお聞かせください。

よろしくお願いいたします。`
    });
    setMessageModalOpen(true);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ 
          animation: 'spin 1s linear infinite',
          borderRadius: '50%',
          height: '32px',
          width: '32px',
          borderBottom: '2px solid #2563eb'
        }}></div>
      </div>
    );
  }

  if (!user || !isCompany) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <style dangerouslySetInnerHTML={{ __html: spinnerStyles }} />
      {/* Navigation */}
      <nav style={{ backgroundColor: 'white', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', height: '4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ 
                  width: '2rem', 
                  height: '2rem', 
                  backgroundColor: '#2563eb', 
                  borderRadius: '0.5rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.125rem' }}>IS</span>
                </div>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>InternScout</h1>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={() => router.push('/dashboard')}
                style={{ 
                  color: '#4b5563', 
                  fontWeight: '500',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  transition: 'color 0.15s ease-in-out'
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

      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1.5rem 1rem' }}>
        <div style={{ padding: '1.5rem 0' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827' }}>
              インターン生検索
            </h1>
            <p style={{ marginTop: '0.5rem', color: '#4b5563' }}>
              優秀なインターン生を見つけて、スカウトメッセージを送りましょう
            </p>
          </div>

          {/* Search Filters */}
          <div style={{
            backgroundColor: 'white',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            borderRadius: '0.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              padding: '1rem 1.5rem',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827' }}>検索条件</h2>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem'
              }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>スキル</label>
                  <input
                    type="text"
                    placeholder="JavaScript, React, Python（カンマ区切り）"
                    value={filters.skills}
                    onChange={(e) => setFilters(prev => ({ ...prev, skills: e.target.value }))}
                    style={{
                      marginTop: '0.25rem',
                      display: 'block',
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      outline: 'none',
                      fontSize: '0.875rem',
                      transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 1px #3b82f6';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>大学名</label>
                  <input
                    type="text"
                    placeholder="東京大学"
                    value={filters.university}
                    onChange={(e) => setFilters(prev => ({ ...prev, university: e.target.value }))}
                    style={{
                      marginTop: '0.25rem',
                      display: 'block',
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      outline: 'none',
                      fontSize: '0.875rem',
                      transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 1px #3b82f6';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>卒業予定年</label>
                  <select
                    value={filters.graduation_year}
                    onChange={(e) => setFilters(prev => ({ ...prev, graduation_year: e.target.value }))}
                    style={{
                      marginTop: '0.25rem',
                      display: 'block',
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      outline: 'none',
                      fontSize: '0.875rem',
                      backgroundColor: 'white',
                      transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 1px #3b82f6';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="">すべて</option>
                    <option value="2024">2024年</option>
                    <option value="2025">2025年</option>
                    <option value="2026">2026年</option>
                    <option value="2027">2027年</option>
                  </select>
                </div>
              </div>
              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                <button
                  onClick={handleSearch}
                  disabled={searchLoading}
                  style={{
                    backgroundColor: searchLoading ? '#9ca3af' : '#3b82f6',
                    color: 'white',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '0.5rem',
                    fontWeight: '500',
                    border: 'none',
                    cursor: searchLoading ? 'not-allowed' : 'pointer',
                    opacity: searchLoading ? 0.5 : 1,
                    transition: 'all 0.15s ease-in-out'
                  }}
                  onMouseEnter={(e) => {
                    if (!searchLoading) {
                      e.target.style.backgroundColor = '#2563eb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!searchLoading) {
                      e.target.style.backgroundColor = '#3b82f6';
                    }
                  }}
                >
                  {searchLoading ? '検索中...' : '検索'}
                </button>
                <button
                  onClick={() => {
                    setFilters({ skills: '', university: '', graduation_year: '' });
                    loadStudents();
                  }}
                  style={{
                    border: '1px solid #d1d5db',
                    color: '#374151',
                    backgroundColor: 'white',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '0.5rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease-in-out'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                >
                  リセット
                </button>
              </div>
            </div>
          </div>

          {/* Search Results */}
          <div style={{
            backgroundColor: 'white',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            borderRadius: '0.5rem'
          }}>
            <div style={{
              padding: '1rem 1.5rem',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827' }}>
                検索結果 ({filteredStudents.length}件)
              </h2>
            </div>
            <div style={{ padding: '1.5rem' }}>
              {searchLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
                  <div style={{
                    animation: 'spin 1s linear infinite',
                    borderRadius: '50%',
                    height: '2rem',
                    width: '2rem',
                    borderBottom: '2px solid #3b82f6'
                  }}></div>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                  <svg style={{ margin: '0 auto', height: '3rem', width: '3rem', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 style={{ marginTop: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>学生が見つかりませんでした</h3>
                  <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#6b7280' }}>検索条件を変更してお試しください</p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '1.5rem'
                }}>
                  {filteredStudents.map((student) => (
                    <div key={student.id} style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      padding: '1.5rem',
                      backgroundColor: 'white',
                      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                      transition: 'all 0.15s ease-in-out'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{
                          width: '3rem',
                          height: '3rem',
                          backgroundColor: '#2563eb',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <span style={{ color: 'white', fontWeight: '600', fontSize: '1.125rem' }}>
                            {student.first_name?.[0]}{student.last_name?.[0]}
                          </span>
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>{student.full_name}</h3>
                          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{student.university}</p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                        {student.graduation_year && (
                          <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', color: '#4b5563' }}>
                            <svg style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            卒業予定: {student.graduation_year}年
                          </div>
                        )}
                        {student.skills && (
                          <div>
                            <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>スキル:</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                              {student.skills.split(',').map((skill, index) => (
                                <span
                                  key={index}
                                  style={{
                                    display: 'inline-block',
                                    backgroundColor: '#dbeafe',
                                    color: '#1e40af',
                                    fontSize: '0.75rem',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '0.25rem'
                                  }}
                                >
                                  {skill.trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {student.bio && (
                        <p style={{
                          fontSize: '0.875rem',
                          color: '#4b5563',
                          marginBottom: '1rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {student.bio}
                        </p>
                      )}

                      <button
                        onClick={() => openMessageModal(student)}
                        style={{
                          width: '100%',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.5rem',
                          fontWeight: '500',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s ease-in-out'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
                      >
                        スカウトメッセージを送る
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Message Modal */}
      {messageModalOpen && selectedStudent && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(75, 85, 99, 0.5)',
          overflowY: 'auto',
          height: '100%',
          width: '100%',
          zIndex: 50,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingTop: '5rem'
        }}>
          <div style={{
            position: 'relative',
            margin: '0 auto',
            padding: '1.25rem',
            border: '1px solid #e5e7eb',
            width: '90%',
            maxWidth: '32rem',
            boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
            borderRadius: '0.375rem',
            backgroundColor: 'white'
          }}>
            <div style={{ marginTop: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827' }}>
                  {selectedStudent.full_name}さんへスカウトメッセージ
                </h3>
                <button
                  onClick={() => setMessageModalOpen(false)}
                  style={{
                    color: '#9ca3af',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    borderRadius: '0.25rem',
                    transition: 'color 0.15s ease-in-out'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#4b5563'}
                  onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
                >
                  <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>件名</label>
                  <input
                    type="text"
                    value={messageForm.subject}
                    onChange={(e) => setMessageForm(prev => ({ ...prev, subject: e.target.value }))}
                    style={{
                      marginTop: '0.25rem',
                      display: 'block',
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      outline: 'none',
                      fontSize: '0.875rem',
                      transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 1px #3b82f6';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>メッセージ内容</label>
                  <textarea
                    rows={10}
                    value={messageForm.content}
                    onChange={(e) => setMessageForm(prev => ({ ...prev, content: e.target.value }))}
                    style={{
                      marginTop: '0.25rem',
                      display: 'block',
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      outline: 'none',
                      fontSize: '0.875rem',
                      resize: 'vertical',
                      minHeight: '10rem',
                      transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 1px #3b82f6';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  onClick={() => setMessageModalOpen(false)}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    color: '#374151',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'background-color 0.15s ease-in-out'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={sendingMessage || !messageForm.subject || !messageForm.content}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: (sendingMessage || !messageForm.subject || !messageForm.content) ? '#9ca3af' : '#3b82f6',
                    color: 'white',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: (sendingMessage || !messageForm.subject || !messageForm.content) ? 'not-allowed' : 'pointer',
                    opacity: (sendingMessage || !messageForm.subject || !messageForm.content) ? 0.5 : 1,
                    fontWeight: '500',
                    transition: 'all 0.15s ease-in-out'
                  }}
                  onMouseEnter={(e) => {
                    if (!(sendingMessage || !messageForm.subject || !messageForm.content)) {
                      e.target.style.backgroundColor = '#2563eb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!(sendingMessage || !messageForm.subject || !messageForm.content)) {
                      e.target.style.backgroundColor = '#3b82f6';
                    }
                  }}
                >
                  {sendingMessage ? '送信中...' : 'メッセージを送信'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}