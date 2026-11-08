/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import {
  connectSocket,
  joinConversation,
  leaveConversation,
  onNewMessage,
} from '@/lib/socket';
import type { Conversation, User } from '@/types';
import type { ChatMessage, ParticipantLike, ConversationRef } from '@/types/chat';

function getInitials(name?: string) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function formatTime(dateStr?: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-MX', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function getDisplayName(user?: ParticipantLike | null): string {
  if (!user) return 'Usuario';
  return user.name || user.email || 'Usuario';
}

function getOtherParticipant(participants?: ParticipantLike[], currentUserId?: string) {
  if (!participants || participants.length === 0) return null;
  return participants.find(p => {
    const pId = p._id || p.id;
    return pId !== currentUserId;
  }) || null;
}

export function ChatWidget() {
  const { user, isAuthenticated } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userCacheRef = useRef<Record<string, ParticipantLike>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const response = await apiClient.get<{ success: boolean; data: { conversations: Conversation[] } }>(API_ENDPOINTS.chat.conversations);
      const conversationsData = response?.data?.conversations || [];
      setConversations(Array.isArray(conversationsData) ? conversationsData : []);

      conversationsData.forEach((conv: Conversation) => {
        conv.participants?.forEach((p: User) => {
          if (p._id && p.name) {
            userCacheRef.current[p._id] = p;
          }
        });
      });
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  }, []);

  const fetchMessages = useCallback(async (conversationId: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<{ data?: { messages?: ChatMessage[] } }>(
        API_ENDPOINTS.chat.messages(conversationId)
      );
      const messagesData = response?.data?.messages || [];
      setMessages(messagesData);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle opening chat from external events
  useEffect(() => {
    const handleOpenChat = async (e: CustomEvent<{ sellerId: string }>) => {
      const { sellerId } = e.detail;
      setIsOpen(true);
      try {
        const response = await apiClient.get<{ success?: boolean; data?: ConversationRef }>(
          API_ENDPOINTS.chat.getOrCreateConversation(sellerId)
        );

        const conv = response?.data;
        if (!conv) return;

        const convId = conv._id || conv.id;

        // Get seller info
        let otherUserInfo: ParticipantLike | undefined = userCacheRef.current[sellerId];
        if (!otherUserInfo) {
          try {
            const userResp: unknown = await apiClient.get(
              API_ENDPOINTS.users.get(sellerId)
            );
            const candidate = userResp as { data?: User } | User | null;
            // The API returns the user object directly, not wrapped in { data: user }
            const resolved = ((candidate as { data?: User })?.data || candidate) as User;
            if (resolved && resolved._id) {
              userCacheRef.current[sellerId] = resolved;
              otherUserInfo = resolved;
            }
            } catch (err) {
            console.error('Error fetching seller info:', err);
          }
        }

        // Build participants array with both users
        const participants = [
          {
            _id: user?._id || '',
            name: user?.name || 'Usuario',
            lastName: user?.lastName,
            profilePicUrl: user?.profilePicUrl,
            role: user?.role,
          },
          {
            _id: sellerId,
            name: otherUserInfo?.name || otherUserInfo?.email || 'Usuario',
            lastName: otherUserInfo?.lastName,
            profilePicUrl: otherUserInfo?.profilePicUrl,
            role: otherUserInfo?.role || 'seller',
          },
        ];

        const conversationObj: Conversation = {
          _id: convId || `conv-${Date.now()}`,
          participants: participants as unknown as User[],
          lastMessage: conv.lastMessage,
          updatedAt: conv.updatedAt || conv.createdAt || new Date().toISOString(),
        };

        setSelectedConversation(conversationObj);
        if (convId) fetchMessages(convId);
      } catch (error) {
        console.error('Error opening chat:', error);
      }
    };

    window.addEventListener('open-chat', handleOpenChat as unknown as EventListener);
    return () => window.removeEventListener('open-chat', handleOpenChat as unknown as EventListener);
  }, [fetchMessages, user]);

  // Socket connection and message handling
  useEffect(() => {
    if (isOpen && isAuthenticated && user) {
      connectSocket(user._id);
      // Deferred one microtask: the fetcher updates state synchronously
      // and react-hooks/set-state-in-effect forbids that inside effect
      // bodies.
      void Promise.resolve().then(fetchConversations);

      const cleanup = onNewMessage((data) => {
        const message = data.message;
        const senderId = message?.senderId || message?.sender?.id;
        const msgObj: ChatMessage = {
          _id: message?.id || message._id || `temp-${Date.now()}`,
          senderId: senderId || '',
          content: message.content || '',
          receiverId: message.receiverId || '',
          createdAt: message.createdAt || new Date().toISOString(),
        };

        setMessages((prev) => {
          if (prev.some((m) => m._id === msgObj._id)) return prev;
          return [...prev, msgObj];
        });

        fetchConversations();
      });

      return () => {
        if (cleanup) cleanup();
      };
    }
  }, [isOpen, isAuthenticated, user, fetchConversations, fetchMessages]);

  // Join/leave conversation rooms
  useEffect(() => {
    if (selectedConversation?._id) {
      void Promise.resolve().then(() => fetchMessages(selectedConversation._id));
      joinConversation(selectedConversation._id);
    }
    return () => {
      if (selectedConversation) leaveConversation(selectedConversation._id);
    };
  }, [selectedConversation, fetchMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedConversation?._id]);

  // Focus input when conversation selected
  useEffect(() => {
    if (selectedConversation && isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [selectedConversation, isOpen]);

  const handleSelectConversation = (conv: Conversation) => {
    const convId = conv._id || conv.id;
    if (!convId) return;
    setSelectedConversation({ ...conv, _id: convId });
  };

  const sendMessage = async (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !user) return;

    const otherUser = getOtherParticipant(selectedConversation.participants, user._id);
    if (!otherUser) return;

    const receiverId = otherUser._id || otherUser.id;
    if (!receiverId) return;

    setIsSending(true);

    // Optimistic update - add message immediately
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: ChatMessage = {
      _id: tempId,
      senderId: user._id,
      content: newMessage.trim(),
      receiverId,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage('');

    try {
      await apiClient.post(API_ENDPOINTS.chat.sendMessage, {
        receiverId,
        content: newMessage.trim(),
      });
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
    } finally {
      setIsSending(false);
    }
  };

  if (!isAuthenticated) return null;

  /* ─── FAB (Floating Action Button) ─────────────────────────── */
  if (!isOpen) {
    const hasUnread = conversations.some(c => c.lastMessage);
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="
            group relative flex items-center justify-center
            w-14 h-14 border-2 border-primary bg-primary
            hover:bg-primary-hover hover:border-primary-hover
            active:scale-95
            transition-all duration-200
          "
          aria-label="Abrir chat"
        >
          {hasUnread && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-none h-3 w-3 bg-primary" />
            </span>
          )}
          <svg
            className="w-6 h-6 text-white transition-transform duration-200 group-hover:scale-110"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      </div>
    );
  }

  /* ─── CHAT PANEL ─────────────────────────────────────────────── */
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col w-[360px] h-[540px] border-2 border-gray-200 bg-surface shadow-[8px_8px_0px_-2px_var(--gray-300)]">
      {/* ── HEADER ── */}
      {selectedConversation ? (
        <div className="flex items-center gap-3 px-4 py-3 bg-surface border-b-2 border-gray-200">
          <button
            onClick={() => setSelectedConversation(null)}
            className="flex items-center justify-center w-8 h-8 border-2 border-gray-200 hover:border-primary hover:text-primary transition-colors"
            aria-label="Volver"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {(() => {
            const other = getOtherParticipant(selectedConversation?.participants, user?._id);
            const name = getDisplayName(other);
            return (
              <>
                <div className="relative flex-shrink-0">
                  {other?.profilePicUrl ? (
                    <img src={other.profilePicUrl} alt={name} className="w-9 h-9 border-2 border-gray-200 object-cover" />
                  ) : (
                    <div className="w-9 h-9 border-2 border-primary/30 bg-primary-ghost flex items-center justify-center">
                      <span className="text-xs font-display font-bold text-primary">{getInitials(name)}</span>
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-success border-2 border-surface" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-display font-semibold text-foreground truncate">{name}</p>
                  <p className="text-[10px] font-mono text-success uppercase tracking-wider">En línea</p>
                </div>
              </>
            );
          })()}
        </div>
      ) : (
        <div className="flex items-center justify-between px-4 py-3 bg-surface border-b-2 border-gray-200">
          <div>
            <h3 className="text-xs font-display font-semibold text-foreground uppercase tracking-wider">Mensajes</h3>
            <p className="text-[10px] font-mono text-gray-400">{conversations.length} conversación{conversations.length !== 1 ? 'es' : ''}</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center w-8 h-8 border-2 border-gray-200 hover:border-danger hover:text-danger transition-colors"
            aria-label="Cerrar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* ── BODY ── */}
      {!selectedConversation ? (
        <div className="flex-1 overflow-y-auto bg-gray-50/50">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
              <div className="w-14 h-14 border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
                <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-display font-semibold text-gray-500">Sin conversaciones</p>
                <p className="text-[10px] font-mono text-gray-400 mt-1">Tus chats aparecerán aquí</p>
              </div>
            </div>
          ) : (
            <ul className="divide-y-2 divide-gray-200">
              {conversations.map((conv, idx) => {
                const otherUser = getOtherParticipant(conv.participants, user?._id);
                const key = conv._id || conv.id || `conv-${idx}`;
                const displayName = getDisplayName(otherUser);
                return (
                  <li key={key}>
                    <button
                      onClick={() => handleSelectConversation(conv)}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-surface hover:bg-gray-50 transition-colors text-left group"
                    >
                      <div className="relative flex-shrink-0">
                        {otherUser?.profilePicUrl ? (
                          <img src={otherUser.profilePicUrl} alt={displayName} className="w-10 h-10 border-2 border-gray-200 object-cover" />
                        ) : (
                          <div className="w-10 h-10 border-2 border-primary/30 bg-primary-ghost flex items-center justify-center">
                            <span className="text-sm font-display font-bold text-primary">{getInitials(displayName)}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-display font-semibold text-foreground truncate">{displayName}</p>
                          {conv.lastMessage?.createdAt && (
                            <span className="text-[10px] font-mono text-gray-400 ml-2 flex-shrink-0">
                              {formatTime(conv.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        {conv.lastMessage && (
                          <p className="text-[11px] text-gray-400 truncate mt-0.5">{conv.lastMessage.content}</p>
                        )}
                      </div>
                      <svg
                        className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-gray-50/50">
            {isLoading ? (
              <div className="space-y-3 pt-2">
                {[40, 60, 45, 70].map((w, i) => (
                  <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                    <div className="h-8 bg-gray-200 animate-pulse" style={{ width: `${w}%` }} />
                  </div>
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
                <p className="text-xs font-mono text-gray-400">Sé el primero en decir algo 👋</p>
              </div>
            ) : (
              <>
                {messages.map((msg, index) => {
                  const messageSenderId = msg.sender?.id || msg.senderId;
                  const isMine = messageSenderId === user?._id;
                  const prevMsg = messages[index - 1];
                  const showDate =
                    !prevMsg ||
                    new Date(msg.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString();

                  return (
                    <div key={msg._id || msg.id || `msg-${index}`}>
                      {showDate && (
                        <div className="flex items-center gap-2 my-3">
                          <div className="flex-1 h-px bg-gray-200" />
                          <span className="text-[10px] font-mono text-gray-400 px-2">
                            {formatDate(msg.createdAt)}
                          </span>
                          <div className="flex-1 h-px bg-gray-200" />
                        </div>
                      )}
                      <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`
                            group relative max-w-[78%] px-3 py-2 text-sm leading-relaxed
                            ${isMine
                              ? 'bg-primary text-white border-2 border-primary'
                              : 'bg-surface text-foreground border-2 border-gray-200'
                            }
                          `}
                        >
                          <p>{msg.content}</p>
                          <span className={`block text-right text-[10px] mt-1 leading-none ${isMine ? 'text-white/60' : 'text-gray-400'}`}>
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <form
            onSubmit={sendMessage}
            className="flex items-center gap-2 px-3 py-3 bg-surface border-t-2 border-gray-200"
          >
            <input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe un mensaje…"
              className="
                flex-1 text-sm bg-gray-100 border-2 border-gray-200 px-3 py-2.5
                placeholder:text-gray-400 text-foreground
                focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-ghost)]
                transition-all duration-200
              "
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              className="
                flex items-center justify-center w-10 h-10
                border-2 border-primary bg-primary text-white
                hover:bg-primary-hover hover:border-primary-hover
                disabled:opacity-40 disabled:cursor-not-allowed
                active:scale-95
                transition-all duration-150 flex-shrink-0
              "
              aria-label="Enviar"
            >
              <svg className="w-4 h-4 -translate-x-px" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </form>
        </>
      )}
    </div>
  );
}
