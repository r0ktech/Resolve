import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Bot,
  BookOpen,
  Headphones,
  BarChart3,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  Lock,
  Code,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function MarketingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-surface-50 text-surface-900 flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      {/* Navbar */}
      <header className="border-b border-surface-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-surface-900 text-white font-bold flex items-center justify-center text-base tracking-tight">
              R
            </div>
            <span className="font-bold tracking-tight text-xl text-surface-900">Resolve</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-surface-600">
            <a href="#how-it-works" className="hover:text-surface-900 transition-colors">
              How it works
            </a>
            <a href="#features" className="hover:text-surface-900 transition-colors">
              Features
            </a>
            <a href="#pricing" className="hover:text-surface-900 transition-colors">
              Pricing
            </a>
            <a href="#faq" className="hover:text-surface-900 transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-surface-700 hover:text-surface-900 px-3 py-1.5 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium px-4 py-2 rounded-md bg-surface-900 hover:bg-surface-800 text-white transition-colors"
            >
              Start building
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-100 border border-surface-200 text-surface-700 text-xs font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
          <span>AI Customer Support Platform for SMBs</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-surface-900 max-w-3xl mx-auto leading-tight">
          Resolve customer questions before they become tickets.
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-surface-600 max-w-2xl mx-auto font-normal leading-relaxed">
          Give your support team an AI agent that answers from your company's actual knowledge — and hands conversations to humans when needed.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="w-full sm:w-auto px-6 py-3 rounded-md bg-surface-900 hover:bg-surface-800 text-white font-medium text-base shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <span>Start building</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-3 rounded-md bg-white hover:bg-surface-100 border border-surface-200 text-surface-800 font-medium text-base transition-all"
          >
            View live demo
          </Link>
        </div>

        {/* Product Preview Card */}
        <div className="mt-14 rounded-xl border border-surface-200 bg-white p-2 shadow-xl text-left max-w-4xl mx-auto overflow-hidden">
          <div className="bg-surface-900 text-white px-4 py-2.5 rounded-t-lg flex items-center justify-between text-xs font-medium">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block"></span>
              <span className="text-surface-400 font-mono ml-2">resolve.app / dashboard / inbox</span>
            </div>
            <span className="bg-surface-800 px-2 py-0.5 rounded text-2xs text-emerald-400 font-mono">
              ● Live Sync
            </span>
          </div>
          <div className="p-6 bg-surface-50 grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
            <div className="bg-white p-4 rounded-lg border border-surface-200 space-y-3">
              <div className="flex justify-between items-center text-xs text-surface-500">
                <span className="font-semibold text-surface-900">Emily Watson</span>
                <span>5m ago</span>
              </div>
              <p className="text-xs text-surface-700 font-medium">How quickly are subscription refunds processed?</p>
              <span className="inline-block px-2 py-0.5 rounded text-2xs bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                AI Resolved (92% conf)
              </span>
            </div>
            <div className="bg-white p-4 rounded-lg border border-surface-200 space-y-3">
              <div className="flex justify-between items-center text-xs text-surface-500">
                <span className="font-semibold text-surface-900">Marcus Vance</span>
                <span>12m ago</span>
              </div>
              <p className="text-xs text-surface-700 font-medium">Do you support custom HIPAA BAA enterprise agreements?</p>
              <span className="inline-block px-2 py-0.5 rounded text-2xs bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                Human Escalated
              </span>
            </div>
            <div className="bg-white p-4 rounded-lg border border-surface-200 space-y-3">
              <div className="flex justify-between items-center text-xs text-surface-500">
                <span className="font-semibold text-surface-900">TechCorp Admin</span>
                <span>1h ago</span>
              </div>
              <p className="text-xs text-surface-700 font-medium">What is the failover SLA for read replicas?</p>
              <span className="inline-block px-2 py-0.5 rounded text-2xs bg-surface-100 text-surface-700 font-semibold border border-surface-200">
                Open
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Product Explanation / How It Works */}
      <section id="how-it-works" className="py-20 bg-white border-y border-surface-200/80">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-surface-900">
              Built for technical accuracy and calm support operations.
            </h2>
            <p className="mt-3 text-base text-surface-600">
              Resolve index your company knowledge, deploys an accurate AI agent, and seamlessly hands off complex requests to human agents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg border border-surface-200 bg-surface-50/50 space-y-3">
              <div className="w-10 h-10 rounded-md bg-surface-900 text-white flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold text-surface-900">Connect Knowledge</h3>
              <p className="text-sm text-surface-600 leading-relaxed">
                Upload text documents, FAQs, markdown files, or website URLs. Resolve automatically chunks and indexes your content into a search context.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-surface-200 bg-surface-50/50 space-y-3">
              <div className="w-10 h-10 rounded-md bg-surface-900 text-white flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold text-surface-900">Deploy AI Agent</h3>
              <p className="text-sm text-surface-600 leading-relaxed">
                Embed our tiny JS widget on your website. Your AI agent answers customer questions using strict confidence thresholds and source citations.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-surface-200 bg-surface-50/50 space-y-3">
              <div className="w-10 h-10 rounded-md bg-surface-900 text-white flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold text-surface-900">Human Escalation</h3>
              <p className="text-sm text-surface-600 leading-relaxed">
                When a question requires human expertise or exceeds confidence bounds, the conversation enters your unified real-time agent inbox.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Deep Dive */}
      <section id="features" className="py-20 max-w-6xl mx-auto px-6 space-y-20">
        {/* RAG Knowledge Feature */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-surface-900">
              RAG Architecture with Source Citations
            </h3>
            <p className="text-sm text-surface-600 leading-relaxed">
              If the AI does not have enough information to answer confidently, it will never hallucinate. Instead, it cites exact knowledge sources and offers immediate human assistance.
            </p>
            <ul className="space-y-2 text-sm text-surface-700 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Automatic semantic text chunking & indexing</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Configurable confidence threshold (0.0 to 1.0)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Supports URLs, Text, FAQs, PDFs, and Markdown</span>
              </li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-sm space-y-4 font-mono text-xs">
            <div className="p-3 rounded bg-surface-100 text-surface-800 border border-surface-200">
              <span className="text-surface-500">// Customer Question:</span>
              <p className="font-sans font-medium text-sm text-surface-900 mt-1">
                "What is your refund policy for unused credits?"
              </p>
            </div>
            <div className="p-3 rounded bg-brand-50/50 text-surface-800 border border-brand-200">
              <span className="text-brand-700 font-semibold font-sans text-2xs uppercase tracking-wider">
                Resolve AI Response
              </span>
              <p className="font-sans text-xs text-surface-800 mt-1">
                According to your refund policy, eligible monthly refunds are processed within 5–7 business days. Unused time is prorated as platform credits.
              </p>
              <div className="mt-2 pt-2 border-t border-brand-200 text-2xs text-surface-500 font-sans">
                Source: <span className="font-semibold text-surface-700">Billing & Refund Policy (Ready)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Agent Inbox */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-sm space-y-3 font-sans order-2 md:order-1">
            <div className="flex items-center justify-between pb-3 border-b border-surface-200">
              <span className="font-bold text-sm text-surface-900">Support Inbox</span>
              <span className="px-2 py-0.5 rounded text-2xs font-semibold bg-amber-100 text-amber-800">
                1 Escalated Ticket
              </span>
            </div>
            <div className="p-3 rounded bg-surface-50 border border-surface-200 space-y-2">
              <div className="flex justify-between text-2xs text-surface-500">
                <span className="font-semibold text-surface-900">Marcus Vance (devscale.app)</span>
                <span>Assigned: Sarah Chen</span>
              </div>
              <p className="text-xs text-surface-700">
                "Hi Sarah, looking forward to receiving the draft BAA agreement."
              </p>
              <div className="pt-2 flex gap-2">
                <button className="px-2.5 py-1 text-2xs font-semibold bg-surface-900 text-white rounded">
                  Reply as Agent
                </button>
                <button className="px-2.5 py-1 text-2xs font-semibold bg-white border border-surface-200 text-surface-700 rounded">
                  Add Internal Note
                </button>
              </div>
            </div>
          </div>
          <div className="space-y-4 order-1 md:order-2">
            <div className="w-10 h-10 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center">
              <Headphones className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-surface-900">
              Unified Real-Time Support Inbox
            </h3>
            <p className="text-sm text-surface-600 leading-relaxed">
              When AI steps back, your support team takes over instantly with Socket.io real-time message sync, internal agent notes, and team assignments.
            </p>
            <ul className="space-y-2 text-sm text-surface-700 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Instant Socket.io real-time updates</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Internal notes visible only to team members</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Role-based access control (Owner, Admin, Agent, Viewer)</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white border-t border-surface-200">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-surface-900">
            Simple, predictable pricing for growing teams.
          </h2>
          <p className="mt-3 text-base text-surface-600 max-w-xl mx-auto">
            No per-ticket punishment. Build your workspace and scale customer resolution.
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto text-left">
            <div className="p-8 rounded-xl border border-surface-200 bg-surface-50 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-surface-900">Starter</h3>
                <p className="text-xs text-surface-500 mt-1">For early-stage startups setting up support.</p>
                <div className="mt-4 text-3xl font-bold text-surface-900">$49 <span className="text-sm font-normal text-surface-500">/ mo</span></div>
              </div>
              <ul className="space-y-3 text-sm text-surface-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Up to 1,000 AI Conversations / mo</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>5 Knowledge Sources</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>3 Support Team Members</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Embeddable Web Chat Widget</span>
                </li>
              </ul>
              <Link
                href="/signup"
                className="block text-center w-full py-2.5 rounded-md bg-white border border-surface-300 font-semibold text-sm text-surface-900 hover:bg-surface-100 transition-colors"
              >
                Start free trial
              </Link>
            </div>

            <div className="p-8 rounded-xl border-2 border-surface-900 bg-white space-y-6 relative shadow-sm">
              <span className="absolute -top-3 right-6 bg-surface-900 text-white text-2xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Popular
              </span>
              <div>
                <h3 className="text-lg font-bold text-surface-900">Pro</h3>
                <p className="text-xs text-surface-500 mt-1">For growing SMBs requiring full RBAC & API access.</p>
                <div className="mt-4 text-3xl font-bold text-surface-900">$149 <span className="text-sm font-normal text-surface-500">/ mo</span></div>
              </div>
              <ul className="space-y-3 text-sm text-surface-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Up to 10,000 AI Conversations / mo</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Unlimited Knowledge Sources</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>10 Team Members with RBAC</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>REST API & Webhooks</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Advanced Analytics & CSAT Tracking</span>
                </li>
              </ul>
              <Link
                href="/signup"
                className="block text-center w-full py-2.5 rounded-md bg-surface-900 font-semibold text-sm text-white hover:bg-surface-800 transition-colors"
              >
                Start building
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-6">
        <h2 className="text-3xl font-bold tracking-tight text-surface-900 text-center mb-12">
          Frequently asked questions
        </h2>
        <div className="space-y-6">
          <div className="p-5 rounded-lg border border-surface-200 bg-white">
            <h3 className="font-semibold text-surface-900 text-base">How does Resolve prevent AI hallucinations?</h3>
            <p className="text-sm text-surface-600 mt-2 leading-relaxed">
              Resolve uses a strict retrieval confidence threshold. If a customer's query cannot be matched against your verified knowledge chunks above the confidence bar, the AI automatically abstains and offers to connect the user with a human support agent.
            </p>
          </div>
          <div className="p-5 rounded-lg border border-surface-200 bg-white">
            <h3 className="font-semibold text-surface-900 text-base">How do I add the chat widget to my website?</h3>
            <p className="text-sm text-surface-600 mt-2 leading-relaxed">
              Copy a single JavaScript snippet generated for your workspace and paste it before the closing `</body>` tag on your website. It loads asynchronously without slowing down your site.
          </p>
        </div>
        <div className="p-5 rounded-lg border border-surface-200 bg-white">
          <h3 className="font-semibold text-surface-900 text-base">Can I enforce team permissions?</h3>
          <p className="text-sm text-surface-600 mt-2 leading-relaxed">
            Yes. Resolve supports role-based access control (Owner, Admin, Agent, Viewer). Permissions are enforced strictly on both the backend API and frontend interfaces.
          </p>
        </div>
    </div>
      </section >

    {/* Footer */ }
    < footer className = "mt-auto border-t border-surface-200 bg-white py-10" >
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-surface-500">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-surface-900 text-white font-bold flex items-center justify-center text-xs">
            R
          </div>
          <span className="font-semibold text-surface-900 text-sm">Resolve</span>
          <span>— Turn customer questions into resolved conversations.</span>
        </div>
        <div>
          &copy; {new Date().getFullYear()} Resolve Inc. Production B2B SaaS Platform.
        </div>
      </div>
      </footer >
    </div >
  );
}
