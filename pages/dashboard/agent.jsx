import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../src/components/DashboardLayout';
import { useAuth } from '../../src/context/AuthContext';
import {
  Bot,
  Sliders,
  Send,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
} from 'lucide-react';

export default function AgentSettingsPage() {
  const { token, role } = useAuth();

  const [agentName, setAgentName] = useState('Resolve AI');
  const [tone, setTone] = useState('professional');
  const [welcomeMessage, setWelcomeMessage] = useState('Hello! How can I help you today?');
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful customer support agent.');
  const [businessDescription, setBusinessDescription] = useState('');
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.65);
  const [escalationBehavior, setEscalationBehavior] = useState('OFFER_HUMAN');
  const [maxResponseLength, setMaxResponseLength] = useState(250);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Playground Chat State
  const [testInput, setTestInput] = useState('');
  const [playgroundMessages, setPlaygroundMessages] = useState([]);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (token) fetchConfig();
  }, [token]);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/v1/agent/config', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const cfg = data.config;
        if (cfg) {
          setAgentName(cfg.agentName || 'Resolve AI');
          setTone(cfg.tone || 'professional');
          setWelcomeMessage(cfg.welcomeMessage || '');
          setSystemPrompt(cfg.systemPrompt || '');
          setBusinessDescription(cfg.businessDescription || '');
          setConfidenceThreshold(cfg.confidenceThreshold || 0.65);
          setEscalationBehavior(cfg.escalationBehavior || 'OFFER_HUMAN');
          setMaxResponseLength(cfg.maxResponseLength || 250);
        }
      }
    } catch (err) {
      console.error('Failed to fetch AI agent config:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    try {
      const res = await fetch('/api/v1/agent/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          agentName,
          tone,
          welcomeMessage,
          systemPrompt,
          businessDescription,
          confidenceThreshold,
          escalationBehavior,
          maxResponseLength,
        }),
      });

      if (res.ok) {
        setSuccessMsg('AI Agent configuration updated successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error('Save config error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleTestPrompt = async (e) => {
    e.preventDefault();
    if (!testInput.trim() || testing) return;

    const userText = testInput;
    setTestInput('');

    const newHistory = [...playgroundMessages, { senderType: 'CUSTOMER', content: userText }];
    setPlaygroundMessages(newHistory);

    setTesting(true);
    try {
      const res = await fetch('/api/v1/agent/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userText,
          history: newHistory,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPlaygroundMessages([
          ...newHistory,
          {
            senderType: 'AI',
            content: data.content,
            confidence: data.confidence,
            sources: data.sources,
            shouldEscalate: data.shouldEscalate,
          },
        ]);
      }
    } catch (err) {
      console.error('Test prompt error:', err);
    } finally {
      setTesting(false);
    }
  };

  return (
    <DashboardLayout title="AI Agent Settings & Playground">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto">
        {/* Left Col: Config Form (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-lg border border-surface-200 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-surface-200">
            <div>
              <h2 className="text-base font-bold text-surface-900">Agent Configuration</h2>
              <p className="text-xs text-surface-500">Tune persona, confidence threshold, and system instructions.</p>
            </div>
            {successMsg && (
              <span className="text-2xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
                {successMsg}
              </span>
            )}
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-surface-700 mb-1">Agent Name</label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="w-full px-3 py-2 border border-surface-300 rounded outline-none focus:border-surface-900"
                />
              </div>
              <div>
                <label className="block font-semibold text-surface-700 mb-1">Tone of Voice</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-3 py-2 border border-surface-300 rounded bg-white outline-none focus:border-surface-900"
                >
                  <option value="professional">Professional & Technical</option>
                  <option value="friendly">Friendly & Helpful</option>
                  <option value="concise">Direct & Concise</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-surface-700 mb-1">Welcome Message</label>
              <input
                type="text"
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                className="w-full px-3 py-2 border border-surface-300 rounded outline-none focus:border-surface-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-surface-700 mb-1">System Instructions Prompt</label>
              <textarea
                rows={3}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="w-full px-3 py-2 border border-surface-300 rounded font-mono text-2xs outline-none focus:border-surface-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-surface-700 mb-1">Business Description</label>
              <textarea
                rows={2}
                value={businessDescription}
                onChange={(e) => setBusinessDescription(e.target.value)}
                placeholder="Brief summary of your product or service..."
                className="w-full px-3 py-2 border border-surface-300 rounded outline-none focus:border-surface-900"
              />
            </div>

            {/* Threshold Slider */}
            <div className="p-3 bg-surface-50 rounded border border-surface-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-surface-800">Confidence Threshold Bar</span>
                <span className="font-mono font-bold text-surface-900">
                  {Math.round(confidenceThreshold * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0.4}
                max={0.9}
                step={0.05}
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                className="w-full accent-surface-900 cursor-pointer"
              />
              <p className="text-2xs text-surface-500">
                Queries returning knowledge match confidence below {Math.round(confidenceThreshold * 100)}% will automatically trigger human support escalation without hallucinating.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-surface-900 hover:bg-surface-800 text-white font-semibold rounded text-xs disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save AI Configuration'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Col: Live Interactive Playground (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-surface-200 rounded-lg flex flex-col h-[620px]">
          <div className="p-4 border-b border-surface-200 bg-surface-50 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-brand-600" />
              <span className="font-bold text-xs text-surface-900">Live Agent Playground</span>
            </div>
            <button
              onClick={() => setPlaygroundMessages([])}
              className="text-2xs font-semibold text-surface-500 hover:text-surface-900"
            >
              Clear Thread
            </button>
          </div>

          {/* Playground Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-surface-50/50">
            {playgroundMessages.map((m, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg text-xs leading-relaxed max-w-[90%] ${
                  m.senderType === 'CUSTOMER'
                    ? 'ml-auto bg-surface-900 text-white'
                    : 'bg-white border border-surface-200 text-surface-800'
                }`}
              >
                <p>{m.content}</p>

                {m.confidence !== undefined && (
                  <div className="mt-2 pt-2 border-t border-surface-200 text-2xs text-surface-500 flex justify-between items-center">
                    <span>Confidence: <strong className="text-surface-800">{Math.round(m.confidence * 100)}%</strong></span>
                    {m.shouldEscalate && (
                      <span className="text-amber-700 font-semibold">● Escalated</span>
                    )}
                  </div>
                )}
              </div>
            ))}

            {playgroundMessages.length === 0 && (
              <div className="py-12 text-center text-xs text-surface-400">
                Type a question below to test RAG retrieval & AI response live.
              </div>
            )}
          </div>

          {/* Playground Input */}
          <form onSubmit={handleTestPrompt} className="p-3 bg-white border-t border-surface-200 flex gap-2">
            <input
              type="text"
              placeholder="Ask a question (e.g., What is refund policy?)..."
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              className="flex-1 px-3 py-2 border border-surface-300 rounded text-xs outline-none focus:border-surface-900"
            />
            <button
              type="submit"
              disabled={testing || !testInput.trim()}
              className="px-3 py-2 bg-surface-900 hover:bg-surface-800 text-white text-xs font-semibold rounded disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
