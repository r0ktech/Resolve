import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../src/components/DashboardLayout';
import { useAuth } from '../../src/context/AuthContext';
import { UserCheck, UserPlus, Shield, Trash2, X } from 'lucide-react';

export default function TeamPage() {
  const { token, role } = useAuth();
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Invite Modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('AGENT');
  const [inviting, setInviting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (token) fetchTeam();
  }, [token]);

  const fetchTeam = async () => {
    try {
      const res = await fetch('/api/v1/team/members', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
        setInvitations(data.invitations || []);
      }
    } catch (err) {
      console.error('Fetch team error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail || inviting) return;

    setInviting(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/v1/team/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send invitation');

      setShowInviteModal(false);
      setInviteEmail('');
      fetchTeam();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      const res = await fetch(`/api/v1/team/members/${memberId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) fetchTeam();
    } catch (err) {}
  };

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Remove team member from workspace?')) return;
    try {
      const res = await fetch(`/api/v1/team/members/${memberId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchTeam();
    } catch (err) {}
  };

  const canManage = role === 'OWNER' || role === 'ADMIN';

  return (
    <DashboardLayout title="Team & Role-Based Permissions (RBAC)">
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-surface-200">
          <div>
            <h2 className="text-lg font-bold text-surface-900">Team Members</h2>
            <p className="text-xs text-surface-600 mt-0.5">
              Manage workspace access and role-based permissions (OWNER, ADMIN, AGENT, VIEWER).
            </p>
          </div>

          {canManage && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-3.5 py-2 text-xs font-semibold rounded bg-surface-900 hover:bg-surface-800 text-white flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Invite Team Member</span>
            </button>
          )}
        </div>

        {/* Members Table */}
        <div className="bg-white border border-surface-200 rounded-lg overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="table-header">Member</th>
                <th className="table-header">Email</th>
                <th className="table-header">Workspace Role</th>
                <th className="table-header">Joined Date</th>
                <th className="table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200/60">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-surface-50/50 transition-colors">
                  <td className="table-cell font-semibold text-surface-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-surface-200 flex items-center justify-center font-bold text-xs text-surface-700">
                        {m.user?.name ? m.user.name.charAt(0) : 'U'}
                      </div>
                      <span>{m.user?.name}</span>
                    </div>
                  </td>
                  <td className="table-cell font-mono text-2xs text-surface-700">
                    {m.user?.email}
                  </td>
                  <td className="table-cell">
                    {canManage && m.role !== 'OWNER' ? (
                      <select
                        value={m.role}
                        onChange={(e) => handleRoleChange(m.id, e.target.value)}
                        className="text-2xs font-semibold px-2 py-1 rounded bg-surface-100 border border-surface-200 outline-none"
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="AGENT">AGENT</option>
                        <option value="VIEWER">VIEWER</option>
                      </select>
                    ) : (
                      <span
                        className={`px-2 py-0.5 rounded text-2xs font-semibold ${
                          m.role === 'OWNER'
                            ? 'bg-surface-900 text-white'
                            : m.role === 'ADMIN'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-surface-100 text-surface-700'
                        }`}
                      >
                        {m.role}
                      </span>
                    )}
                  </td>
                  <td className="table-cell text-2xs text-surface-500">
                    {new Date(m.createdAt).toLocaleDateString()}
                  </td>
                  <td className="table-cell text-right">
                    {canManage && m.role !== 'OWNER' && (
                      <button
                        onClick={() => handleRemoveMember(m.id)}
                        className="p-1 text-surface-400 hover:text-red-600 rounded"
                        title="Remove member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-surface-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl border border-surface-200 max-w-md w-full p-6 space-y-4 shadow-xl">
              <div className="flex justify-between items-center pb-3 border-b border-surface-200">
                <h3 className="font-bold text-sm text-surface-900">Invite Team Member</h3>
                <button onClick={() => setShowInviteModal(false)}>
                  <X className="w-4 h-4 text-surface-400 hover:text-surface-900" />
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 font-medium">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleInvite} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-surface-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="teammate@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-surface-300 rounded outline-none focus:border-surface-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-surface-700 mb-1">Workspace Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full px-3 py-2 border border-surface-300 rounded bg-white outline-none focus:border-surface-900"
                  >
                    <option value="ADMIN">ADMIN — Full management access</option>
                    <option value="AGENT">AGENT — Inbox reply & Knowledge Base access</option>
                    <option value="VIEWER">VIEWER — Read-only dashboard view</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 border border-surface-300 rounded font-semibold text-surface-700 hover:bg-surface-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviting}
                    className="px-4 py-2 bg-surface-900 text-white rounded font-semibold hover:bg-surface-800 disabled:opacity-50"
                  >
                    {inviting ? 'Sending...' : 'Send Invite'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
