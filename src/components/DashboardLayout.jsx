import React, { useState } from 'react';
import Link from 'next/router';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Inbox,
  MessageSquare,
  BookOpen,
  Bot,
  Users,
  BarChart3,
  UserCheck,
  Key,
  PieChart,
  Settings,
  LogOut,
  ChevronDown,
  Sparkles,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

export default function DashboardLayout({ children, title }) {
  const router = useRouter();
  const { user, organization, role, logout } = useAuth();
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Inbox', href: '/dashboard/inbox', icon: Inbox, badge: '3' },
    { name: 'Conversations', href: '/dashboard/conversations', icon: MessageSquare },
    { name: 'Knowledge Base', href: '/dashboard/knowledge', icon: BookOpen },
    { name: 'AI Agent', href: '/dashboard/agent', icon: Bot },
    { name: 'Customers', href: '/dashboard/customers', icon: Users },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Team & RBAC', href: '/dashboard/team', icon: UserCheck },
    { name: 'API Keys', href: '/dashboard/api-keys', icon: Key },
    { name: 'Usage', href: '/dashboard/usage', icon: PieChart },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-surface-50 text-surface-900">
      {/* Sidebar */}
      <aside className="w-64 border-r border-surface-200 bg-white flex flex-col justify-between select-none">
        <div>
          {/* Brand Logo & Org Header */}
          <div className="p-4 border-b border-surface-200/80">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-surface-900 text-white font-bold flex items-center justify-center text-sm tracking-tight">
                  R
                </div>
                <span className="font-semibold tracking-tight text-lg text-surface-900">
                  Resolve
                </span>
              </div>
              <span className="text-2xs font-mono px-1.5 py-0.5 rounded bg-surface-100 text-surface-600 border border-surface-200">
                PRO
              </span>
            </div>

            {/* Org Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowOrgDropdown(!showOrgDropdown)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded bg-surface-50 hover:bg-surface-100 border border-surface-200 text-surface-700 transition-colors"
              >
                <span className="truncate">{organization?.name || 'Acme Cloud Solutions'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-surface-400" />
              </button>

              {showOrgDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-surface-200 rounded-md shadow-lg py-1 z-50 text-xs">
                  <div className="px-3 py-1.5 font-semibold text-surface-500 uppercase tracking-wider text-2xs">
                    Workspaces
                  </div>
                  <button
                    onClick={() => setShowOrgDropdown(false)}
                    className="w-full text-left px-3 py-1.5 hover:bg-surface-50 flex items-center justify-between text-surface-900 font-medium"
                  >
                    <span>{organization?.name || 'Acme Cloud Solutions'}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-2 space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = router.pathname === item.href;
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-surface-900 text-white'
                      : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-surface-500'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-2xs font-semibold ${
                        isActive
                          ? 'bg-surface-700 text-white'
                          : 'bg-surface-200 text-surface-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Footer */}
        <div className="p-3 border-t border-surface-200 bg-surface-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-surface-300 flex items-center justify-center font-medium text-xs text-surface-700 shrink-0">
                {user?.name ? user.name.charAt(0) : 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-surface-900 truncate">
                  {user?.name || 'Alex Rivera'}
                </p>
                <p className="text-2xs text-surface-500 truncate flex items-center gap-1">
                  <span>{role || 'OWNER'}</span>
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Log out"
              className="p-1 text-surface-400 hover:text-surface-700 hover:bg-surface-200 rounded transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 border-b border-surface-200 bg-white px-6 flex items-center justify-between select-none">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold text-surface-900 tracking-tight">
              {title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard/agent')}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-surface-100 hover:bg-surface-200 border border-surface-200 text-surface-700 transition-colors"
            >
              <Bot className="w-3.5 h-3.5 text-brand-600" />
              <span>Test AI Agent</span>
            </button>

            <button
              onClick={() => router.push('/dashboard/settings?tab=widget')}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-surface-900 hover:bg-surface-800 text-white transition-colors"
            >
              <span>Widget Preview</span>
              <ExternalLink className="w-3 h-3 text-surface-400" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
