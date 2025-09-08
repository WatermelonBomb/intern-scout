'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { invitations, Invitation } from '@/lib/api';

export default function InvitationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [invitationsList, setInvitationsList] = useState<Invitation[]>([]);
  const [invitationsLoading, setInvitationsLoading] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [responding, setResponding] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadInvitations();
    }
  }, [user]);

  const loadInvitations = async () => {
    setInvitationsLoading(true);
    try {
      const response = await invitations.index(false, statusFilter === 'all' ? undefined : statusFilter);
      setInvitationsList(response.data.data);
    } catch (error) {
      console.error('Failed to load invitations:', error);
    } finally {
      setInvitationsLoading(false);
    }
  };

  const openDetailModal = (invitation: Invitation) => {
    setSelectedInvitation(invitation);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setSelectedInvitation(null);
    setShowDetailModal(false);
  };

  const handleAccept = async (invitationId: number) => {
    if (!window.confirm('このスカウトを承諾しますか？承諾後、企業とのメッセージのやり取りが開始されます。')) {
      return;
    }

    setResponding(invitationId);
    try {
      await invitations.accept(invitationId);
      alert('スカウトを承諾しました。メッセージ機能でやり取りを開始してください。');
      await loadInvitations();
      closeDetailModal();
    } catch (error: any) {
      const errorMessage = error.response?.data?.errors?.[0] || 'スカウトの承諾に失敗しました';
      alert(errorMessage);
    } finally {
      setResponding(null);
    }
  };

  const handleReject = async (invitationId: number) => {
    if (!window.confirm('このスカウトを辞退しますか？')) {
      return;
    }

    setResponding(invitationId);
    try {
      await invitations.reject(invitationId);
      alert('スカウトを辞退しました。');
      await loadInvitations();
      closeDetailModal();
    } catch (error: any) {
      const errorMessage = error.response?.data?.errors?.[0] || 'スカウトの辞退に失敗しました';
      alert(errorMessage);
    } finally {
      setResponding(null);
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      sent: '受信中',
      accepted: '承諾済み',
      rejected: '辞退済み',
      expired: '期限切れ'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      sent: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const getEmploymentTypeText = (type: string) => {
    const typeMap: { [key: string]: string } = {
      internship: 'インターンシップ',
      part_time: 'パートタイム',
      full_time: 'フルタイム',
      contract: '契約社員'
    };
    return typeMap[type] || type;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP');
  };

  const filteredInvitations = invitationsList.filter(inv => {
    if (statusFilter === 'all') return true;
    return inv.status === statusFilter;
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

  // Redirect companies to their invitation management
  if (user.user_type === 'company') {
    router.push('/scout-management');
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
              <button
                onClick={() => router.push('/messages')}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                メッセージ
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
                スカウト通知
              </h1>
              <p className="mt-2 text-gray-600">
                企業からのスカウトを確認・管理できます
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
                <option value="sent">受信中</option>
                <option value="accepted">承諾済み</option>
                <option value="rejected">辞退済み</option>
                <option value="expired">期限切れ</option>
              </select>
            </div>
          </div>

          {/* Invitations List */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                スカウト一覧 ({filteredInvitations.length}件)
              </h2>
            </div>
            <div className="p-6">
              {invitationsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredInvitations.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v1M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">スカウトがありません</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {statusFilter === 'all' ? '企業からのスカウトをお待ちください' : `${getStatusText(statusFilter)}のスカウトはありません`}
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
                  {filteredInvitations.map((invitation) => (
                    <div key={invitation.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {invitation.job_posting.title}
                            </h3>
                            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(invitation.status)}`}>
                              {getStatusText(invitation.status)}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">企業名:</span> {invitation.company.name}
                            </div>
                            <div>
                              <span className="font-medium">雇用形態:</span> {getEmploymentTypeText(invitation.job_posting.employment_type)}
                            </div>
                            <div>
                              <span className="font-medium">受信日:</span> {formatDate(invitation.sent_at)}
                            </div>
                            {invitation.responded_at && (
                              <div>
                                <span className="font-medium">返答日:</span> {formatDate(invitation.responded_at)}
                              </div>
                            )}
                          </div>
                          
                          <p className="text-gray-700 text-sm line-clamp-2">
                            <span className="font-medium">メッセージ:</span> {invitation.message}
                          </p>
                        </div>
                        
                        <div className="ml-6 flex flex-col space-y-2">
                          <button
                            onClick={() => openDetailModal(invitation)}
                            className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            詳細を見る
                          </button>
                          
                          {invitation.status === 'sent' && (
                            <>
                              <button
                                onClick={() => handleAccept(invitation.id)}
                                disabled={responding === invitation.id}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
                              >
                                {responding === invitation.id ? '承諾中...' : 'スカウト承諾'}
                              </button>
                              <button
                                onClick={() => handleReject(invitation.id)}
                                disabled={responding === invitation.id}
                                className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 text-sm"
                              >
                                {responding === invitation.id ? '辞退中...' : 'スカウト辞退'}
                              </button>
                            </>
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
      {showDetailModal && selectedInvitation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  スカウト詳細
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
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">求人情報</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-700">求人タイトル:</span>
                      <span className="ml-2">{selectedInvitation.job_posting.title}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">企業名:</span>
                      <span className="ml-2">{selectedInvitation.company.name}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">雇用形態:</span>
                      <span className="ml-2">{getEmploymentTypeText(selectedInvitation.job_posting.employment_type)}</span>
                    </div>
                  </div>
                </div>

                {/* Invitation Status */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">スカウト状況</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-700">受信日時:</span>
                      <span className="ml-2">{formatDate(selectedInvitation.sent_at)}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">ステータス:</span>
                      <span className={`ml-2 px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedInvitation.status)}`}>
                        {getStatusText(selectedInvitation.status)}
                      </span>
                    </div>
                    {selectedInvitation.responded_at && (
                      <div>
                        <span className="font-medium text-gray-700">返答日時:</span>
                        <span className="ml-2">{formatDate(selectedInvitation.responded_at)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">企業からのメッセージ</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-line">{selectedInvitation.message}</p>
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
                
                {selectedInvitation.status === 'sent' && (
                  <>
                    <button
                      onClick={() => handleAccept(selectedInvitation.id)}
                      disabled={responding === selectedInvitation.id}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {responding === selectedInvitation.id ? '承諾中...' : 'スカウト承諾'}
                    </button>
                    <button
                      onClick={() => handleReject(selectedInvitation.id)}
                      disabled={responding === selectedInvitation.id}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      {responding === selectedInvitation.id ? '辞退中...' : 'スカウト辞退'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}