'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { jobPostings, JobPosting, applications } from '@/lib/api';

export default function JobPostingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [jobList, setJobList] = useState<JobPosting[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [deletingJob, setDeletingJob] = useState<JobPosting | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [showJobDetail, setShowJobDetail] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationForm, setApplicationForm] = useState({ cover_letter: '' });
  const [applying, setApplying] = useState(false);
  
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    requirements: '',
    salary: '',
    location: '',
    application_deadline: '',
    employment_type: ''
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
      loadJobs();
    }
  }, [user]);

  const loadJobs = async () => {
    setJobsLoading(true);
    try {
      const response = await jobPostings.index();
      setJobList(response.data);
    } catch (error) {
      console.error('Failed to load job postings:', error);
    } finally {
      setJobsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setJobForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setJobForm({
      title: '',
      description: '',
      requirements: '',
      salary: '',
      location: '',
      application_deadline: '',
      employment_type: ''
    });
  };

  const openCreateModal = () => {
    resetForm();
    setEditingJob(null);
    setShowCreateModal(true);
  };

  const openEditModal = (job: JobPosting) => {
    setJobForm({
      title: job.title || '',
      description: job.description || '',
      requirements: job.requirements || '',
      salary: job.salary || '',
      location: job.location || '',
      application_deadline: job.application_deadline ? job.application_deadline.split('T')[0] : '',
      employment_type: job.employment_type || ''
    });
    setEditingJob(job);
    setShowCreateModal(true);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingJob(null);
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const jobData = {
        ...jobForm,
        application_deadline: jobForm.application_deadline || null
      };

      if (editingJob) {
        await jobPostings.update(editingJob.id, jobData);
        setMessage({ type: 'success', text: '求人情報を更新しました' });
      } else {
        await jobPostings.create(jobData);
        setMessage({ type: 'success', text: '求人を投稿しました' });
      }

      await loadJobs();
      setTimeout(() => closeModal(), 1500);
    } catch (error: any) {
      const errorMessage = error.response?.data?.errors?.[0] || error.response?.data?.errors || '操作に失敗しました';
      setMessage({ type: 'error', text: Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (job: JobPosting) => {
    if (!window.confirm(`「${job.title}」を削除してもよろしいですか？`)) {
      return;
    }

    setDeletingJob(job);
    try {
      await jobPostings.delete(job.id);
      await loadJobs();
    } catch (error: any) {
      const errorMessage = error.response?.data?.errors?.[0] || '削除に失敗しました';
      alert(errorMessage);
    } finally {
      setDeletingJob(null);
    }
  };

  const openJobDetail = (job: JobPosting) => {
    setSelectedJob(job);
    setShowJobDetail(true);
  };

  const closeJobDetail = () => {
    setSelectedJob(null);
    setShowJobDetail(false);
  };

  const openApplicationModal = (job: JobPosting) => {
    setSelectedJob(job);
    setApplicationForm({ cover_letter: '' });
    setShowApplicationModal(true);
  };

  const closeApplicationModal = () => {
    setShowApplicationModal(false);
    setSelectedJob(null);
    setMessage(null);
  };

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    setApplying(true);
    setMessage(null);

    try {
      await applications.create(selectedJob.id, applicationForm);
      setMessage({ type: 'success', text: '応募を送信しました！' });
      await loadJobs(); // Refresh job list
      setTimeout(() => closeApplicationModal(), 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.errors?.[0] || error.response?.data?.errors || '応募に失敗しました';
      setMessage({ type: 'error', text: Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage });
    } finally {
      setApplying(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP');
  };

  const isDeadlinePassed = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Student view
  if (user.user_type === 'student') {
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
                求人情報
              </h1>
              <p className="mt-2 text-gray-600">
                インターンシップの求人情報を確認できます
              </p>
            </div>

            {/* Job Listings for Students */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  募集中の求人 ({jobList.length}件)
                </h2>
              </div>
              <div className="p-6">
                {jobsLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : jobList.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">求人情報がありません</h3>
                    <p className="mt-1 text-sm text-gray-500">新しい求人が投稿されるまでお待ちください</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobList.map((job) => (
                      <div key={job.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {job.title}
                          </h3>
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              {job.company?.name || '企業名未設定'}
                            </div>
                            {job.location && (
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {job.location}
                              </div>
                            )}
                            {job.salary && (
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                                {job.salary}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                          {job.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            {job.application_deadline && (
                              <div className={`${isDeadlinePassed(job.application_deadline) ? 'text-red-500' : 'text-gray-500'}`}>
                                締切: {formatDate(job.application_deadline)}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => openJobDetail(job)}
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            詳細を見る
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Job Detail Modal for Students */}
        {showJobDetail && selectedJob && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedJob.title}
                  </h3>
                  <button
                    onClick={closeJobDetail}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-200">
                    <div className="space-y-4">
                      <div className="flex items-center text-gray-600">
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="font-medium">企業:</span>
                        <span className="ml-2">{selectedJob.company?.name || '企業名未設定'}</span>
                      </div>
                      {selectedJob.location && (
                        <div className="flex items-center text-gray-600">
                          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="font-medium">勤務地:</span>
                          <span className="ml-2">{selectedJob.location}</span>
                        </div>
                      )}
                      {selectedJob.salary && (
                        <div className="flex items-center text-gray-600">
                          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          <span className="font-medium">給与:</span>
                          <span className="ml-2">{selectedJob.salary}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div className="text-gray-600">
                        <span className="font-medium">投稿日:</span>
                        <span className="ml-2">{formatDate(selectedJob.created_at)}</span>
                      </div>
                      {selectedJob.application_deadline && (
                        <div className="text-gray-600">
                          <span className="font-medium">応募締切:</span>
                          <span className={`ml-2 ${isDeadlinePassed(selectedJob.application_deadline) ? 'text-red-500 font-medium' : ''}`}>
                            {formatDate(selectedJob.application_deadline)}
                            {isDeadlinePassed(selectedJob.application_deadline) && ' (締切済み)'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">仕事内容</h4>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-line">{selectedJob.description}</p>
                    </div>
                  </div>

                  {selectedJob.requirements && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">応募要件</h4>
                      <div className="prose max-w-none">
                        <p className="text-gray-700 whitespace-pre-line">{selectedJob.requirements}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 mt-8">
                  <button
                    onClick={closeJobDetail}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    閉じる
                  </button>
                  {!isDeadlinePassed(selectedJob.application_deadline || selectedJob.deadline || '') ? (
                    selectedJob.has_applied ? (
                      <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        応募済み
                      </div>
                    ) : (
                      <button
                        onClick={() => openApplicationModal(selectedJob)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        応募する
                      </button>
                    )
                  ) : (
                    <div className="px-4 py-2 bg-red-100 text-red-800 rounded-lg">
                      応募締切済み
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Application Modal for Students */}
        {showApplicationModal && selectedJob && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    応募フォーム
                  </h3>
                  <button
                    onClick={closeApplicationModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900">{selectedJob.title}</h4>
                  <p className="text-sm text-gray-600">{selectedJob.company?.name}</p>
                </div>

                {message && (
                  <div className={`mb-4 rounded-md p-4 ${
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

                <form onSubmit={handleApplicationSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      志望動機 *
                    </label>
                    <textarea
                      required
                      rows={6}
                      value={applicationForm.cover_letter}
                      onChange={(e) => setApplicationForm({ cover_letter: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="この求人への志望動機やアピールポイントをご記入ください..."
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      なぜこの企業で働きたいか、あなたのスキルや経験をどう活かせるかを具体的に記載してください。
                    </p>
                  </div>

                  <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={closeApplicationModal}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      キャンセル
                    </button>
                    <button
                      type="submit"
                      disabled={applying}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {applying ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          応募中...
                        </div>
                      ) : (
                        '応募する'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Company view
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
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                求人投稿管理
              </h1>
              <p className="mt-2 text-gray-600">
                インターンシップの求人情報を管理しましょう
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>新規投稿</span>
            </button>
          </div>

          {/* Job Postings List */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                投稿済み求人 ({jobList.length}件)
              </h2>
            </div>
            <div className="p-6">
              {jobsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : jobList.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">求人投稿がありません</h3>
                  <p className="mt-1 text-sm text-gray-500">最初の求人を投稿してみましょう</p>
                  <button
                    onClick={openCreateModal}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
                  >
                    求人を投稿
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {jobList.map((job) => (
                    <div key={job.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {job.title}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center text-sm text-gray-600">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {job.location || '場所未設定'}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                              </svg>
                              {job.salary || '給与未設定'}
                            </div>
                          </div>
                          <p className="text-gray-700 mb-4 line-clamp-3">
                            {job.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>投稿日: {formatDate(job.created_at)}</span>
                            {job.application_deadline && (
                              <span>応募締切: {formatDate(job.application_deadline)}</span>
                            )}
                          </div>
                        </div>
                        <div className="ml-6 flex flex-col space-y-2">
                          <button
                            onClick={() => openEditModal(job)}
                            className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            編集
                          </button>
                          <button
                            onClick={() => handleDelete(job)}
                            disabled={deletingJob?.id === job.id}
                            className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            {deletingJob?.id === job.id ? '削除中...' : '削除'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingJob ? '求人情報を編集' : '新しい求人を投稿'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {message && (
                <div className={`mb-4 rounded-md p-4 ${
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

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">求人タイトル *</label>
                  <input
                    name="title"
                    type="text"
                    required
                    value={jobForm.title}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="エンジニアインターン募集"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">勤務地</label>
                    <input
                      name="location"
                      type="text"
                      value={jobForm.location}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="東京都渋谷区"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">給与</label>
                    <input
                      name="salary"
                      type="text"
                      value={jobForm.salary}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="時給1,200円〜"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">応募締切日</label>
                    <input
                      name="application_deadline"
                      type="date"
                      value={jobForm.application_deadline}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">雇用形態 *</label>
                    <select
                      name="employment_type"
                      required
                      value={jobForm.employment_type}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">選択してください</option>
                      <option value="internship">インターンシップ</option>
                      <option value="part_time">パートタイム</option>
                      <option value="full_time">フルタイム</option>
                      <option value="contract">契約社員</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">仕事内容 *</label>
                  <textarea
                    name="description"
                    rows={5}
                    required
                    value={jobForm.description}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="インターンとして参加していただく業務内容について詳しく説明してください"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">応募要件</label>
                  <textarea
                    name="requirements"
                    rows={4}
                    value={jobForm.requirements}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="必要なスキルや経験、学年制限など"
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {editingJob ? '更新中...' : '投稿中...'}
                      </div>
                    ) : (
                      editingJob ? '更新' : '投稿'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}