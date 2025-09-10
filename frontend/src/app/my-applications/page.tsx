'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/Toast';
import { applications, Application } from '@/lib/api';

export default function MyApplicationsPage() {
  const { user, loading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  
  const [applicationsList, setApplicationsList] = useState<Application[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [withdrawing, setWithdrawing] = useState<number | null>(null);

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
  };

  const handleWithdraw = async (applicationId: number) => {
    if (!window.confirm('応募を取り下げてもよろしいですか？')) {
      return;
    }

    setWithdrawing(applicationId);
    try {
      await applications.delete(applicationId);
      await loadApplications();
    } catch (error: any) {
      const errorMessage = error.response?.data?.errors?.[0] || '応募の取り下げに失敗しました';
      showToast(errorMessage, 'error');
    } finally {
      setWithdrawing(null);
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: '審査中',
      reviewed: '確認済み',
      accepted: '合格',
      rejected: '不合格'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
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

  // Redirect companies to their application management
  if (user.user_type === 'company') {
    router.push('/applications');
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
                応募履歴
              </h1>
              <p className="mt-2 text-gray-600">
                あなたが応募した求人の状況を確認できます
              </p>
            </div>
            
            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">フィルター:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">すべて</option>
                <option value="pending">審査中</option>
                <option value="reviewed">確認済み</option>
                <option value="accepted">合格</option>
                <option value="rejected">不合格</option>
              </select>
            </div>
          </div>

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
                  <h3 className="mt-2 text-sm font-medium text-gray-900">応募履歴がありません</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {statusFilter === 'all' ? '求人に応募してみましょう' : `${getStatusText(statusFilter)}の応募はありません`}
                  </p>
                  {statusFilter === 'all' && (
                    <button
                      onClick={() => router.push('/jobs')}
                      className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
                    >
                      求人を探す
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredApplications.map((application) => (
                    <div key={application.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {application.job_posting.title}
                            </h3>
                            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(application.status)}`}>
                              {getStatusText(application.status)}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">企業名:</span> {application.job_posting.company.name}
                            </div>
                            <div>
                              <span className="font-medium">応募日:</span> {formatDate(application.applied_at)}
                            </div>
                            {application.reviewed_at && (
                              <div>
                                <span className="font-medium">確認日:</span> {formatDate(application.reviewed_at)}
                              </div>
                            )}
                          </div>
                          
                          <p className="text-gray-700 text-sm line-clamp-2">
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
                            <button
                              onClick={() => handleWithdraw(application.id)}
                              disabled={withdrawing === application.id}
                              className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 text-sm"
                            >
                              {withdrawing === application.id ? '取り下げ中...' : '応募を取り下げ'}
                            </button>
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
                {/* Job Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">応募先求人</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-700">求人タイトル:</span>
                      <span className="ml-2">{selectedApplication.job_posting.title}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">企業名:</span>
                      <span className="ml-2">{selectedApplication.job_posting.company.name}</span>
                    </div>
                  </div>
                </div>

                {/* Application Status */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">応募状況</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-700">応募日時:</span>
                      <span className="ml-2">{formatDate(selectedApplication.applied_at)}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">ステータス:</span>
                      <span className={`ml-2 px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedApplication.status)}`}>
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

                  {/* Status Messages */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    {selectedApplication.status === 'pending' && (
                      <p className="text-gray-600">
                        <span className="font-medium">審査中:</span> 企業による選考が進行中です。結果をお待ちください。
                      </p>
                    )}
                    {selectedApplication.status === 'reviewed' && (
                      <p className="text-blue-600">
                        <span className="font-medium">確認済み:</span> 企業があなたの応募を確認しました。選考結果をお待ちください。
                      </p>
                    )}
                    {selectedApplication.status === 'accepted' && (
                      <p className="text-green-600">
                        <span className="font-medium">合格おめでとうございます！</span> 企業から詳細な連絡が届く予定です。
                      </p>
                    )}
                    {selectedApplication.status === 'rejected' && (
                      <p className="text-red-600">
                        <span className="font-medium">選考結果:</span> 今回は残念ながら不合格となりました。他の求人もぜひご検討ください。
                      </p>
                    )}
                  </div>
                </div>

                {/* Cover Letter */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">提出した志望動機</h4>
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
                
                {selectedApplication.status === 'pending' && (
                  <button
                    onClick={() => handleWithdraw(selectedApplication.id)}
                    disabled={withdrawing === selectedApplication.id}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {withdrawing === selectedApplication.id ? '取り下げ中...' : '応募を取り下げ'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}