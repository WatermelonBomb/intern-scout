'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { invitations, Invitation, users, User } from '@/lib/api';

export default function ScoutManagementPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [invitationsList, setInvitationsList] = useState<Invitation[]>([]);
  const [invitationsLoading, setInvitationsLoading] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleting, setDeleting] = useState<number | null>(null);

  // Scout sending modal states
  const [showScoutModal, setShowScoutModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [scoutMessage, setScoutMessage] = useState('');
  const [sending, setSending] = useState(false);

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
      const response = await invitations.index(true, statusFilter === 'all' ? undefined : statusFilter);
      setInvitationsList(response.data.data || []);
    } catch (error: any) {
      console.error('Failed to load invitations:', error);
      const errorMessage = error.response?.data?.errors?.[0] || 'スカウトの読み込みに失敗しました';
      alert(errorMessage);
      setInvitationsList([]);
    } finally {
      setInvitationsLoading(false);
    }
  };

  const searchStudents = async () => {
    if (searchQuery.trim().length < 2) return;
    
    try {
      const response = await users.search({ q: searchQuery, user_type: 'student' });
      setSearchResults(response.data.data || []);
    } catch (error) {
      console.error('Failed to search students:', error);
      setSearchResults([]);
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

  const openScoutModal = () => {
    setShowScoutModal(true);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedStudent(null);
    setScoutMessage('');
  };

  const closeScoutModal = () => {
    setShowScoutModal(false);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedStudent(null);
    setScoutMessage('');
  };

  const handleDelete = async (invitationId: number) => {
    if (!window.confirm('このスカウトを取り消しますか？')) {
      return;
    }

    setDeleting(invitationId);
    try {
      await invitations.delete(invitationId);
      await loadInvitations();
      closeDetailModal();
    } catch (error: any) {
      const errorMessage = error.response?.data?.errors?.[0] || 'スカウトの削除に失敗しました';
      alert(errorMessage);
    } finally {
      setDeleting(null);
    }
  };

  const handleSendScout = async () => {
    if (!selectedStudent || !scoutMessage.trim()) {
      alert('学生とメッセージを選択してください');
      return;
    }

    // For now, we'll use the first available job posting
    // In a real app, you'd want to let the user select which job posting to scout for
    try {
      setSending(true);
      // Get user's job postings first
      const jobPostingsResponse = await fetch('/api/v1/job_postings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const jobPostingsData = await jobPostingsResponse.json();
      
      if (!jobPostingsData.data || jobPostingsData.data.length === 0) {
        alert('スカウトを送信するには、まず求人を投稿してください');
        return;
      }

      const firstJobPosting = jobPostingsData.data[0];
      
      await invitations.create({
        student_id: selectedStudent.id,
        job_posting_id: firstJobPosting.id,
        message: scoutMessage
      });
      
      alert('スカウトを送信しました！');
      closeScoutModal();
      await loadInvitations();
    } catch (error: any) {
      console.error('Failed to send scout:', error);
      const errorMessage = error.response?.data?.errors?.[0] || 'スカウトの送信に失敗しました';
      alert(errorMessage);
    } finally {
      setSending(false);
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      sent: '送信済み',
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

  // Redirect students to their invitations page
  if (user.user_type === 'student') {
    router.push('/invitations');
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
                onClick={() => router.push('/applications')}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                応募管理
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
                スカウト管理
              </h1>
              <p className="mt-2 text-gray-600">
                学生へのスカウト送信・管理を行います
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={openScoutModal}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
              >
                新規スカウト送信
              </button>
              
              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">フィルター:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">すべて</option>
                  <option value="sent">送信済み</option>
                  <option value="accepted">承諾済み</option>
                  <option value="rejected">辞退済み</option>
                  <option value="expired">期限切れ</option>
                </select>
              </div>
            </div>
          </div>

          {/* Invitations List */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                送信済みスカウト ({filteredInvitations.length}件)
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
                  <h3 className="mt-2 text-sm font-medium text-gray-900">送信済みスカウトがありません</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {statusFilter === 'all' ? '学生にスカウトを送信してみましょう' : `${getStatusText(statusFilter)}のスカウトはありません`}
                  </p>
                  <button
                    onClick={openScoutModal}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
                  >
                    新規スカウト送信
                  </button>
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
                              <span className="font-medium">送信先学生:</span> {invitation.student.name}
                            </div>
                            <div>
                              <span className="font-medium">送信日:</span> {formatDate(invitation.sent_at)}
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
                            <button
                              onClick={() => handleDelete(invitation.id)}
                              disabled={deleting === invitation.id}
                              className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 text-sm"
                            >
                              {deleting === invitation.id ? '削除中...' : 'スカウト取消'}
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
                {/* Student Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">送信先学生</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-700">学生名:</span>
                      <span className="ml-2">{selectedInvitation.student.name}</span>
                    </div>
                  </div>
                </div>

                {/* Job Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">対象求人</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-700">求人タイトル:</span>
                      <span className="ml-2">{selectedInvitation.job_posting.title}</span>
                    </div>
                  </div>
                </div>

                {/* Invitation Status */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">スカウト状況</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-700">送信日時:</span>
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
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">送信したメッセージ</h4>
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
                  <button
                    onClick={() => handleDelete(selectedInvitation.id)}
                    disabled={deleting === selectedInvitation.id}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {deleting === selectedInvitation.id ? '削除中...' : 'スカウト取消'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scout Modal */}
      {showScoutModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  新規スカウト送信
                </h3>
                <button
                  onClick={closeScoutModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Student Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    学生を検索
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="学生名、大学名等で検索..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={searchStudents}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      検索
                    </button>
                  </div>
                  
                  {searchResults.length > 0 && (
                    <div className="mt-3 max-h-48 overflow-y-auto border border-gray-300 rounded-lg">
                      {searchResults.map((student) => (
                        <div
                          key={student.id}
                          onClick={() => setSelectedStudent(student)}
                          className={`p-3 cursor-pointer hover:bg-gray-50 ${
                            selectedStudent?.id === student.id ? 'bg-blue-50 border-blue-200' : ''
                          }`}
                        >
                          <div className="font-medium">{student.full_name}</div>
                          {student.university && (
                            <div className="text-sm text-gray-600">{student.university}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Student */}
                {selectedStudent && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">選択された学生</h4>
                    <div>
                      <span className="font-medium">{selectedStudent.full_name}</span>
                      {selectedStudent.university && (
                        <span className="ml-2 text-gray-600">({selectedStudent.university})</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    スカウトメッセージ
                  </label>
                  <textarea
                    value={scoutMessage}
                    onChange={(e) => setScoutMessage(e.target.value)}
                    rows={6}
                    placeholder="学生へのスカウトメッセージを入力してください..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 mt-8">
                <button
                  onClick={closeScoutModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSendScout}
                  disabled={!selectedStudent || !scoutMessage.trim() || sending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {sending ? '送信中...' : 'スカウト送信'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}