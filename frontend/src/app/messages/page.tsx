'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/Toast';
import { messages, Message } from '@/lib/api';

// Add CSS animation for spinner
const spinnerStyles = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

export default function MessagesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  
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
      showToast(errorMessage, 'error');
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ 
          animation: 'spin 1s linear infinite',
          borderRadius: '50%',
          height: '32px',
          width: '32px',
          borderBottom: '2px solid #2563eb'
        }}></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <style dangerouslySetInnerHTML={{ __html: spinnerStyles }} />
      {/* Navigation */}
      <nav style={{ backgroundColor: 'white', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', height: '4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ 
                  width: '2rem', 
                  height: '2rem', 
                  backgroundColor: '#2563eb', 
                  borderRadius: '0.5rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.125rem' }}>IS</span>
                </div>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>InternScout</h1>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={() => router.push('/dashboard')}
                style={{ 
                  color: '#4b5563', 
                  fontWeight: '500',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  transition: 'color 0.15s ease-in-out'
                }}
                onMouseEnter={(e) => e.target.style.color = '#111827'}
                onMouseLeave={(e) => e.target.style.color = '#4b5563'}
              >
                ダッシュボード
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1.5rem 1rem' }}>
        <div style={{ padding: '1.5rem 0' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827' }}>
              チャット
            </h1>
            <p style={{ marginTop: '0.5rem', color: '#4b5563' }}>
              {user.user_type === 'student' 
                ? '企業とのメッセージのやり取りができます' 
                : '学生とのメッセージのやり取りができます'
              }
            </p>
          </div>

          <div style={{ 
            display: 'flex', 
            height: '600px', 
            backgroundColor: 'white', 
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', 
            borderRadius: '0.5rem', 
            overflow: 'hidden' 
          }}>
            {/* Message List */}
            <div style={{ width: '33.333333%', borderRight: '1px solid #e5e7eb' }}>
              <div style={{ 
                backgroundColor: '#f9fafb', 
                padding: '1rem 1.5rem', 
                borderBottom: '1px solid #e5e7eb' 
              }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827' }}>
                  会話一覧
                </h2>
              </div>
              <div style={{ overflowY: 'auto', height: '100%' }}>
                {messagesLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}>
                    <div style={{
                      animation: 'spin 1s linear infinite',
                      borderRadius: '50%',
                      height: '1.5rem',
                      width: '1.5rem',
                      borderBottom: '2px solid #2563eb'
                    }}></div>
                  </div>
                ) : messageList.length === 0 ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <svg style={{ margin: '0 auto', height: '3rem', width: '3rem', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <h3 style={{ marginTop: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>メッセージがありません</h3>
                    <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#6b7280' }}>
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
                      style={{
                        padding: '1rem',
                        borderBottom: '1px solid #e5e7eb',
                        cursor: 'pointer',
                        backgroundColor: selectedConversation?.user.id === conversation.otherUser.id ? '#eff6ff' : 'white',
                        borderColor: selectedConversation?.user.id === conversation.otherUser.id ? '#bfdbfe' : '#e5e7eb',
                        transition: 'background-color 0.15s ease-in-out'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedConversation?.user.id !== conversation.otherUser.id) {
                          e.target.style.backgroundColor = '#f9fafb';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedConversation?.user.id !== conversation.otherUser.id) {
                          e.target.style.backgroundColor = 'white';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                        <div style={{ flexShrink: 0 }}>
                          <div style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            backgroundColor: '#2563eb',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <span style={{ color: 'white', fontWeight: '600' }}>
                              {conversation.otherUser.full_name[0]}
                            </span>
                          </div>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <p style={{
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              color: '#111827',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {conversation.otherUser.full_name}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '0.125rem 0.5rem',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                lineHeight: 1,
                                color: 'white',
                                backgroundColor: '#dc2626',
                                borderRadius: '9999px'
                              }}>
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                            {conversation.otherUser.user_type === 'company' ? '企業' : '学生'}
                          </p>
                          <p style={{
                            fontSize: '0.875rem',
                            color: '#4b5563',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {conversation.latestMessage.content}
                          </p>
                          <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
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
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div style={{
                    backgroundColor: '#f9fafb',
                    padding: '1rem 1.5rem',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '2rem',
                        height: '2rem',
                        background: 'linear-gradient(to bottom right, #3b82f6, #8b5cf6)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <span style={{ color: 'white', fontWeight: '600', fontSize: '0.875rem' }}>
                          {selectedConversation.user.full_name[0]}
                        </span>
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827' }}>
                          {selectedConversation.user.full_name}
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                          {selectedConversation.user.user_type === 'company' ? '企業' : '学生'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    backgroundColor: '#f9fafb'
                  }}>
                    {selectedConversation.messages.map((message) => (
                      <div
                        key={message.id}
                        style={{
                          display: 'flex',
                          justifyContent: message.sender.id === user?.id ? 'flex-end' : 'flex-start'
                        }}
                      >
                        <div style={{
                          maxWidth: message.sender.id === user?.id ? '20rem' : '20rem',
                          padding: '0.75rem 1rem',
                          borderRadius: '1rem',
                          backgroundColor: message.sender.id === user?.id ? '#3b82f6' : 'white',
                          color: message.sender.id === user?.id ? 'white' : '#111827',
                          border: message.sender.id === user?.id ? 'none' : '1px solid #e5e7eb',
                          boxShadow: message.sender.id === user?.id ? 'none' : '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                        }}>
                          <div style={{
                            fontSize: '0.875rem',
                            whiteSpace: 'pre-line',
                            lineHeight: '1.25'
                          }}>
                            {message.content}
                          </div>
                          <div style={{
                            fontSize: '0.75rem',
                            marginTop: '0.5rem',
                            color: message.sender.id === user?.id ? 'rgba(255, 255, 255, 0.7)' : '#6b7280'
                          }}>
                            {formatDate(message.created_at)}
                            {message.sender.id !== user?.id && message.read && ' • 既読'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reply Form - Always Visible */}
                  <div style={{
                    borderTop: '1px solid #e5e7eb',
                    padding: '1rem',
                    backgroundColor: 'white'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
                      <div style={{ flex: 1 }}>
                        <textarea
                          rows={2}
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="メッセージを入力..."
                          style={{
                            width: '100%',
                            padding: '0.5rem 0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.5rem',
                            outline: 'none',
                            resize: 'none',
                            fontSize: '0.875rem',
                            lineHeight: '1.25'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#3b82f6';
                            e.target.style.boxShadow = '0 0 0 1px #3b82f6';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#d1d5db';
                            e.target.style.boxShadow = 'none';
                          }}
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
                        style={{
                          backgroundColor: sendingReply || !replyContent.trim() ? '#9ca3af' : '#3b82f6',
                          color: 'white',
                          padding: '0.5rem',
                          borderRadius: '50%',
                          border: 'none',
                          cursor: sendingReply || !replyContent.trim() ? 'not-allowed' : 'pointer',
                          opacity: sendingReply || !replyContent.trim() ? 0.5 : 1,
                          transition: 'all 0.15s ease-in-out',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onMouseEnter={(e) => {
                          if (!sendingReply && replyContent.trim()) {
                            e.target.style.backgroundColor = '#2563eb';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!sendingReply && replyContent.trim()) {
                            e.target.style.backgroundColor = '#3b82f6';
                          }
                        }}
                      >
                        <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f9fafb'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <svg style={{ margin: '0 auto', height: '3rem', width: '3rem', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <h3 style={{ marginTop: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>会話を選択してください</h3>
                    <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#6b7280' }}>左側のリストから会話をクリックしてチャットを開始</p>
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