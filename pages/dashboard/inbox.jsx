import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../src/components/DashboardLayout';
import { useAuth } from '../../src/context/AuthContext';
import { io as socketIO } from 'socket.io-client';
import {
  Search,
  Filter,
  Send,
  Lock,
  UserCheck,
  Bot,
  User,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Sparkles,
  Tag,
  ThumbsUp,
} from 'lucide-react';

export default function SupportInboxPage() {
  const { token, organization, user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeConv, setActiveConv] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Message reply state
  const [replyText, setReplyText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (token) {
      fetchConversations();
    }
  }, [token, statusFilter]);

  // Connect Socket.io for real-time updates
  useEffect(() => {
    if (!organization) return;
    const socket = socketIO();

    socket.emit('join:org', organization.id);

    socket.on('message:new', (data) => {
      fetchConversations();
      if (selectedId === data.conversationId) {
        fetchConversationDetails(selectedId);
      }
    });

    socket.on('conversation:updated', () => {
      fetchConversations();
      if (selectedId) fetchConversationDetails(selectedId);
    });

    return () => {
      socket.disconnect();
    };
  }, [organization, selectedId]);

  const fetchConversations = async () => {
    try {
      const url = `/api/v1/conversations?status=${statusFilter}&search=${encodeURIComponent(search)}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
        if (data.conversations.length > 0 && !selectedId) {
          setSelectedId(data.conversations[0].id);
          fetchConversationDetails(data.conversations[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    }
  };

  const fetchConversationDetails = async (id) => {
    try {
      const res = await fetch(`/api/v1/conversations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setActiveConv(data.conversation);
      }
    } catch (err) {
      console.error('Failed to fetch conversation details:', err);
    }
  };

  const handleSelectConversation = (id) => {
    setSelectedId(id);
    fetchConversationDetails(id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedId || sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/v1/conversations/${selectedId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: replyText,
          isInternalNote,
        }),
      });

      if (res.ok) {
        setReplyText('');
        fetchConversationDetails(selectedId);
        fetchConversations();
      }
    } catch (err) {
      console.error('Send message error:', err);
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedId) return;
    try {
      const res = await fetch(`/api/v1/conversations/${selectedId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchConversationDetails(selectedId);
        fetchConversations();
      }
    } catch (err) {}
  };

  return (
    <DashboardLayout title="Support Inbox">
      <div className="h-[calc(100vh-7rem)] -m-6 flex bg-white font-sans overflow-hidden">
        {/* Left Pane: Conversation List */}
        <div className="w-80 border-r border-surface-200 flex flex-col bg-white shrink-0">
          {/* Status Tabs */}
          <div className="p-3 border-b border-surface-200 space-y-2">
            <div className="flex gap-1 bg-surface-100 p-1 rounded-md text-2xs font-medium text-surface-600">
              {['ALL', 'OPEN', 'ESCALATED', 'RESOLVED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`flex-1 py-1 rounded transition-colors ${
                    statusFilter === st
                      ? 'bg-white text-surface-900 shadow-xs font-semibold'
                      : 'hover:text-surface-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-surface-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchConversations()}
                className="w-full pl-8 pr-3 py-1.5 bg-surface-50 border border-surface-200 rounded text-xs outline-none focus:border-surface-900"
              />
            </div>
          </div>

          {/* List Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-surface-100">
            {conversations.map((conv) => {
              const isSelected = conv.id === selectedId;
              const lastMsg = conv.messages && conv.messages[0] ? conv.messages[0] : null;

              return (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`w-full text-left p-3 hover:bg-surface-50 transition-colors flex flex-col gap-1.5 ${
                    isSelected ? 'bg-surface-100/70 border-l-2 border-surface-900' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-surface-900 truncate">
                      {conv.customer ? conv.customer.name || conv.customer.email : 'Anonymous Visitor'}
                    </span>
                    <span className="text-2xs text-surface-400">
                      {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-surface-600 line-clamp-1 font-medium">
                    {conv.subject || (lastMsg ? lastMsg.content : 'No message history')}
                  </p>

                  <div className="flex items-center gap-2 pt-0.5">
                    <span
                      className={`px-1.5 py-0.2 rounded text-2xs font-semibold ${
                        conv.status === 'ESCALATED'
                          ? 'bg-amber-100 text-amber-800'
                          : conv.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {conv.status}
                    </span>
                    {conv.isAiResolved && (
                      <span className="text-2xs text-emerald-600 font-medium">AI Resolved</span>
                    )}
                  </div>
                </button>
              );
            })}

            {conversations.length === 0 && (
              <div className="p-8 text-center text-xs text-surface-400">
                No conversations found.
              </div>
            )}
          </div>
        </div>

        {/* Middle Pane: Thread Detail */}
        {activeConv ? (
          <div className="flex-1 flex flex-col bg-surface-50 min-w-0">
            {/* Conversation Header */}
            <div className="h-14 border-b border-surface-200 bg-white px-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-200 flex items-center justify-center font-bold text-xs text-surface-700">
                  {activeConv.customer?.name ? activeConv.customer.name.charAt(0) : 'C'}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-surface-900">
                    {activeConv.customer?.name || activeConv.customer?.email || 'Anonymous Customer'}
                  </h3>
                  <p className="text-2xs text-surface-500">
                    Channel: <span className="font-mono text-surface-700">{activeConv.channel}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <select
                  value={activeConv.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="text-xs font-semibold px-2.5 py-1 rounded bg-surface-100 border border-surface-200 text-surface-800 outline-none"
                >
                  <option value="OPEN">Status: OPEN</option>
                  <option value="WAITING">Status: WAITING</option>
                  <option value="ESCALATED">Status: ESCALATED</option>
                  <option value="RESOLVED">Status: RESOLVED</option>
                </select>
              </div>
            </div>

            {/* Message Thread History */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {activeConv.messages.map((msg) => {
                const isInternal = msg.isInternalNote;
                const isCustomer = msg.senderType === 'CUSTOMER';
                const isAI = msg.senderType === 'AI';

                let sources = [];
                try {
                  sources = msg.sources ? JSON.parse(msg.sources) : [];
                } catch (e) {}

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      isCustomer ? 'items-start' : 'items-end'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-2xs text-surface-400 mb-1 px-1">
                      {isAI && <Bot className="w-3 h-3 text-brand-600" />}
                      <span className="font-semibold text-surface-700">
                        {isCustomer
                          ? activeConv.customer?.name || 'Customer'
                          : isAI
                          ? 'Resolve AI'
                          : isInternal
                          ? 'Internal Note'
                          : 'Human Agent'}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div
                      className={`max-w-xl p-3 rounded-lg text-xs leading-relaxed ${
                        isInternal
                          ? 'bg-amber-50 border border-amber-200 text-amber-900'
                          : isCustomer
                          ? 'bg-white border border-surface-200 text-surface-900 shadow-2xs'
                          : isAI
                          ? 'bg-surface-900 text-white shadow-2xs'
                          : 'bg-brand-600 text-white'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>

                      {sources.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-surface-700/50 text-2xs text-surface-300 flex items-center gap-1">
                          <span>Source:</span>
                          <span className="font-mono underline">{sources.map((s) => s.name).join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Footer */}
            <div className="p-3 bg-white border-t border-surface-200">
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => setIsInternalNote(false)}
                  className={`text-2xs font-semibold px-2.5 py-1 rounded transition-colors ${
                    !isInternalNote
                      ? 'bg-surface-900 text-white'
                      : 'bg-surface-100 text-surface-600'
                  }`}
                >
                  Reply to Customer
                </button>
                <button
                  onClick={() => setIsInternalNote(true)}
                  className={`text-2xs font-semibold px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                    isInternalNote
                      ? 'bg-amber-500 text-white'
                      : 'bg-surface-100 text-surface-600'
                  }`}
                >
                  <Lock className="w-3 h-3" />
                  Internal Note
                </button>
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  placeholder={
                    isInternalNote
                      ? 'Add an internal note visible only to team members...'
                      : 'Write a response to the customer...'
                  }
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-3 py-2 border border-surface-300 rounded text-xs outline-none focus:border-surface-900"
                />
                <button
                  type="submit"
                  disabled={sending || !replyText.trim()}
                  className="px-4 py-2 bg-surface-900 hover:bg-surface-800 text-white text-xs font-semibold rounded disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-surface-400 bg-surface-50">
            Select a conversation to inspect.
          </div>
        )}

        {/* Right Pane: Customer Metadata Profile */}
        {activeConv && activeConv.customer && (
          <div className="w-72 border-l border-surface-200 bg-white p-4 shrink-0 font-sans space-y-6">
            <div>
              <h4 className="text-xs font-bold text-surface-900 uppercase tracking-wider mb-3">
                Customer Profile
              </h4>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-surface-500 text-2xs block">Name</span>
                  <span className="font-semibold text-surface-900">
                    {activeConv.customer.name || 'Anonymous'}
                  </span>
                </div>
                <div>
                  <span className="text-surface-500 text-2xs block">Email</span>
                  <span className="font-mono text-surface-800">
                    {activeConv.customer.email || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-surface-500 text-2xs block">CSAT Rating</span>
                  <span className="font-semibold text-emerald-700">
                    ★ {activeConv.customer.csatAvg || '5.0'} / 5.0
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-surface-200">
              <h4 className="text-xs font-bold text-surface-900 uppercase tracking-wider mb-2">
                Conversation Context
              </h4>
              <div className="space-y-1.5 text-2xs text-surface-600">
                <div className="flex justify-between">
                  <span>Priority:</span>
                  <span className="font-semibold text-surface-900">{activeConv.priority}</span>
                </div>
                <div className="flex justify-between">
                  <span>AI Resolution:</span>
                  <span className="font-semibold text-emerald-700">
                    {activeConv.isAiResolved ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
