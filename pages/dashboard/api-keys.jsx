import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../src/components/DashboardLayout';
import { useAuth } from '../../src/context/AuthContext';
import { Key, Plus, Trash2, Copy, Check, ShieldAlert } from 'lucide-react';

export default function ApiKeysPage() {
  const { token, role } = useAuth();
  const [keys, setKeys] = useState([]);
  const [keyName, setKeyName] = useState('');
  const [newCreatedSecret, setNewCreatedSecret] = useState(null);
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (token) fetchKeys();
  }, [token]);

  const fetchKeys = async () => {
    try {
      const res = await fetch('/api/v1/api-keys', {
        headers: { Authorization: `Bearer ${token} ` },
      });
      if (res.ok) {
        const data = await res.json();
        setKeys(data.keys || []);
      }
    } catch (err) {
      console.error('Fetch API keys error:', err);
    }
  };

  const handleCreateKey = async (e) => {
    e.preventDefault();
    if (!keyName || creating) return;

    setCreating(true);
    setNewCreatedSecret(null);
    try {
      const res = await fetch('/api/v1/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token} `,
        },
        body: JSON.stringify({ name: keyName }),
      });

      const data = await res.json();
      if (res.ok) {
        setNewCreatedSecret(data.apiKey.secretKey);
        setKeyName('');
        fetchKeys();
      }
    } catch (err) {
      console.error('Create API key error:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleRevokeKey = async (id) => {
    if (!confirm('Are you sure you want to revoke this API key? Apps using it will lose access.')) return;
    try {
      const res = await fetch(`/ api / v1 / api - keys / ${id} `, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token} ` },
      });
      if (res.ok) fetchKeys();
    } catch (err) { }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const canManage = role === 'OWNER' || role === 'ADMIN';

  return (
    <DashboardLayout title="API Keys & Integration">
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="bg-white p-5 rounded-lg border border-surface-200">
          <h2 className="text-lg font-bold text-surface-900">Workspace API Keys</h2>
          <p className="text-xs text-surface-600 mt-0.5">
            Authenticate custom backend integrations or REST API clients with hashed secret verification.
          </p>

          {canManage && (
            <form onSubmit={handleCreateKey} className="mt-4 flex gap-2 max-w-md">
              <input
                type="text"
                required
                placeholder="Key Description (e.g. Mobile App Key)"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-surface-300 rounded text-xs outline-none focus:border-surface-900"
              />
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-1.5 bg-surface-900 hover:bg-surface-800 text-white text-xs font-semibold rounded disabled:opacity-50 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Create Secret Key
              </button>
            </form>
          )}
        </div>

        {/* Display New Secret Key Modal Box */}
        {newCreatedSecret && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              <span>Copy your API secret key now! It will never be displayed again.</span>
            </div>
            <div className="flex items-center gap-2 font-mono bg-white p-2 rounded border border-amber-300">
              <span className="flex-1 text-surface-900 break-all">{newCreatedSecret}</span>
              <button
                onClick={() => handleCopy(newCreatedSecret)}
                className="p-1.5 bg-surface-900 text-white rounded hover:bg-surface-800 flex items-center gap-1 text-2xs font-sans font-semibold shrink-0"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        )}

        {/* API Keys Table */}
        <div className="bg-white border border-surface-200 rounded-lg overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="table-header">Key Name</th>
                <th className="table-header">Prefix</th>
                <th className="table-header">Created Date</th>
                <th className="table-header">Last Used</th>
                <th className="table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200/60">
              {keys.map((k) => (
                <tr key={k.id} className="hover:bg-surface-50/50 transition-colors">
                  <td className="table-cell font-semibold text-surface-900">{k.name}</td>
                  <td className="table-cell font-mono text-2xs text-surface-600">{k.keyPrefix}...</td>
                  <td className="table-cell text-2xs text-surface-500">
                    {new Date(k.createdAt).toLocaleDateString()}
                  </td>
                  <td className="table-cell text-2xs text-surface-500">
                    {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString() : 'Never'}
                  </td>
                  <td className="table-cell text-right">
                    {canManage && (
                      <button
                        onClick={() => handleRevokeKey(k.id)}
                        className="p-1 text-surface-400 hover:text-red-600 rounded"
                        title="Revoke Key"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {keys.length === 0 && (
            <div className="py-12 text-center text-xs text-surface-500">
              No active API keys created yet.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
