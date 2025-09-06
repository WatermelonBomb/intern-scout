'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { users, messages, User } from '@/lib/api';

export default function StudentSearchPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
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
    if (!loading && (!user || !user.company)) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.user_type === 'company') {
      loadStudents();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [students, filters]);

  const loadStudents = async () => {
    setSearchLoading(true);
    try {
      const response = await users.index();
      setStudents(response.data);
    } catch (error) {
      console.error('Failed to load students:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...students];

    if (filters.skills) {
      const searchSkills = filters.skills.toLowerCase().split(',').map(s => s.trim());
      filtered = filtered.filter(student => {
        if (!student.skills) return false;
        const studentSkills = student.skills.toLowerCase();
        return searchSkills.some(skill => studentSkills.includes(skill));
      });
    }

    if (filters.university) {
      filtered = filtered.filter(student =>
        student.university?.toLowerCase().includes(filters.university.toLowerCase())
      );
    }

    if (filters.graduation_year) {
      filtered = filtered.filter(student =>
        student.graduation_year?.toString() === filters.graduation_year
      );
    }

    setFilteredStudents(filtered);
  };

  const handleSearch = async () => {
    setSearchLoading(true);
    try {
      const searchParams: any = {};
      if (filters.skills) searchParams.skills = filters.skills;
      if (filters.university) searchParams.university = filters.university;
      if (filters.graduation_year) searchParams.graduation_year = filters.graduation_year;

      const response = await users.search(searchParams);
      setStudents(response.data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearchLoading(false);
    }
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
      alert('スカウトメッセージを送信しました！');
    } catch (error: any) {
      const errorMessage = error.response?.data?.errors?.[0] || 'メッセージの送信に失敗しました';
      alert(errorMessage);
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
${user?.company?.name}

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || user.user_type !== 'company') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">IS</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">InternScout</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                ダッシュボード
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              インターン生検索
            </h1>
            <p className="mt-2 text-gray-600">
              優秀なインターン生を見つけて、スカウトメッセージを送りましょう
            </p>
          </div>

          {/* Search Filters */}
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">検索条件</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">スキル</label>
                  <input
                    type="text"
                    placeholder="JavaScript, React, Python（カンマ区切り）"
                    value={filters.skills}
                    onChange={(e) => setFilters(prev => ({ ...prev, skills: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">大学名</label>
                  <input
                    type="text"
                    placeholder="東京大学"
                    value={filters.university}
                    onChange={(e) => setFilters(prev => ({ ...prev, university: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">卒業予定年</label>
                  <select
                    value={filters.graduation_year}
                    onChange={(e) => setFilters(prev => ({ ...prev, graduation_year: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">すべて</option>
                    <option value="2024">2024年</option>
                    <option value="2025">2025年</option>
                    <option value="2026">2026年</option>
                    <option value="2027">2027年</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex space-x-4">
                <button
                  onClick={handleSearch}
                  disabled={searchLoading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {searchLoading ? '検索中...' : '検索'}
                </button>
                <button
                  onClick={() => {
                    setFilters({ skills: '', university: '', graduation_year: '' });
                    loadStudents();
                  }}
                  className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  リセット
                </button>
              </div>
            </div>
          </div>

          {/* Search Results */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                検索結果 ({filteredStudents.length}件)
              </h2>
            </div>
            <div className="p-6">
              {searchLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">学生が見つかりませんでした</h3>
                  <p className="mt-1 text-sm text-gray-500">検索条件を変更してお試しください</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredStudents.map((student) => (
                    <div key={student.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">
                            {student.first_name?.[0]}{student.last_name?.[0]}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{student.full_name}</h3>
                          <p className="text-sm text-gray-500">{student.university}</p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        {student.graduation_year && (
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            卒業予定: {student.graduation_year}年
                          </div>
                        )}
                        {student.skills && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">スキル:</p>
                            <div className="flex flex-wrap gap-1">
                              {student.skills.split(',').map((skill, index) => (
                                <span
                                  key={index}
                                  className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                                >
                                  {skill.trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {student.bio && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                          {student.bio}
                        </p>
                      )}

                      <button
                        onClick={() => openMessageModal(student)}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedStudent.full_name}さんへスカウトメッセージ
                </h3>
                <button
                  onClick={() => setMessageModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">件名</label>
                  <input
                    type="text"
                    value={messageForm.subject}
                    onChange={(e) => setMessageForm(prev => ({ ...prev, subject: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">メッセージ内容</label>
                  <textarea
                    rows={10}
                    value={messageForm.content}
                    onChange={(e) => setMessageForm(prev => ({ ...prev, content: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => setMessageModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={sendingMessage || !messageForm.subject || !messageForm.content}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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