'use client';

import React, { useState, useEffect } from 'react';
import { invitations } from '../../lib/api';
import { useToast } from '@/components/Toast';
import Link from 'next/link';

interface Invitation {
  id: number;
  message: string;
  status: string;
  sent_at: string;
  responded_at: string | null;
  company: {
    id: number;
    name: string;
  };
  student: {
    id: number;
    name: string;
  };
  job_posting: {
    id: number;
    title: string;
    employment_type: string;
  };
  campaign_id?: string;
  is_bulk_sent?: boolean;
}

interface CampaignStats {
  campaign_id: string;
  total_sent: number;
  accepted: number;
  rejected: number;
  pending: number;
  acceptance_rate: number;
  job_posting_title: string;
  sent_at: string;
}

export default function ScoutCampaigns() {
  const { showToast } = useToast();
  const [sentInvitations, setSentInvitations] = useState<Invitation[]>([]);
  const [campaignStats, setCampaignStats] = useState<CampaignStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'campaigns' | 'individual'>('campaigns');
  const [statusFilter, setStatusFilter] = useState<'all' | 'sent' | 'accepted' | 'rejected'>('all');

  useEffect(() => {
    loadScoutData();
  }, []);

  const loadScoutData = async () => {
    setLoading(true);
    try {
      // 企業が送信したスカウト一覧を取得
      const response = await invitations.index(true); // sent=true for company
      const invitationsList = response.data.data;
      setSentInvitations(invitationsList);
      
      // 一括送信キャンペーンの統計を計算
      calculateCampaignStats(invitationsList);
    } catch (error) {
      console.error('Failed to load scout data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCampaignStats = (invitationsList: Invitation[]) => {
    const campaignMap = new Map<string, CampaignStats>();
    
    invitationsList
      .filter(inv => inv.is_bulk_sent && inv.campaign_id)
      .forEach(invitation => {
        const campaignId = invitation.campaign_id!;
        
        if (!campaignMap.has(campaignId)) {
          campaignMap.set(campaignId, {
            campaign_id: campaignId,
            total_sent: 0,
            accepted: 0,
            rejected: 0,
            pending: 0,
            acceptance_rate: 0,
            job_posting_title: invitation.job_posting.title,
            sent_at: invitation.sent_at
          });
        }
        
        const stats = campaignMap.get(campaignId)!;
        stats.total_sent++;
        
        switch (invitation.status) {
          case 'accepted':
            stats.accepted++;
            break;
          case 'rejected':
            stats.rejected++;
            break;
          case 'sent':
            stats.pending++;
            break;
        }
      });
    
    // 承諾率を計算
    campaignMap.forEach(stats => {
      const responded = stats.accepted + stats.rejected;
      stats.acceptance_rate = responded > 0 ? (stats.accepted / responded) * 100 : 0;
    });
    
    setCampaignStats(Array.from(campaignMap.values()).sort((a, b) => 
      new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()
    ));
  };

  const handleDeleteInvitation = async (invitationId: number) => {
    if (!confirm('このスカウトを削除しますか？（学生が既に返答している場合は削除できません）')) {
      return;
    }

    try {
      await invitations.delete(invitationId);
      loadScoutData();
    } catch (error: any) {
      const errorMessage = error.response?.data?.errors?.[0] || 'スカウト削除に失敗しました';
      showToast(errorMessage, 'error');
    }
  };

  const filteredIndividualInvitations = sentInvitations
    .filter(inv => !inv.is_bulk_sent)
    .filter(inv => statusFilter === 'all' || inv.status === statusFilter);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">未返答</span>;
      case 'accepted':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">承諾</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">辞退</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">{status}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">スカウト管理</h1>
              <p className="text-gray-600">送信したスカウトの管理と効果測定</p>
            </div>
            <Link
              href="/bulk-scout"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              一括スカウト送信
            </Link>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('campaigns')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'campaigns'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                一括スカウトキャンペーン ({campaignStats.length})
              </button>
              <button
                onClick={() => setActiveTab('individual')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'individual'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                個別スカウト ({filteredIndividualInvitations.length})
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'campaigns' ? (
          /* 一括スカウトキャンペーン */
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">一括スカウトキャンペーン</h2>
              <p className="text-gray-600 mt-1">キャンペーンごとの送信結果と効果を確認できます</p>
            </div>
            
            {campaignStats.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-500">一括スカウトキャンペーンがありません</div>
                <Link
                  href="/bulk-scout"
                  className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  初めての一括スカウト送信
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {campaignStats.map((campaign) => (
                  <div key={campaign.campaign_id} className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {campaign.job_posting_title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          送信日時: {formatDate(campaign.sent_at)}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{campaign.total_sent}</div>
                            <div className="text-sm text-gray-600">送信数</div>
                          </div>
                          <div className="bg-yellow-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-yellow-600">{campaign.pending}</div>
                            <div className="text-sm text-gray-600">未返答</div>
                          </div>
                          <div className="bg-green-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{campaign.accepted}</div>
                            <div className="text-sm text-gray-600">承諾</div>
                          </div>
                          <div className="bg-red-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">{campaign.rejected}</div>
                            <div className="text-sm text-gray-600">辞退</div>
                          </div>
                          <div className="bg-purple-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">
                              {campaign.acceptance_rate.toFixed(1)}%
                            </div>
                            <div className="text-sm text-gray-600">承諾率</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* 個別スカウト */
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">個別スカウト</h2>
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700">ステータス:</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">すべて</option>
                    <option value="sent">未返答</option>
                    <option value="accepted">承諾</option>
                    <option value="rejected">辞退</option>
                  </select>
                </div>
              </div>
            </div>
            
            {filteredIndividualInvitations.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-500">
                  {statusFilter === 'all' ? '個別スカウトがありません' : '該当するスカウトがありません'}
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredIndividualInvitations.map((invitation) => (
                  <div key={invitation.id} className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {invitation.student.name}
                          </h3>
                          {getStatusBadge(invitation.status)}
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">求人:</span> {invitation.job_posting.title}
                          <span className="ml-4 font-medium">雇用形態:</span> {invitation.job_posting.employment_type}
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-3">
                          <span className="font-medium">送信日時:</span> {formatDate(invitation.sent_at)}
                          {invitation.responded_at && (
                            <>
                              <span className="ml-4 font-medium">返答日時:</span> {formatDate(invitation.responded_at)}
                            </>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-700 p-3 bg-gray-50 rounded-lg">
                          <div className="font-medium mb-1">送信メッセージ:</div>
                          <div className="whitespace-pre-wrap">{invitation.message}</div>
                        </div>
                      </div>
                      
                      <div className="ml-6 flex-shrink-0">
                        {invitation.status === 'sent' && (
                          <button
                            onClick={() => handleDeleteInvitation(invitation.id)}
                            className="text-red-600 hover:text-red-900 text-sm"
                          >
                            削除
                          </button>
                        )}
                        {invitation.status === 'accepted' && (
                          <Link
                            href="/messages"
                            className="text-blue-600 hover:text-blue-900 text-sm"
                          >
                            メッセージ
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}