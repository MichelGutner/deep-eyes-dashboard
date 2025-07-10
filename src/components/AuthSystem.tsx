import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  User, 
  Shield, 
  Settings, 
  LogOut, 
  Plus,
  CheckCircle,
  XCircle,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'operator' | 'viewer';
  status: 'active' | 'inactive';
  lastLogin: string;
  permissions: string[];
  createdAt: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
}

export const AuthSystem: React.FC = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for users
  const mockUsers: User[] = [
    {
      id: '1',
      email: 'admin@company.com',
      name: 'John Admin',
      role: 'admin',
      status: 'active',
      lastLogin: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      permissions: ['read', 'write', 'delete', 'admin'],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString()
    },
    {
      id: '2',
      email: 'operator@company.com',
      name: 'Sarah Operator',
      role: 'operator',
      status: 'active',
      lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      permissions: ['read', 'write'],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString()
    },
    {
      id: '3',
      email: 'viewer@company.com',
      name: 'Mike Viewer',
      role: 'viewer',
      status: 'active',
      lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      permissions: ['read'],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()
    }
  ];

  // Mock data for roles
  const mockRoles: Role[] = [
    {
      id: '1',
      name: 'Admin',
      description: 'Full system access with administrative privileges',
      permissions: ['read', 'write', 'delete', 'admin'],
      userCount: 1
    },
    {
      id: '2',
      name: 'Operator',
      description: 'Can read and write data, manage alerts',
      permissions: ['read', 'write'],
      userCount: 1
    },
    {
      id: '3',
      name: 'Viewer',
      description: 'Read-only access to dashboards and logs',
      permissions: ['read'],
      userCount: 1
    }
  ];

  useEffect(() => {
    setUsers(mockUsers);
    setRoles(mockRoles);
    setCurrentUser(mockUsers[0]); // Set admin as current user
  }, []);

  const getRoleColor = (role: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      operator: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      viewer: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    };
    return colors[role as keyof typeof colors] || colors.viewer;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      inactive: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
    };
    return colors[status as keyof typeof colors] || colors.inactive;
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' as const }
        : user
    ));
    toast.success(t('user_status_updated'));
  };

  const deleteUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
    toast.success(t('user_deleted'));
  };

  const filteredUsers = users.filter(user => {
    if (filterRole !== 'all' && user.role !== filterRole) return false;
    if (searchTerm && !user.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !user.email.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const exportAuthReport = () => {
    toast.success(t('export_report_success'));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('user_management')}</h2>
          <p className="text-gray-600 dark:text-gray-400">{t('user_management_subtitle')}</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={exportAuthReport}
            className="btn-secondary flex items-center space-x-2"
          >
            <Activity className="w-4 h-4" />
            <span>{t('export_report')}</span>
          </button>
          <button className="btn-primary flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>{t('settings')}</span>
          </button>
          <button 
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>{t('add_user')}</span>
          </button>
        </div>
      </div>

      {/* Current User Info */}
      {currentUser && (
        <div className="card">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{currentUser.name}</h3>
                <p className="text-gray-500 dark:text-gray-400">{currentUser.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(currentUser.role)}`}>
                    {currentUser.role.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {t('last_login')}: {new Date(currentUser.lastLogin).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <button className="btn-secondary flex items-center space-x-2">
              <LogOut className="w-4 h-4" />
              <span>{t('logout')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('total_users')}</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('active_users')}</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {users.filter(u => u.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('roles')}</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{roles.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('inactive_users')}</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {users.filter(u => u.status === 'inactive').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('search_users')}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder={t('search_by_name_or_email')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('filter_by_role')}
            </label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">{t('all_roles')}</option>
              <option value="admin">{t('admin')}</option>
              <option value="operator">{t('operator')}</option>
              <option value="viewer">{t('viewer')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('users')}</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('user')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('role')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('last_login')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('permissions')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {user.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(user.lastLogin).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex flex-wrap gap-1">
                      {user.permissions.map((permission) => (
                        <span key={permission} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                          {permission}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => toggleUserStatus(user.id)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        {user.status === 'active' ? t('deactivate') : t('activate')}
                      </button>
                      <button className="text-blue-600 hover:text-blue-900">{t('edit')}</button>
                      {user.id !== currentUser?.id && (
                        <button 
                          onClick={() => deleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          {t('delete')}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Roles */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('roles_permissions')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => (
            <div key={role.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 dark:text-white">{role.name}</h4>
                <span className="text-sm text-gray-500 dark:text-gray-400">{role.userCount} {t('users')}</span>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400">{role.description}</p>
              
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('permissions')}:</p>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.map((permission) => (
                    <span key={permission} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="mt-4 flex space-x-2">
                <button className="text-primary-600 hover:text-primary-900 text-sm">{t('edit')}</button>
                <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm">{t('view_users')}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 