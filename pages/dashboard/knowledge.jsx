import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../src/components/DashboardLayout';
import { useAuth } from '../../src/context/AuthContext';
import {
  BookOpen,
  Plus,
  RefreshCw,
  Trash2,
  Search,
  FileText,
  Globe,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
} from 'lucide-react';

export default function KnowledgeBasePage() {
  const { token, role } = useAuth();

  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Source Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('TEXT');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [creating, setCreating] = useState(false);

  // Test Search Drawer
  const [showSearchDrawer, setShowSearchDrawer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('refund policy');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (token) fetchSources();
  }, [token]);

  const fetchSources = async () => {
    try {
      const res = await fetch('/api/v1/knowledge/sources', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSources(data.sources || []);
      }
    } catch (err) {
      console.error('Failed to fetch sources:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSource = async (e) => {
    e.preventDefault();
    if (!name || !content || creating) return;

    setCreating(true);
    try {
      const res = await fetch('/api/v1/knowledge/sources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, type, content, url }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setName('');
        setContent('');
        setUrl('');
        fetchSources();
      }
    } catch (err) {
      console.error('Failed to create source:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteSource = async (id) => {
    if (!confirm('Are you sure you want to delete this knowledge source?')) return;
    try {
      const res = await fetch(`/api/v1/knowledge/sources/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchSources();
    } catch (err) {}
  };

  const handleReprocessSource = async (id) => {
    try {
      await fetch(`/api/v1/knowledge/sources/${id}/reprocess`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSources();
    } catch (err) {}
  };

  const handleTestSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `/api/v1/knowledge/search?query=${encodeURIComponent(searchQuery)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch (err) {
    } finally {
      setSearching(false);
    }
  };

  return (
    <DashboardLayout title="Knowledge Base Management">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-surface-200">
          <div>
            <h2 className="text-lg font-bold text-surface-900">Knowledge Sources</h2>
            <p className="text-xs text-surface-600 mt-0.5">
              Upload company knowledge for your AI support agent to search and cite during customer conversations.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSearchDrawer(true)}
              className="px-3 py-2 text-xs font-semibold rounded bg-surface-100 hover:bg-surface-200 border border-surface-200 text-surface-800 flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Test Knowledge Search</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 text-xs font-semibold rounded bg-surface-900 hover:bg-surface-800 text-white flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Knowledge Source</span>
            </button>
          </div>
        </div>

        {/* Sources Table */}
        <div className="bg-white border border-surface-200 rounded-lg overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="table-header">Source Name</th>
                <th className="table-header">Type</th>
                <th className="table-header">Status</th>
                <th className="table-header">Indexed Chunks</th>
                <th className="table-header">Last Synced</th>
                <th className="table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200/60">
              {sources.map((s) => (
                <tr key={s.id} className="hover:bg-surface-50/50 transition-colors">
                  <td className="table-cell font-semibold text-surface-900">
                    <div className="flex items-center gap-2">
                      {s.type === 'URL' ? (
                        <Globe className="w-4 h-4 text-surface-500" />
                      ) : s.type === 'FAQ' ? (
                        <HelpCircle className="w-4 h-4 text-surface-500" />
                      ) : (
                        <FileText className="w-4 h-4 text-surface-500" />
                      )}
                      <span>{s.name}</span>
                    </div>
                  </td>
                  <td className="table-cell font-mono text-2xs text-surface-600">{s.type}</td>
                  <td className="table-cell">
                    <span
                      className={`px-2 py-0.5 rounded text-2xs font-semibold ${
                        s.status === 'READY'
                          ? 'bg-emerald-100 text-emerald-800'
                          : s.status === 'PROCESSING'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="table-cell font-mono text-xs text-surface-800">
                    {s.chunkCount} chunks
                  </td>
                  <td className="table-cell text-2xs text-surface-500">
                    {new Date(s.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="table-cell text-right space-x-2">
                    <button
                      onClick={() => handleReprocessSource(s.id)}
                      title="Reprocess"
                      className="p-1 text-surface-400 hover:text-surface-900 rounded"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSource(s.id)}
                      title="Delete"
                      className="p-1 text-surface-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {sources.length === 0 && (
            <div className="py-12 text-center text-xs text-surface-500">
              No knowledge sources added yet. Click "Add Knowledge Source" to begin.
            </div>
          )}
        </div>

        {/* Add Source Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-surface-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl border border-surface-200 max-w-lg w-full p-6 space-y-4 shadow-xl">
              <div className="flex justify-between items-center pb-3 border-b border-surface-200">
                <h3 className="font-bold text-sm text-surface-900">Add Knowledge Source</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-surface-400 hover:text-surface-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateSource} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-surface-700 mb-1">Source Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Return & Refund Policy"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-surface-300 rounded text-xs outline-none focus:border-surface-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-surface-700 mb-1">Source Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 border border-surface-300 rounded text-xs bg-white outline-none focus:border-surface-900"
                  >
                    <option value="TEXT">Plain Text</option>
                    <option value="FAQ">FAQ Document</option>
                    <option value="MARKDOWN">Markdown Document</option>
                    <option value="URL">Website URL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-surface-700 mb-1">Knowledge Content</label>
                  <textarea
                    required
                    rows={6}
                    placeholder="Paste policy document, terms, or FAQ text here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-3 py-2 border border-surface-300 rounded text-xs font-mono outline-none focus:border-surface-900"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-surface-300 rounded text-xs font-semibold text-surface-700 hover:bg-surface-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-4 py-2 bg-surface-900 text-white rounded text-xs font-semibold hover:bg-surface-800 disabled:opacity-50"
                  >
                    {creating ? 'Indexing...' : 'Save & Index'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Test Search Drawer */}
        {showSearchDrawer && (
          <div className="fixed inset-0 bg-surface-900/40 backdrop-blur-xs flex justify-end z-50">
            <div className="bg-white w-full max-w-md h-full p-6 flex flex-col justify-between shadow-2xl border-l border-surface-200">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-surface-200">
                  <h3 className="font-bold text-sm text-surface-900">RAG Search Simulator</h3>
                  <button onClick={() => setShowSearchDrawer(false)}>
                    <X className="w-4 h-4 text-surface-400 hover:text-surface-900" />
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type test question..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-3 py-2 border border-surface-300 rounded text-xs outline-none focus:border-surface-900"
                  />
                  <button
                    onClick={handleTestSearch}
                    disabled={searching}
                    className="px-3 py-2 bg-surface-900 text-white text-xs font-semibold rounded hover:bg-surface-800"
                  >
                    Search
                  </button>
                </div>

                {searchResults && (
                  <div className="space-y-3 pt-2">
                    <div className="p-3 bg-surface-100 rounded text-xs space-y-1">
                      <span className="text-2xs font-semibold uppercase text-surface-500">Overall RAG Confidence</span>
                      <div className="text-lg font-bold text-surface-900">
                        {Math.round(searchResults.confidence * 100)}%
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-2xs font-bold uppercase text-surface-500">Top Retrieved Chunks</h4>
                      {searchResults.chunks.map((c, i) => (
                        <div key={i} className="p-3 rounded border border-surface-200 bg-surface-50 text-xs space-y-1">
                          <div className="flex justify-between text-2xs text-surface-500 font-semibold">
                            <span>{c.sourceName}</span>
                            <span className="font-mono text-emerald-700">Score: {c.score.toFixed(2)}</span>
                          </div>
                          <p className="text-surface-800 text-2xs font-mono">{c.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
