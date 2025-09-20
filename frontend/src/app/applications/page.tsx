'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { applications, type Application } from '@/lib/api';
import { getErrorMessage } from '@/lib/errors';

type StatusFilter = 'all' | Application['status'];

export default function ApplicationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [applicationsList, setApplicationsList] = useState<Application[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [updating, setUpdating] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadApplications();
    }
  }, [user]);

  const loadApplications = async () => {
    setApplicationsLoading(true);
    try {
      const response = await applications.index();
      setApplicationsList(response.data);
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setApplicationsLoading(false);
    }
  };

  const openDetailModal = (application: Application) => {
    setSelectedApplication(application);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setSelectedApplication(null);
    setShowDetailModal(false);
    setMessage(null);
  };

  const handleStatusUpdate = async (applicationId: number, newStatus: Application['status']) => {
    setUpdating(`${applicationId}-${newStatus}`);
    setMessage(null);

    try {
      await applications.update(applicationId, { status: newStatus });
      setMessage({ type: 'success', text: 'ステータスを更新しました' });
      await loadApplications();
      
      // Update selected application if it's open
      if (selectedApplication && selectedApplication.id === applicationId) {
        const updatedApp = applicationsList.find(app => app.id === applicationId);
        if (updatedApp) {
          setSelectedApplication({
            ...updatedApp,
            status: newStatus,
            reviewed_at: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'ステータスの更新に失敗しました');
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setUpdating(null);
    }
  };

  const getStatusText = (status: Application['status']) => {
    const statusMap: Record<Application['status'], string> = {
      pending: '未確認',
      reviewed: '確認済み',
      accepted: '合格',
      rejected: '不合格'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: Application['status']) => {
    const colorMap: Record<Application['status'], string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewed: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP');
  };

  const filteredApplications = applicationsList.filter(app => {
    if (statusFilter === 'all') return true;
    return app.status === statusFilter;
  });

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

  // Redirect students to their application history
  if (user.user_type === 'student') {
    router.push('/my-applications');
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
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                応募管理
              </h1>
              <p className="mt-2 text-gray-600">
                学生からの応募を確認・管理できます
              </p>
            </div>
            
            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">フィルター:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">すべて</option>
                <option value="pending">未確認</option>
                <option value="reviewed">確認済み</option>
                <option value="accepted">合格</option>
                <option value="rejected">不合格</option>
              </select>
            </div>
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

          {/* Applications List */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                応募一覧 ({filteredApplications.length}件)
              </h2>
            </div>
            <div className="p-6">
              {applicationsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredApplications.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">応募がありません</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {statusFilter === 'all' ? '学生からの応募をお待ちしています' : `${getStatusText(statusFilter)}の応募はありません`}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredApplications.map((application) => (
                    <div key={application.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {application.student.full_name}
                            </h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(application.status)}`}>
                              {getStatusText(application.status)}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">応募求人:</span> {application.job_posting.title}
                            </div>
                            <div>
                              <span className="font-medium">応募日:</span> {formatDate(application.applied_at)}
                            </div>
                            <div>
                              <span className="font-medium">大学:</span> {application.student.university || '未入力'}
                            </div>
                            <div>
                              <span className="font-medium">卒業年:</span> {application.student.graduation_year || '未入力'}
                            </div>
                          </div>
                          
                          <p className="text-gray-700 text-sm line-clamp-2 mb-4">
                            <span className="font-medium">志望動機:</span> {application.cover_letter}
                          </p>
                        </div>
                        
                        <div className="ml-6 flex flex-col space-y-2">
                          <button
                            onClick={() => openDetailModal(application)}
                            className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            詳細を見る
                          </button>
                          
                          {application.status === 'pending' && (
                            <div className="flex flex-col space-y-1">
                              <button
                                onClick={() => handleStatusUpdate(application.id, 'reviewed')}
                                disabled={updating === `${application.id}-reviewed`}
                                className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 text-sm"
                              >
                                {updating === `${application.id}-reviewed` ? '更新中...' : '確認済み'}
                              </button>
                            </div>
                          )}
                          
                          {(application.status === 'pending' || application.status === 'reviewed') && (
                            <div className="flex flex-col space-y-1">
                              <button
                                onClick={() => handleStatusUpdate(application.id, 'accepted')}
                                disabled={updating === `${application.id}-accepted`}
                                className="px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50 text-sm"
                              >
                                {updating === `${application.id}-accepted` ? '更新中...' : '合格'}
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(application.id, 'rejected')}
                                disabled={updating === `${application.id}-rejected`}
                                className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 text-sm"
                              >
                                {updating === `${application.id}-rejected` ? '更新中...' : '不合格'}
                              </button>
                            </div>
                          )}
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

      {/* Detail Modal */}
      {showDetailModal && selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  応募詳細
                </h3>
                <button
                  onClick={closeDetailModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Student Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">学生情報</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-700">氏名:</span>
                      <span className="ml-2">{selectedApplication.student.full_name}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">メールアドレス:</span>
                      <span className="ml-2">{selectedApplication.student.email}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">大学:</span>
                      <span className="ml-2">{selectedApplication.student.university || '未入力'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">卒業年:</span>
                      <span className="ml-2">{selectedApplication.student.graduation_year || '未入力'}</span>
                    </div>
                  </div>
                  
                  {selectedApplication.student.bio && (
                    <div className="mt-4">
                      <span className="font-medium text-gray-700">自己紹介:</span>
                      <p className="mt-1 text-gray-600">{selectedApplication.student.bio}</p>
                    </div>
                  )}
                  
                  {selectedApplication.student.skills && (
                    <div className="mt-4">
                      <span className="font-medium text-gray-700">スキル:</span>
                      <p className="mt-1 text-gray-600">{selectedApplication.student.skills}</p>
                    </div>
                  )}
                </div>

                {/* Application Info */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">応募情報</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-700">応募求人:</span>
                      <span className="ml-2">{selectedApplication.job_posting.title}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">応募日時:</span>
                      <span className="ml-2">{formatDate(selectedApplication.applied_at)}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">ステータス:</span>
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedApplication.status)}`}>
                        {getStatusText(selectedApplication.status)}
                      </span>
                    </div>
                    {selectedApplication.reviewed_at && (
                      <div>
                        <span className="font-medium text-gray-700">確認日時:</span>
                        <span className="ml-2">{formatDate(selectedApplication.reviewed_at)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cover Letter */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">志望動機</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-line">{selectedApplication.cover_letter}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 mt-8">
                <button
                  onClick={closeDetailModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  閉じる
                </button>
                
                {(selectedApplication.status === 'pending' || selectedApplication.status === 'reviewed') && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleStatusUpdate(selectedApplication.id, 'accepted')}
                      disabled={updating === `${selectedApplication.id}-accepted`}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {updating === `${selectedApplication.id}-accepted` ? '更新中...' : '合格'}
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedApplication.id, 'rejected')}
                      disabled={updating === `${selectedApplication.id}-rejected`}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      {updating === `${selectedApplication.id}-rejected` ? '更新中...' : '不合格'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
