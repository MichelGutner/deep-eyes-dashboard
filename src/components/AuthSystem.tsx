import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useUsers, usePatchUser, useDeleteUser } from '../hooks/useUsers';

interface Role {
  id: string; name: string; description: string; permissions: string[]; userCount: number;
}

const ROLES: Role[] = [
  { id: '1', name: 'Admin', description: 'Full system access', permissions: ['read', 'write', 'delete', 'admin'], userCount: 1 },
  { id: '2', name: 'Operator', description: 'Read and write, manage alerts', permissions: ['read', 'write'], userCount: 1 },
  { id: '3', name: 'Viewer', description: 'Read-only access', permissions: ['read'], userCount: 1 },
];

const ROLE_COLOR: Record<string, string> = {
  admin:    'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  operator: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  viewer:   'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
};

function relTime(iso: string | undefined) {
  if (!iso) return '–';
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return `${Math.floor(d)}s ago`;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

export const AuthSystem: React.FC = () => {
  const { t } = useTranslation();
  const [filterRole, setFilterRole] = useState('all');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useUsers();
  const patchUserMutation = usePatchUser();
  const deleteUserMutation = useDeleteUser();

  const users = data?.users ?? [];
  const active = users.filter(u => u.status === 'active').length;

  const toggleStatus = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    patchUserMutation.mutate(
      { id, status: newStatus },
      { onSuccess: () => toast.success(t('user_status_updated')), onError: () => toast.error('Failed to update user') }
    );
  };

  const handleDeleteUser = (id: number) => {
    deleteUserMutation.mutate(id, {
      onSuccess: () => toast.success(t('user_deleted')),
      onError: () => toast.error('Failed to delete user'),
    });
  };

  const filtered = users.filter(u => {
    const role = u.role.toLowerCase();
    if (filterRole !== 'all' && role !== filterRole) return false;
    const name = u.name ?? '';
    if (search && !name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (isLoading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading users…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Stats strip */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Total users', value: users.length, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800' },
          { label: 'Active', value: active, color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800' },
          { label: 'Inactive', value: users.length - active, color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800' },
          { label: 'Roles', value: ROLES.length, color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800' },
        ].map(s => (
          <div key={s.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${s.color}`}>
            <span className="font-bold text-sm">{s.value}</span>
            <span className="opacity-75">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filters + actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="form-select text-xs py-1 px-2 h-8">
          <option value="all">All roles</option>
          <option value="admin">Admin</option>
          <option value="operator">Operator</option>
          <option value="viewer">Viewer</option>
        </select>
        <button className="btn-primary flex items-center gap-1.5 text-xs py-1.5 px-3 ml-auto">
          <Plus className="w-3.5 h-3.5" />
          Add user
        </button>
      </div>

      {/* Users table */}
      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              {['User', 'Role', 'Status', 'Last active', 'Actions'].map(h => (
                <th key={h} className="pb-2 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide pr-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
            {filtered.map(u => {
              const role = u.role.toLowerCase();
              return (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm leading-tight">{u.name ?? '–'}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${ROLE_COLOR[role] ?? 'bg-gray-100 text-gray-600'}`}>{role}</span>
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${u.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>{u.status}</span>
                  </td>
                  <td className="py-2.5 pr-4 text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">{relTime(u.lastActive)}</td>
                  <td className="py-2.5">
                    <div className="flex gap-2 text-xs">
                      <button onClick={() => toggleStatus(u.id, u.status)} className="text-blue-600 dark:text-blue-400 hover:underline">
                        {u.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button onClick={() => handleDeleteUser(u.id)} className="text-red-500 dark:text-red-400 hover:underline">Delete</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Roles */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Roles & Permissions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {ROLES.map(r => (
            <div key={r.id} className="border border-gray-100 dark:border-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{r.name}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">{r.userCount} users</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{r.description}</p>
              <div className="flex flex-wrap gap-1">
                {r.permissions.map(p => <span key={p} className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] rounded">{p}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
