'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { messages, Message } from '@/lib/api';

export default function MessagesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [messageList, setMessageList] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showMessageDetail, setShowMessageDetail] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadMessages();
    }
  }, [user]);

  const loadMessages = async () => {
    setMessagesLoading(true);
    try {
      const response = await messages.index();
      setMessageList(response.data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleMessageClick = async (message: Message) => {
    setSelectedMessage(message);
    setShowMessageDetail(true);

    // Mark as read if user is receiver and message is unread
    if (message.receiver.id === user?.id && !message.read) {
      try {
        await messages.markAsRead(message.id);
        // Update local state
        setMessageList(prev => prev.map(m => 
          m.id === message.id ? { ...m, read: true, read_at: new Date().toISOString() } : m
        ));
      } catch (error) {
        console.error('Failed to mark message as read:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return '1時間未満前';
    } else if (diffInHours < 24) {
      return `${diffInHours}時間前`;
    } else if (diffInHours < 48) {
      return '1日前';
    } else {
      return date.toLocaleDateString('ja-JP');
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

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              メッセージ
            </h1>
            <p className="mt-2 text-gray-600">
              {user.user_type === 'student' 
                ? '企業からのスカウトメッセージを確認できます' 
                : '送信したメッセージの履歴を確認できます'
              }
            </p>
          </div>

          <div className="flex h-96 bg-white shadow rounded-lg overflow-hidden">
            {/* Message List */}
            <div className="w-1/3 border-r border-gray-200">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  メッセージ一覧
                </h2>
              </div>
              <div className="overflow-y-auto h-full">
                {messagesLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : messageList.length === 0 ? (
                  <div className="p-6 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">メッセージがありません</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {user.user_type === 'student' 
                        ? 'スカウトメッセージが届くのをお待ちください'
                        : '学生にメッセージを送信してみましょう'
                      }
                    </p>
                  </div>
                ) : (
                  messageList.map((message) => (
                    <div
                      key={message.id}
                      onClick={() => handleMessageClick(message)}
                      className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                        selectedMessage?.id === message.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {user.user_type === 'student' 
                                ? message.sender.full_name[0]
                                : message.receiver.full_name[0]
                              }
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {user.user_type === 'student' 
                                ? message.sender.full_name
                                : `To: ${message.receiver.full_name}`
                              }
                            </p>
                            {user.user_type === 'student' && !message.read && (
                              <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-900 font-medium truncate">
                            {message.subject}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {message.content}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(message.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Message Detail */}
            <div className="flex-1">
              {selectedMessage ? (
                <div className="h-full flex flex-col">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {selectedMessage.subject}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {user.user_type === 'student' 
                            ? `From: ${selectedMessage.sender.full_name}`
                            : `To: ${selectedMessage.receiver.full_name}`
                          } • {formatDate(selectedMessage.created_at)}
                        </p>
                      </div>
                      <button
                        onClick={() => setShowMessageDetail(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 p-6 overflow-y-auto">
                    <div className="prose max-w-none">
                      <div className="whitespace-pre-line text-gray-900">
                        {selectedMessage.content}
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        {selectedMessage.read ? '既読' : '未読'}
                      </div>
                      {user.user_type === 'student' && (
                        <div className="text-sm text-gray-500">
                          スカウトメッセージへの返信は、送信者のメールアドレスに直接お返事ください
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">メッセージを選択してください</h3>
                    <p className="mt-1 text-sm text-gray-500">左側のリストからメッセージをクリックして詳細を表示</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}