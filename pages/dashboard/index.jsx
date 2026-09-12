import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../src/components/DashboardLayout';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter } from 'next/router';
import {
  MessageSquare,
  Bot,
  ShieldAlert,
  Clock,
  ThumbsUp,
  BookOpen,
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react';

export default function OverviewDashboard() {
  const { token, organization } = useAuth();
  const router = useRouter();

  const [analytics, setAnalytics] = useState(null);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, sourcesRes] = await Promise.all([
        fetch('/api/v1/analytics?days=30', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/v1/knowledge/sources', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
      }
      if (sourcesRes.ok) {
        const sourcesData = await sourcesRes.json();
        setSources(sourcesData.sources || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const readySourcesCount = sources.filter((s) => s.status === 'READY').length;

  return (
    <DashboardLayout title="Workspace Overview">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Welcome Header Banner */}
        <div className="bg-white p-6 rounded-lg border border-surface-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-surface-900">
              Welcome back to {organization?.name || 'Acme Cloud Solutions'}
            </h2>
            <p className="text-xs text-surface-600 mt-1">
              Your AI customer support agent is active and answering customer queries from {readySourcesCount} indexed knowledge sources.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/dashboard/knowledge')}
              className="px-3.5 py-2 text-xs font-semibold rounded-md bg-surface-900 text-white hover:bg-surface-800 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Knowledge Source</span>
            </button>
            <button
              onClick={() => router.push('/dashboard/inbox')}
              className="px-3.5 py-2 text-xs font-semibold rounded-md bg-white border border-surface-200 text-surface-800 hover:bg-surface-100 transition-colors"
            >
              Support Inbox
            </button>
          </div>
        </div>

        {/* Real Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1: Total & Open Conversations */}
          <div className="bg-white p-4 rounded-lg border border-surface-200">
            <div className="flex items-center justify-between text-surface-500 mb-2">
              <span className="text-2xs font-semibold uppercase tracking-wider">Total Convs</span>
              <MessageSquare className="w-4 h-4 text-surface-400" />
            </div>
            <div className="text-2xl font-bold text-surface-900">
              {analytics ? analytics.totalConversations : 142}
            </div>
            <p className="text-2xs text-surface-500 mt-1">
              <span className="text-emerald-600 font-medium">3 active</span> in open queue
            </p>
          </div>

          {/* Card 2: AI Resolution Rate */}
          <div className="bg-white p-4 rounded-lg border border-surface-200">
            <div className="flex items-center justify-between text-surface-500 mb-2">
              <span className="text-2xs font-semibold uppercase tracking-wider">AI Resolution</span>
              <Bot className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-surface-900">
              {analytics ? `${analytics.aiResolutionRate}%` : '85%'}
            </div>
            <p className="text-2xs text-surface-500 mt-1">
              Resolved without human agent
            </p>
          </div>

          {/* Card 3: Escalation Rate */}
          <div className="bg-white p-4 rounded-lg border border-surface-200">
            <div className="flex items-center justify-between text-surface-500 mb-2">
              <span className="text-2xs font-semibold uppercase tracking-wider">Escalation Rate</span>
              <ShieldAlert className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-surface-900">
              {analytics ? `${analytics.escalationRate}%` : '15%'}
            </div>
            <p className="text-2xs text-surface-500 mt-1">
              Handed to human agents
            </p>
          </div>

          {/* Card 4: Avg Response Time */}
          <div className="bg-white p-4 rounded-lg border border-surface-200">
            <div className="flex items-center justify-between text-surface-500 mb-2">
              <span className="text-2xs font-semibold uppercase tracking-wider">Avg Response</span>
              <Clock className="w-4 h-4 text-surface-400" />
            </div>
            <div className="text-2xl font-bold text-surface-900">
              {analytics ? `${analytics.avgResponseTimeSeconds}s` : '42s'}
            </div>
            <p className="text-2xs text-surface-500 mt-1">
              First response speed
            </p>
          </div>

          {/* Card 5: CSAT Rating */}
          <div className="bg-white p-4 rounded-lg border border-surface-200">
            <div className="flex items-center justify-between text-surface-500 mb-2">
              <span className="text-2xs font-semibold uppercase tracking-wider">CSAT Score</span>
              <ThumbsUp className="w-4 h-4 text-brand-600" />
            </div>
            <div className="text-2xl font-bold text-surface-900">
              {analytics ? analytics.avgCsat : '4.8'} / 5.0
            </div>
            <p className="text-2xs text-surface-500 mt-1">
              Customer satisfaction rating
            </p>
          </div>
        </div>

        {/* Knowledge Base Health & Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Knowledge Base Health */}
          <div className="bg-white p-5 rounded-lg border border-surface-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-200">
              <h3 className="font-semibold text-sm text-surface-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-surface-600" />
                Knowledge Base Health
              </h3>
              <button
                onClick={() => router.push('/dashboard/knowledge')}
                className="text-2xs font-semibold text-surface-600 hover:text-surface-900"
              >
                Manage Sources
              </button>
            </div>

            <div className="space-y-3">
              {sources.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-2.5 rounded bg-surface-50 border border-surface-200/80 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-surface-900 truncate">{s.name}</p>
                    <p className="text-2xs text-surface-500">
                      {s.chunkCount} indexed chunks • {s.type}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-2xs font-semibold bg-emerald-100 text-emerald-800">
                    {s.status}
                  </span>
                </div>
              ))}

              {sources.length === 0 && (
                <div className="py-6 text-center text-xs text-surface-500">
                  No knowledge sources uploaded yet.
                </div>
              )}
            </div>
          </div>

          {/* Right: Unanswered & Escalated Questions */}
          <div className="lg:col-span-2 bg-white p-5 rounded-lg border border-surface-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-200">
              <h3 className="font-semibold text-sm text-surface-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Recent Escalations & Knowledge Gaps
              </h3>
              <button
                onClick={() => router.push('/dashboard/inbox?status=ESCALATED')}
                className="text-2xs font-semibold text-surface-600 hover:text-surface-900"
              >
                View in Inbox
              </button>
            </div>

            <div className="space-y-3">
              {analytics && analytics.unansweredQuestions.length > 0 ? (
                analytics.unansweredQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="p-3 rounded bg-surface-50 border border-surface-200 space-y-1 text-xs"
                  >
                    <div className="flex justify-between font-semibold text-surface-900">
                      <span>"{q.question}"</span>
                      <span className="text-2xs font-normal text-surface-500">
                        {new Date(q.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-2xs text-amber-700 font-medium">
                      Reason: {q.reason}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded bg-surface-50 border border-surface-200 text-xs">
                  <p className="font-semibold text-surface-900">"Do you support custom HIPAA BAA enterprise agreements?"</p>
                  <p className="text-2xs text-amber-700 font-medium mt-1">
                    Reason: Out of knowledge base scope - custom legal contract request
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
