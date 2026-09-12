import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../src/components/DashboardLayout';
import { useAuth } from '../../src/context/AuthContext';
import { Users, Search, Mail, MessageSquare, Star } from 'lucide-react';

export default function CustomersPage() {
  const { token } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) fetchCustomers();
  }, [token]);

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`/api/v1/customers?search=${encodeURIComponent(search)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || []);
      }
    } catch (err) {
      console.error('Fetch customers error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Customer Directory">
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-surface-200">
          <div>
            <h2 className="text-lg font-bold text-surface-900">Customer Directory</h2>
            <p className="text-xs text-surface-600 mt-0.5">
              View customer contact profiles, satisfaction history, and total support conversations.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-surface-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchCustomers()}
              className="w-full pl-8 pr-3 py-1.5 bg-surface-50 border border-surface-200 rounded text-xs outline-none focus:border-surface-900"
            />
          </div>
        </div>

        <div className="bg-white border border-surface-200 rounded-lg overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="table-header">Customer</th>
                <th className="table-header">Email</th>
                <th className="table-header">Conversations</th>
                <th className="table-header">Satisfaction</th>
                <th className="table-header">Tags</th>
                <th className="table-header text-right">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200/60">
              {customers.map((c) => {
                let tags = [];
                try {
                  tags = c.tags ? JSON.parse(c.tags) : [];
                } catch (e) {}

                return (
                  <tr key={c.id} className="hover:bg-surface-50/50 transition-colors">
                    <td className="table-cell font-semibold text-surface-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-surface-200 flex items-center justify-center font-bold text-xs text-surface-700">
                          {c.name ? c.name.charAt(0) : 'C'}
                        </div>
                        <span>{c.name || 'Anonymous Visitor'}</span>
                      </div>
                    </td>
                    <td className="table-cell font-mono text-2xs text-surface-700">
                      {c.email || 'N/A'}
                    </td>
                    <td className="table-cell font-mono text-xs text-surface-800">
                      {c._count ? c._count.conversations : 1}
                    </td>
                    <td className="table-cell">
                      <span className="font-semibold text-xs text-emerald-700">
                        ★ {c.csatAvg || '5.0'} / 5.0
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex gap-1">
                        {tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.2 rounded text-2xs bg-surface-100 text-surface-700 border border-surface-200"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="table-cell text-right text-2xs text-surface-500">
                      {new Date(c.lastActiveAt || c.updatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {customers.length === 0 && (
            <div className="py-12 text-center text-xs text-surface-500">
              No customers found in directory.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
