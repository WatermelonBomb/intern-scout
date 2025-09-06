'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { users } from '@/lib/api';

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
      const errorMessage = error.response?.data?.errors?.[0] || error.response?.data?.errors || '更新に失敗しました';
      setMessage({ type: 'error', text: Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) return null;

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

      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              プロフィール設定
            </h1>
            <p className="mt-2 text-gray-600">
              あなたの情報を管理しましょう
            </p>
          </div>

          {message && (
            <div className={`mb-6 rounded-md p-4 ${
              message.type === 'success' ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {message.type === 'success' ? (
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${
                    message.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {message.text}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white shadow rounded-lg">
            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">基本情報</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">姓 *</label>
                    <input
                      name="last_name"
                      type="text"
                      required
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="田中"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">名 *</label>
                    <input
                      name="first_name"
                      type="text"
                      required
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="太郎"
                    />
                  </div>
                </div>
              </div>

              {/* Student-specific fields */}
              {user.user_type === 'student' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">学生情報</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">大学名</label>
                      <input
                        name="university"
                        type="text"
                        value={formData.university}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="東京大学"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">卒業予定年</label>
                      <select
                        name="graduation_year"
                        value={formData.graduation_year}
                        onChange={(e) => handleInputChange(e as any)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                      <label className="block text-sm font-medium text-gray-700">スキル</label>
                      <input
                        name="skills"
                        type="text"
                        value={formData.skills}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="JavaScript, React, Python（カンマ区切り）"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        複数のスキルはカンマで区切って入力してください
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">自己紹介</label>
                      <textarea
                        name="bio"
                        rows={4}
                        value={formData.bio}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="あなたの経験や興味、目標について教えてください"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Company-specific fields */}
              {user.user_type === 'company' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">会社情報</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">会社名 *</label>
                      <input
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="株式会社サンプル"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">業界 *</label>
                      <input
                        name="industry"
                        type="text"
                        required
                        value={formData.industry}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="IT・ソフトウェア"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">所在地</label>
                      <input
                        name="location"
                        type="text"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="東京都渋谷区"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">ウェブサイト</label>
                      <input
                        name="website"
                        type="url"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">会社紹介</label>
                      <textarea
                        name="description"
                        rows={4}
                        value={formData.description}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="会社の事業内容、文化、ビジョンについて教えてください"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Account Information */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">アカウント情報</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div>
                      <span className="text-sm font-medium text-gray-900">メールアドレス:</span>
                      <span className="ml-2 text-sm text-gray-600">{user.email}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    メールアドレスの変更が必要な場合は、サポートまでお問い合わせください。
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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