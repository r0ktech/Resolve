import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../src/components/DashboardLayout';
import { useAuth } from '../../src/context/AuthContext';
import {
  BarChart3,
  TrendingUp,
  ThumbsUp,
  ShieldAlert,
  Bot,
  Clock,
  BookOpen,
  Calendar,
} from 'lucide-react';

export default function AnalyticsPage() {
  const { token } = useAuth();
  const [days, setDays] = useState(30);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) fetchAnalytics();
  }, [token, days]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/analytics?days=${days}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Analytics & Performance Metrics">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-surface-200">
          <div>
            <h2 className="text-lg font-bold text-surface-900">Support Analytics</h2>
            <p className="text-xs text-surface-600 mt-0.5">
              Real-time metrics on AI resolution rates, human escalations, customer satisfaction, and knowledge coverage.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-surface-100 p-1 rounded-md text-xs font-semibold text-surface-600">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1 rounded transition-colors ${days === d ? 'bg-white text-surface-900 shadow-xs' : 'hover:text-surface-900'
                  }`}
              >
                Last {d} Days
              </button>
            ))}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-lg border border-surface-200">
            <div className="flex items-center justify-between text-surface-500 mb-2">
              <span className="text-2xs font-semibold uppercase tracking-wider">AI Resolution Rate</span>
              <Bot className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-bold text-surface-900">
              {analytics ? `${analytics.aiResolutionRate}%` : '85%'}
            </div>
            <p className="text-2xs text-surface-500 mt-1">
              Conversations resolved autonomously
            </p>
          </div>

          <div className="bg-white p-5 rounded-lg border border-surface-200">
            <div className="flex items-center justify-between text-surface-500 mb-2">
              <span className="text-2xs font-semibold uppercase tracking-wider">Escalation Rate</span>
              <ShieldAlert className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-3xl font-bold text-surface-900">
              {analytics ? `${analytics.escalationRate}%` : '15%'}
            </div>
            <p className="text-2xs text-surface-500 mt-1">
              Transferred to human support
            </p>
          </div>

          <div className="bg-white p-5 rounded-lg border border-surface-200">
            <div className="flex items-center justify-between text-surface-500 mb-2">
              <span className="text-2xs font-semibold uppercase tracking-wider">Customer CSAT</span>
              <ThumbsUp className="w-4 h-4 text-brand-600" />
            </div>
            <div className="text-3xl font-bold text-surface-900">
              {analytics ? analytics.avgCsat : '4.8'} / 5.0
            </div>
            <p className="text-2xs text-surface-500 mt-1">
              Average satisfaction rating
            </p>
          </div>

          <div className="bg-white p-5 rounded-lg border border-surface-200">
            <div className="flex items-center justify-between text-surface-500 mb-2">
              <span className="text-2xs font-semibold uppercase tracking-wider">Avg Response Time</span>
              <Clock className="w-4 h-4 text-surface-400" />
            </div>
            <div className="text-3xl font-bold text-surface-900">
              {analytics ? `${analytics.avgResponseTimeSeconds}s` : '42s'}
            </div>
            <p className="text-2xs text-surface-500 mt-1">
              First response speed
            </p>
          </div>
        </div>

        {/* Timeline Volume Chart */}
        <div className="bg-white p-6 rounded-lg border border-surface-200 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-surface-200">
            <h3 className="font-bold text-sm text-surface-900">
              Daily Conversation Volume & Resolution Trend
            </h3>
            <span className="text-2xs text-surface-500">
              ● Total &nbsp; <span className="text-emerald-600">● AI Resolved</span> &nbsp; <span className="text-amber-600">● Escalated</span>
            </span>
          </div>

          {/* Clean SVG Bar Chart */}
          <div className="h-64 w-full flex items-end gap-2 pt-6 pb-2 px-2 border-b border-surface-200 overflow-x-auto">
            {analytics && analytics.timeline && analytics.timeline.length > 0 ? (
              analytics.timeline.slice(-14).map((item, i) => {
                const maxVal = Math.max(...analytics.timeline.map((t) => t.total), 1);
                const heightPct = Math.max(12, Math.round((item.total / maxVal) * 100));

                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative min-w-[24px]">
                    <div className="w-full bg-surface-100 rounded-t flex flex-col justify-end overflow-hidden" style={{ height: `${heightPct}%` }}>
                      <div
                        className="bg-emerald-500 w-full"
                        style={{ height: `${item.total > 0 ? (item.aiResolved / item.total) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-surface-400">
                      {item.date.slice(8)}
                    </span>

                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:block bg-surface-900 text-white text-[10px] p-2 rounded shadow-lg z-10 whitespace-nowrap">
                      <div>Date: {item.date}</div>
                      <div>Total: {item.total}</div>
                      <div>AI Resolved: {item.aiResolved}</div>
                      <div>Escalated: {item.escalated}</div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="w-full text-center text-xs text-surface-400 py-16">
                No timeline data available for selected period.
              </div>
            )}
          </div>
        </div>

        {/* Top Sources & Unanswered Questions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-lg border border-surface-200 space-y-4">
            <h3 className="font-bold text-sm text-surface-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-surface-600" />
              Most Frequently Cited Knowledge Sources
            </h3>
            <div className="space-y-2">
              {analytics && analytics.topSources.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded bg-surface-50 border border-surface-200 text-xs"
                >
                  <span className="font-semibold text-surface-900">{s.name}</span>
                  <span className="font-mono text-2xs text-surface-600">{s.citationsCount} citations</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-surface-200 space-y-4">
            <h3 className="font-bold text-sm text-surface-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              Top Escalated Topics / Knowledge Gaps
            </h3>
            <div className="space-y-2 text-xs">
              {analytics && analytics.unansweredQuestions.map((q, idx) => (
                <div key={idx} className="p-2.5 rounded bg-surface-50 border border-surface-200">
                  <p className="font-semibold text-surface-900">"{q.question}"</p>
                  <p className="text-2xs text-amber-700 mt-0.5">Reason: {q.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
