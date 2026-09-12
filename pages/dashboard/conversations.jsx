import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../src/components/DashboardLayout';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter } from 'next/router';
import { MessageSquare, Search, Filter, ExternalLink, Bot, User, ShieldAlert } from 'lucide-react';

export default function ConversationsDirectoryPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) fetchConversations();
  }, [token, statusFilter]);

  const fetchConversations = async () => {
    try {
      const res = await fetch(
        `/api/v1/conversations?status=${statusFilter}&search=${encodeURIComponent(search)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (err) {
      console.error('Fetch conversations error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Conversation History & Logs">
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-surface-200">
          <div>
            <h2 className="text-lg font-bold text-surface-900">All Conversations</h2>
            <p className="text-xs text-surface-600 mt-0.5">
              Full audit trail of customer interactions, AI answers, and human escalations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex gap-1 bg-surface-100 p-1 rounded-md text-2xs font-semibold text-surface-600">
              {['ALL', 'OPEN', 'ESCALATED', 'RESOLVED'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    statusFilter === s ? 'bg-white text-surface-900 shadow-xs' : 'hover:text-surface-900'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-surface-400" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchConversations()}
                className="w-full pl-8 pr-3 py-1.5 bg-surface-50 border border-surface-200 rounded text-xs outline-none focus:border-surface-900"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-surface-200 rounded-lg overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="table-header">Customer</th>
                <th className="table-header">Subject / Initial Query</th>
                <th className="table-header">Status</th>
                <th className="table-header">Channel</th>
                <th className="table-header">AI Resolved</th>
                <th className="table-header text-right">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200/60">
              {conversations.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => router.push('/dashboard/inbox')}
                  className="hover:bg-surface-50/50 cursor-pointer transition-colors"
                >
                  <td className="table-cell font-semibold text-surface-900">
                    {c.customer ? c.customer.name || c.customer.email : 'Anonymous'}
                  </td>
                  <td className="table-cell text-xs text-surface-700 max-w-xs truncate">
                    {c.subject || (c.messages && c.messages[0] ? c.messages[0].content : 'Support query')}
                  </td>
                  <td className="table-cell">
                    <span
                      className={`px-2 py-0.5 rounded text-2xs font-semibold ${
                        c.status === 'ESCALATED'
                          ? 'bg-amber-100 text-amber-800'
                          : c.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="table-cell font-mono text-2xs text-surface-600">{c.channel}</td>
                  <td className="table-cell text-2xs font-semibold">
                    {c.isAiResolved ? (
                      <span className="text-emerald-700">Yes (100% Auto)</span>
                    ) : (
                      <span className="text-surface-500">Human Assisted</span>
                    )}
                  </td>
                  <td className="table-cell text-right text-2xs text-surface-500">
                    {new Date(c.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {conversations.length === 0 && (
            <div className="py-12 text-center text-xs text-surface-500">
              No conversations found matching filters.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
