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
  const [selectedConversation, setSelectedConversation] = useState<{user: any, messages: Message[]} | null>(null);
  
  // Reply functionality - always visible
  const [replyContent, setReplyContent] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

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

  const handleConversationClick = async (clickedMessage: Message) => {
    const otherUser = clickedMessage.sender.id === user?.id ? clickedMessage.receiver : clickedMessage.sender;
    
    // Get all messages between current user and the other user
    const conversationMessages = messageList.filter(msg => 
      (msg.sender.id === user?.id && msg.receiver.id === otherUser.id) ||
      (msg.sender.id === otherUser.id && msg.receiver.id === user?.id)
    ).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    
    setSelectedConversation({
      user: otherUser,
      messages: conversationMessages
    });

    // Mark unread messages as read
    const unreadMessages = conversationMessages.filter(msg => 
      msg.receiver.id === user?.id && !msg.read
    );
    
    for (const message of unreadMessages) {
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

  const handleSendReply = async () => {
    if (!selectedConversation || !replyContent.trim()) {
      return;
    }

    setSendingReply(true);
    try {
      const response = await messages.create({
        receiver_id: selectedConversation.user.id,
        subject: `Re: 会話`,
        content: replyContent
      });

      // Add the new message to the conversation
      const newMessage = response.data;
      setSelectedConversation(prev => prev ? {
        ...prev,
        messages: [...prev.messages, newMessage]
      } : null);

      // Also add to the main message list
      setMessageList(prev => [newMessage, ...prev]);
      
      // Reset form
      setReplyContent('');
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.errors?.[0] || 'メッセージの送信に失敗しました';
      alert(errorMessage);
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
              チャット
            </h1>
            <p className="mt-2 text-gray-600">
              {user.user_type === 'student' 
                ? '企業とのメッセージのやり取りができます' 
                : '学生とのメッセージのやり取りができます'
              }
            </p>
          </div>

          <div className="flex h-[600px] bg-white shadow rounded-lg overflow-hidden">
            {/* Message List */}
            <div className="w-1/3 border-r border-gray-200">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  会話一覧
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
                  // Group messages by conversation partner
                  Array.from(new Map(
                    messageList.map(msg => {
                      const otherUser = msg.sender.id === user?.id ? msg.receiver : msg.sender;
                      return [otherUser.id, {
                        otherUser,
                        latestMessage: msg,
                        unreadCount: messageList.filter(m => 
                          ((m.sender.id === otherUser.id && m.receiver.id === user?.id) ||
                           (m.sender.id === user?.id && m.receiver.id === otherUser.id)) &&
                          m.receiver.id === user?.id && !m.read
                        ).length
                      }];
                    })
                  ).values()).map((conversation) => (
                    <div
                      key={conversation.otherUser.id}
                      onClick={() => handleConversationClick(conversation.latestMessage)}
                      className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                        selectedConversation?.user.id === conversation.otherUser.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold">
                              {conversation.otherUser.full_name[0]}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {conversation.otherUser.full_name}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mb-1">
                            {conversation.otherUser.user_type === 'company' ? '企業' : '学生'}
                          </p>
                          <p className="text-sm text-gray-600 truncate">
                            {conversation.latestMessage.content}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(conversation.latestMessage.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {selectedConversation.user.full_name[0]}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {selectedConversation.user.full_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {selectedConversation.user.user_type === 'company' ? '企業' : '学生'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {selectedConversation.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender.id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                          message.sender.id === user?.id 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-white text-gray-900 border'
                        }`}>
                          <div className="text-sm whitespace-pre-line">
                            {message.content}
                          </div>
                          <div className={`text-xs mt-2 ${
                            message.sender.id === user?.id ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {formatDate(message.created_at)}
                            {message.sender.id !== user?.id && message.read && ' • 既読'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reply Form - Always Visible */}
                  <div className="border-t border-gray-200 p-4 bg-white">
                    <div className="flex items-end space-x-2">
                      <div className="flex-1">
                        <textarea
                          rows={2}
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="メッセージを入力..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendReply();
                            }
                          }}
                        />
                      </div>
                      <button
                        onClick={handleSendReply}
                        disabled={sendingReply || !replyContent.trim()}
                        className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">会話を選択してください</h3>
                    <p className="mt-1 text-sm text-gray-500">左側のリストから会話をクリックしてチャットを開始</p>
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