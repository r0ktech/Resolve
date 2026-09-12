import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../src/components/DashboardLayout';
import { useAuth } from '../../src/context/AuthContext';
import { PieChart, Bot, BookOpen, Users, Key } from 'lucide-react';

export default function UsagePage() {
  const { token, organization } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) fetchUsage();
  }, [token]);

  const fetchUsage = async () => {
    try {
      const res = await fetch('/api/v1/usage', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const usageData = await res.json();
        setData(usageData);
      }
    } catch (err) {
      console.error('Failed to fetch usage:', err);
    } finally {
      setLoading(false);
    }
  };

  const usage = data ? data.usage : { aiMessagesCount: 820, knowledgeSourcesCount: 3, teamMembersCount: 3, apiRequestsCount: 2450 };
  const limits = data ? data.limits : { aiMessagesLimit: 1000, knowledgeSourcesLimit: 25, teamMembersLimit: 10, apiRequestsLimit: 10000 };

  const calculatePct = (val, cap) => Math.min(100, Math.round((val / cap) * 100));

  return (
    <DashboardLayout title="Usage Tracking & Monthly Quotas">
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="bg-white p-5 rounded-lg border border-surface-200 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-surface-900">
              Workspace Usage ({data?.period || '2026-09'})
            </h2>
            <p className="text-xs text-surface-600 mt-0.5">
              Current workspace usage against your <strong className="text-surface-900 font-semibold">{organization?.plan || 'PRO'} Plan</strong> limits.
            </p>
          </div>
          <span className="px-3 py-1 bg-surface-900 text-white text-xs font-mono font-semibold rounded">
            {organization?.plan || 'PRO'} PLAN
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: AI Messages */}
          <div className="bg-white p-5 rounded-lg border border-surface-200 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-surface-900 flex items-center gap-2">
                <Bot className="w-4 h-4 text-emerald-600" />
                AI Conversations & Messages
              </span>
              <span className="font-mono font-semibold text-surface-700">
                {usage.aiMessagesCount} / {limits.aiMessagesLimit}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-100 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${calculatePct(usage.aiMessagesCount, limits.aiMessagesLimit)}%` }}
              />
            </div>
            <p className="text-2xs text-surface-500">
              {calculatePct(usage.aiMessagesCount, limits.aiMessagesLimit)}% of monthly allocation used. Resets on the 1st of next month.
            </p>
          </div>

          {/* Card 2: Knowledge Sources */}
          <div className="bg-white p-5 rounded-lg border border-surface-200 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-surface-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-brand-600" />
                Knowledge Sources Index
              </span>
              <span className="font-mono font-semibold text-surface-700">
                {usage.knowledgeSourcesCount} / {limits.knowledgeSourcesLimit}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-100 overflow-hidden">
              <div
                className="h-full bg-brand-600 rounded-full"
                style={{ width: `${calculatePct(usage.knowledgeSourcesCount, limits.knowledgeSourcesLimit)}%` }}
              />
            </div>
            <p className="text-2xs text-surface-500">
              Active documents, URLs, and FAQs indexed in RAG knowledge bases.
            </p>
          </div>

          {/* Card 3: Team Members */}
          <div className="bg-white p-5 rounded-lg border border-surface-200 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-surface-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-surface-600" />
                Team Members Seats
              </span>
              <span className="font-mono font-semibold text-surface-700">
                {usage.teamMembersCount} / {limits.teamMembersLimit}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-100 overflow-hidden">
              <div
                className="h-full bg-surface-900 rounded-full"
                style={{ width: `${calculatePct(usage.teamMembersCount, limits.teamMembersLimit)}%` }}
              />
            </div>
            <p className="text-2xs text-surface-500">
              Active seats assigned across Owner, Admin, Agent, and Viewer roles.
            </p>
          </div>

          {/* Card 4: API Requests */}
          <div className="bg-white p-5 rounded-lg border border-surface-200 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-surface-900 flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-600" />
                API Key Requests
              </span>
              <span className="font-mono font-semibold text-surface-700">
                {usage.apiRequestsCount} / {limits.apiRequestsLimit}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-100 overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{ width: `${calculatePct(usage.apiRequestsCount, limits.apiRequestsLimit)}%` }}
              />
            </div>
            <p className="text-2xs text-surface-500">
              REST API requests authenticated via workspace API keys.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
