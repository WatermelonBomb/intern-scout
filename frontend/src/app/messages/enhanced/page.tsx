'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/Toast';
import { conversations, messages, type Conversation, type Message } from '@/lib/api';
import { getErrorMessage } from '@/lib/errors';

export default function EnhancedMessagesPage() {
  const { user, loading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  
  const [conversationList, setConversationList] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [conversationMessages, setConversationMessages] = useState<Message[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  
  // Reply functionality
  const [isReplying, setIsReplying] = useState(false);
  const [replyForm, setReplyForm] = useState({
    subject: '',
    content: ''
  });
  const [sendingReply, setSendingReply] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = useCallback(async () => {
    setConversationsLoading(true);
    try {
      const response = await conversations.index();
      setConversationList(response.data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setConversationsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      void loadConversations();
    }
  }, [user, loadConversations]);

  useEffect(() => {
    scrollToBottom();
  }, [conversationMessages]);

  const loadConversationMessages = async (conversation: Conversation) => {
    setMessagesLoading(true);
    setSelectedConversation(conversation);
    setConversationMessages([]);
    
    try {
      const response = await conversations.show(conversation.id);
      setConversationMessages(response.data.messages);
      
      // Mark messages as read
      const unreadMessages = response.data.messages.filter(
        (msg: Message) => msg.receiver.id === user?.id && !msg.read
      );
      
      for (const message of unreadMessages) {
        try {
          await messages.markAsRead(message.id);
        } catch (error) {
          console.error('Failed to mark message as read:', error);
        }
      }
      
      // Update conversation list to reflect read status
      setConversationList(prev => prev.map(conv => 
        conv.id === conversation.id 
          ? { ...conv, unread_count: 0 }
          : conv
      ));
      
    } catch (error) {
      console.error('Failed to load conversation messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleReply = async () => {
    if (!selectedConversation || !replyForm.subject.trim() || !replyForm.content.trim()) {
      return;
    }

    setSendingReply(true);
    try {
      const response = await messages.create({
        receiver_id: selectedConversation.other_user.id,
        subject: replyForm.subject,
        content: replyForm.content,
        conversation_id: selectedConversation.id
      });

      // Add new message to the conversation
      setConversationMessages(prev => [...prev, response.data]);
      
      // Update conversation in the list
      setConversationList(prev => prev.map(conv => 
        conv.id === selectedConversation.id
          ? {
              ...conv,
              last_message: {
                id: response.data.id,
                content: response.data.content,
                created_at: response.data.created_at,
                sender_id: response.data.sender.id
              },
              last_message_at: response.data.created_at
            }
          : conv
      ));
      
      // Reset form
      setReplyForm({ subject: '', content: '' });
      setIsReplying(false);
      
    } catch (error) {
      showToast(getErrorMessage(error, 'メッセージの送信に失敗しました'), 'error');
    } finally {
      setSendingReply(false);
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
      return date.toLocaleDateString('ja-JP', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
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
                onClick={() => router.push('/messages')}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                旧バージョン
              </button>
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
              メッセージ (Enhanced)
            </h1>
            <p className="mt-2 text-gray-600">
              会話形式でメッセージのやり取りを確認・返信できます
            </p>
          </div>

          <div className="flex h-[600px] bg-white shadow rounded-lg overflow-hidden">
            {/* Conversations List */}
            <div className="w-1/3 border-r border-gray-200">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  会話一覧
                </h2>
              </div>
              <div className="overflow-y-auto h-full">
                {conversationsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : conversationList.length === 0 ? (
                  <div className="p-6 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">会話がありません</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {user.user_type === 'student' 
                        ? 'スカウトメッセージが届くのをお待ちください'
                        : '学生にメッセージを送信してみましょう'
                      }
                    </p>
                  </div>
                ) : (
                  conversationList.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => loadConversationMessages(conversation)}
                      className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                        selectedConversation?.id === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold">
                              {conversation.other_user.full_name[0]}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {conversation.other_user.full_name}
                            </p>
                            {conversation.unread_count > 0 && (
                              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                                {conversation.unread_count}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mb-1">
                            {conversation.other_user.user_type === 'company' ? '企業' : '学生'}
                          </p>
                          {conversation.last_message && (
                            <p className="text-sm text-gray-600 truncate">
                              {conversation.last_message.content}
                            </p>
                          )}
                          {conversation.last_message_at && (
                            <p className="text-xs text-gray-400 mt-1">
                              {formatDate(conversation.last_message_at)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Conversation Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {selectedConversation.other_user.full_name[0]}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {selectedConversation.other_user.full_name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {selectedConversation.other_user.user_type === 'company' ? '企業' : '学生'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsReplying(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        返信
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messagesLoading ? (
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      </div>
                    ) : (
                      conversationMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender.id === user.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender.id === user.id 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-200 text-gray-900'
                          }`}>
                            <div className="text-sm font-medium mb-1">
                              {message.subject}
                            </div>
                            <div className="text-sm whitespace-pre-line">
                              {message.content}
                            </div>
                            <div className={`text-xs mt-2 ${
                              message.sender.id === user.id ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {formatDate(message.created_at)}
                              {message.sender.id !== user.id && message.read && ' • 既読'}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Reply Form */}
                  {isReplying && (
                    <div className="border-t border-gray-200 p-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">件名</label>
                          <input
                            type="text"
                            value={replyForm.subject}
                            onChange={(e) => setReplyForm(prev => ({ ...prev, subject: e.target.value }))}
                            placeholder="返信: "
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">メッセージ</label>
                          <textarea
                            rows={4}
                            value={replyForm.content}
                            onChange={(e) => setReplyForm(prev => ({ ...prev, content: e.target.value }))}
                            placeholder="返信メッセージを入力してください..."
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div className="flex justify-end space-x-4">
                          <button
                            onClick={() => {
                              setIsReplying(false);
                              setReplyForm({ subject: '', content: '' });
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                          >
                            キャンセル
                          </button>
                          <button
                            onClick={handleReply}
                            disabled={sendingReply || !replyForm.subject.trim() || !replyForm.content.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                          >
                            {sendingReply ? '送信中...' : '返信'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">会話を選択してください</h3>
                    <p className="mt-1 text-sm text-gray-500">左側のリストから会話をクリックしてメッセージを表示</p>
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
