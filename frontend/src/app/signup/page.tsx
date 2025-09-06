'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function SignupPage() {
  const searchParams = useSearchParams();
  const userType = searchParams.get('type') || 'student';
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password_confirmation: '',
    first_name: '',
    last_name: '',
    user_type: userType,
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
      await signup(formData);
      router.push('/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.errors?.[0] || err.response?.data?.errors || '登録に失敗しました';
      setError(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">IS</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            {formData.user_type === 'student' ? '学生として登録' : '企業として登録'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            すでにアカウントをお持ちの方は{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              ログイン
            </Link>
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center space-x-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            1
          </div>
          <div className={`w-12 h-px ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            2
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {error}
                  </h3>
                </div>
              </div>
            </div>
          )}

          {/* User type selector */}
          <div className="flex rounded-lg bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, user_type: 'student' }))}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                formData.user_type === 'student'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              学生
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, user_type: 'company' }))}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                formData.user_type === 'company'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              企業
            </button>
          </div>

          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">姓</label>
                  <input
                    name="last_name"
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => handleInputChange(e, e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="田中"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">名</label>
                  <input
                    name="first_name"
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => handleInputChange(e, e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="太郎"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange(e, e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">パスワード</label>
                <input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => handleInputChange(e, e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="8文字以上"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">パスワード確認</label>
                <input
                  name="password_confirmation"
                  type="password"
                  required
                  value={formData.password_confirmation}
                  onChange={(e) => handleInputChange(e, e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="パスワードを再入力"
                />
              </div>

              <button
                type="button"
                onClick={nextStep}
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                次へ
              </button>
            </div>
          )}

          {/* Step 2: Profile Information */}
          {currentStep === 2 && (
            <div className="space-y-4">
              {formData.user_type === 'student' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">大学名</label>
                    <input
                      name="university"
                      type="text"
                      value={formData.university}
                      onChange={(e) => handleInputChange(e, e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="東京大学"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">卒業予定年</label>
                    <input
                      name="graduation_year"
                      type="number"
                      min="2024"
                      max="2030"
                      value={formData.graduation_year}
                      onChange={(e) => handleInputChange(e, e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="2025"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">スキル</label>
                    <input
                      name="skills"
                      type="text"
                      value={formData.skills}
                      onChange={(e) => handleInputChange(e, e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="JavaScript, React, Python（カンマ区切り）"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">自己紹介</label>
                    <textarea
                      name="bio"
                      rows={4}
                      value={formData.bio}
                      onChange={(e) => handleInputChange(e, e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="あなたの経験や興味について教えてください"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">会社名 *</label>
                    <input
                      name="company_name"
                      type="text"
                      required
                      value={formData.company_name}
                      onChange={(e) => handleInputChange(e, e.target.value)}
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
                      onChange={(e) => handleInputChange(e, e.target.value)}
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
                      onChange={(e) => handleInputChange(e, e.target.value)}
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
                      onChange={(e) => handleInputChange(e, e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">会社紹介</label>
                    <textarea
                      name="company_description"
                      rows={4}
                      value={formData.company_description}
                      onChange={(e) => handleInputChange(e, e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="会社の事業内容や文化について教えてください"
                    />
                  </div>
                </>
              )}

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  戻る
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      登録中...
                    </div>
                  ) : (
                    '登録'
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="text-center">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
              ← トップページに戻る
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}