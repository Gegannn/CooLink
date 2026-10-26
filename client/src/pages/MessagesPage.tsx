import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  MessageSquare,
  Send,
  ShieldCheck,
  CheckCheck,
} from 'lucide-react';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/conversations');
      const convs = res.data.data.conversations;
      setConversations(convs);
      if (convs.length > 0 && !activeConv) {
        setActiveConv(convs[0]);
      }
    } catch (e) {
      console.warn('Failed to fetch conversations', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const res = await api.get(`/conversations/${convId}/messages`);
      setMessages(res.data.data.messages);
    } catch (e) {
      console.warn('Failed to fetch messages', e);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConv?._id) {
      fetchMessages(activeConv._id);
      const interval = setInterval(() => fetchMessages(activeConv._id), 4000);
      return () => clearInterval(interval);
    }
  }, [activeConv]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeConv?._id) return;

    setSending(true);
    try {
      await api.post(`/conversations/${activeConv._id}/messages`, {
        content: inputMessage,
      });
      setInputMessage('');
      fetchMessages(activeConv._id);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const getOtherParticipant = (conv: any) => {
    return conv.participants?.find((p: any) => p._id !== user?._id) || {};
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-3 h-[750px]">
        {/* Left Sidebar: Conversations */}
        <div className="border-r border-slate-200 flex flex-col h-full bg-slate-50/50">
          <div className="p-4 border-b border-slate-200 bg-white">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-brand-600" />
              <span>Job Conversations</span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Unlocked only after work request acceptance to protect your privacy.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No active conversations yet. Once a job or request is accepted, chat is unlocked.
              </div>
            ) : (
              conversations.map((conv) => {
                const other = getOtherParticipant(conv);
                const isSelected = activeConv?._id === conv._id;

                return (
                  <button
                    key={conv._id}
                    onClick={() => setActiveConv(conv)}
                    className={`w-full text-left p-4 transition flex items-start space-x-3 ${
                      isSelected ? 'bg-brand-50/80 border-r-4 border-brand-600' : 'hover:bg-slate-100'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center flex-shrink-0">
                      {other.fullName?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs text-slate-900 truncate">
                          {other.fullName || 'User'}
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {conv.lastMessage || 'Start conversation...'}
                      </p>
                      {conv.jobId && (
                        <span className="inline-block text-[10px] font-semibold text-brand-700 bg-brand-100/60 px-1.5 py-0.5 rounded mt-1">
                          {conv.jobId.title || 'Job assignment'}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Message Thread */}
        <div className="col-span-2 flex flex-col h-full bg-white">
          {activeConv ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center">
                    {getOtherParticipant(activeConv).fullName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h3 className="font-bold text-sm text-slate-900">
                        {getOtherParticipant(activeConv).fullName || 'Participant'}
                      </h3>
                      {getOtherParticipant(activeConv).verificationStatus === 'VERIFIED' && (
                        <ShieldCheck className="w-4 h-4 text-blue-600 fill-blue-50" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Role: {getOtherParticipant(activeConv).role}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
                {messages.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 text-xs">
                    No messages yet. Send a message to coordinate work site landmark or timing.
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMine = m.senderId?._id === user?._id || m.senderId === user?._id;

                    return (
                      <div
                        key={m._id}
                        className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs shadow-xs ${
                            isMine
                              ? 'bg-brand-600 text-white rounded-br-xs'
                              : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                          }`}
                        >
                          <p className="leading-relaxed">{m.content}</p>
                          <div
                            className={`flex items-center justify-end space-x-1 mt-1 text-[9px] ${
                              isMine ? 'text-brand-200' : 'text-slate-400'
                            }`}
                          >
                            <span>
                              {new Date(m.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {isMine && <CheckCheck className="w-3 h-3" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Type a message to coordinate..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  type="submit"
                  disabled={sending || !inputMessage.trim()}
                  className="p-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
              Select a conversation to start messaging.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
