import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../src/context/AuthContext';
import {
  Building2,
  Globe,
  BookOpen,
  Bot,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const { organization, token } = useAuth();

  const [step, setStep] = useState(1);
  const [companyName, setCompanyName] = useState(organization?.name || '');
  const [industry, setIndustry] = useState('SaaS / Software');
  const [websiteUrl, setWebsiteUrl] = useState('https://acmecloud.io');

  // Knowledge base source
  const [sourceName, setSourceName] = useState('Product Return Policy');
  const [sourceContent, setSourceContent] = useState(
    'Eligible monthly refunds are processed within 5-7 business days of request. Unused subscription time is prorated as platform credits.'
  );

  // AI Agent config
  const [agentName, setAgentName] = useState('Resolve AI');
  const [tone, setTone] = useState('professional');
  const [welcomeMessage, setWelcomeMessage] = useState('Hello! How can I help you today?');

  const [saving, setSaving] = useState(false);

  const handleFinish = async () => {
    setSaving(true);
    try {
      // 1. Add Knowledge Source
      if (sourceName && sourceContent) {
        await fetch('/api/v1/knowledge/sources', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: sourceName,
            type: 'TEXT',
            content: sourceContent,
          }),
        });
      }

      // 2. Update Agent Config
      await fetch('/api/v1/agent/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          agentName,
          tone,
          welcomeMessage,
          systemPrompt: `You are a support agent for ${companyName}. Answer questions using company knowledge base.`,
        }),
      });

      router.push('/dashboard');
    } catch (err) {
      console.error('Onboarding finish error:', err);
      router.push('/dashboard');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col justify-center py-12 px-6 font-sans">
      <div className="max-w-xl mx-auto w-full">
        {/* Header Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded bg-surface-900 text-white font-bold flex items-center justify-center text-sm">
              R
            </div>
            <span className="font-bold text-xl text-surface-900 tracking-tight">Resolve Setup</span>
          </div>
          <p className="text-xs text-surface-500">
            Step {step} of 5 — Configure your AI support platform
          </p>
          <div className="flex justify-center gap-1.5 mt-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? 'w-8 bg-surface-900' : i < step ? 'w-4 bg-surface-400' : 'w-4 bg-surface-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Card */}
        <div className="bg-white border border-surface-200 rounded-xl p-8 shadow-sm">
          {step === 1 && (
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-md bg-surface-100 text-surface-900 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-surface-900">Workspace Details</h2>
              <p className="text-xs text-surface-500">Confirm your company details for your customer support agent.</p>
              
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-surface-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 border border-surface-300 rounded-md text-sm outline-none focus:border-surface-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-700 mb-1">Industry / Category</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-3 py-2 border border-surface-300 rounded-md text-sm outline-none focus:border-surface-900 bg-white"
                  >
                    <option value="SaaS / Software">SaaS / Software</option>
                    <option value="E-commerce & Retail">E-commerce & Retail</option>
                    <option value="Financial Services">Financial Services</option>
                    <option value="Agency / Professional Services">Agency / Professional Services</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-md bg-surface-100 text-surface-900 flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-surface-900">Website Connection</h2>
              <p className="text-xs text-surface-500">Enter your primary company website domain.</p>

              <div className="pt-2">
                <label className="block text-xs font-semibold text-surface-700 mb-1">Website URL</label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-surface-300 rounded-md text-sm outline-none focus:border-surface-900"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-md bg-surface-100 text-surface-900 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-surface-900">First Knowledge Base Source</h2>
              <p className="text-xs text-surface-500">Provide an initial document or policy for your AI agent to learn from.</p>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-surface-700 mb-1">Document Title</label>
                  <input
                    type="text"
                    value={sourceName}
                    onChange={(e) => setSourceName(e.target.value)}
                    className="w-full px-3 py-2 border border-surface-300 rounded-md text-sm outline-none focus:border-surface-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-700 mb-1">Content / Policy Text</label>
                  <textarea
                    rows={4}
                    value={sourceContent}
                    onChange={(e) => setSourceContent(e.target.value)}
                    className="w-full px-3 py-2 border border-surface-300 rounded-md text-sm outline-none focus:border-surface-900 font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-md bg-surface-100 text-surface-900 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-surface-900">AI Agent Persona</h2>
              <p className="text-xs text-surface-500">Customize how your AI assistant introduces itself to customers.</p>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-surface-700 mb-1">Agent Persona Name</label>
                  <input
                    type="text"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    className="w-full px-3 py-2 border border-surface-300 rounded-md text-sm outline-none focus:border-surface-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-700 mb-1">Response Tone</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full px-3 py-2 border border-surface-300 rounded-md text-sm outline-none focus:border-surface-900 bg-white"
                  >
                    <option value="professional">Professional & Technical</option>
                    <option value="friendly">Warm & Friendly</option>
                    <option value="concise">Direct & Concise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-700 mb-1">Welcome Message</label>
                  <input
                    type="text"
                    value={welcomeMessage}
                    onChange={(e) => setWelcomeMessage(e.target.value)}
                    className="w-full px-3 py-2 border border-surface-300 rounded-md text-sm outline-none focus:border-surface-900"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-surface-900">Setup Complete!</h2>
              <p className="text-xs text-surface-600 max-w-md mx-auto leading-relaxed">
                Your workspace <span className="font-semibold text-surface-900">{companyName}</span> is ready with knowledge indexing and AI agent persona.
              </p>

              <div className="p-4 rounded-lg bg-surface-50 border border-surface-200 text-left text-xs font-sans space-y-2">
                <div className="font-semibold text-surface-900 flex items-center justify-between">
                  <span>Widget Preview</span>
                  <span className="text-2xs text-emerald-600 font-mono">Ready to deploy</span>
                </div>
                <div className="p-3 bg-white rounded border border-surface-200 text-surface-800">
                  <p className="font-semibold text-surface-900">{agentName}</p>
                  <p className="text-xs text-surface-600 mt-1">{welcomeMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Nav Buttons */}
          <div className="mt-8 pt-4 border-t border-surface-200 flex justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 rounded-md border border-surface-300 text-xs font-medium text-surface-700 hover:bg-surface-100 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            ) : <div />}

            {step < 5 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-5 py-2 rounded-md bg-surface-900 hover:bg-surface-800 text-xs font-medium text-white flex items-center gap-1.5"
              >
                Next <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={saving}
                className="px-6 py-2 rounded-md bg-surface-900 hover:bg-surface-800 text-xs font-medium text-white flex items-center gap-1.5"
              >
                {saving ? 'Launching...' : 'Go to Dashboard'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
