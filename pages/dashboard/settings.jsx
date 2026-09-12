import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../src/components/DashboardLayout';
import { useAuth } from '../../src/context/AuthContext';
import { Settings, Code, Copy, Check, ExternalLink, Globe } from 'lucide-react';

export default function SettingsPage() {
  const { token, organization } = useAuth();

  const [companyName, setCompanyName] = useState(organization?.name || 'Acme Cloud Solutions');
  const [domain, setDomain] = useState(organization?.domain || 'acmecloud.io');
  const [industry, setIndustry] = useState(organization?.industry || 'Developer Infrastructure SaaS');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const embedScript = `<script src="${
    typeof window !== 'undefined' ? window.location.origin : 'https://resolve.app'
  }/widget.js" data-workspace-id="${organization?.id || 'ws_acme123'}" async></script>`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(embedScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <DashboardLayout title="Workspace & Widget Installation Settings">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Widget Embed Code Installation Box */}
        <div id="widget" className="bg-white p-6 rounded-lg border border-surface-200 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-surface-200">
            <div>
              <h2 className="text-base font-bold text-surface-900">Embeddable Website Chat Widget</h2>
              <p className="text-xs text-surface-600 mt-0.5">
                Copy and paste this script snippet before the closing <code className="font-mono text-2xs bg-surface-100 px-1 py-0.5 rounded">&lt;/body&gt;</code> tag on your website.
              </p>
            </div>
            <button
              onClick={handleCopyScript}
              className="px-3.5 py-1.5 bg-surface-900 hover:bg-surface-800 text-white text-xs font-semibold rounded flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied Code!' : 'Copy Embed Code'}
            </button>
          </div>

          <div className="bg-surface-900 text-surface-100 p-4 rounded-md font-mono text-xs overflow-x-auto relative">
            <code>{embedScript}</code>
          </div>
        </div>

        {/* Workspace Profile Form */}
        <div className="bg-white p-6 rounded-lg border border-surface-200 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-surface-200">
            <div>
              <h2 className="text-base font-bold text-surface-900">Workspace Profile</h2>
              <p className="text-xs text-surface-600 mt-0.5">
                Update organization name, domain, and localization settings.
              </p>
            </div>
            {saved && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
                Settings saved!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs max-w-xl">
            <div>
              <label className="block font-semibold text-surface-700 mb-1">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 border border-surface-300 rounded outline-none focus:border-surface-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-surface-700 mb-1">Primary Domain</label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full px-3 py-2 border border-surface-300 rounded outline-none focus:border-surface-900 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-surface-700 mb-1">Industry</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3 py-2 border border-surface-300 rounded outline-none focus:border-surface-900"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 bg-surface-900 text-white font-semibold rounded hover:bg-surface-800"
              >
                Save Workspace Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
