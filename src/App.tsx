import { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { useTranslation } from 'react-i18next';
import { 
  Activity, 
  AlertTriangle, 
  BarChart3, 
  Eye, 
  Layers, 
  Server, 
  Settings, 
  TrendingUp, 
  Users,
  RefreshCw,
  Bell,
  Zap,
  User,
  Target,
  Shield,
  Brain,
  Network,
  AlertCircle,
  MessageSquare,
  Grid,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { AlertSystem } from "./components/AlertSystem";
import { APMMonitoring } from "./components/APMMonitoring";
import { AuthSystem } from "./components/AuthSystem";
import { RealTimeSystem } from "./components/RealTimeSystem";
import { AdvancedLogs } from "./components/AdvancedLogs";
import { CustomMetrics } from "./components/CustomMetrics";
import { SecuritySystem } from "./components/SecuritySystem";
import { MachineLearning } from "./components/MachineLearning";
import { SettingsComponent } from "./components/Settings";
import { ServiceMeshMonitoring } from "./components/ServiceMeshMonitoring";
import { AnomalyDetection } from "./components/AnomalyDetection";
import { IncidentManagement } from "./components/IncidentManagement";
import { DashboardBuilder } from "./components/DashboardBuilder";
import { useSettings } from "./hooks/useSettings";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import { Performance } from "./components/Performance";
import { AdvancedAnalytics } from "./components/AdvancedAnalytics";


interface Log {
  _id: string;
  level: string;
  message: string;
  environment?: string;
  appName?: string;
  userId?: string;
  meta?: Record<string, unknown>;
  createdAt: string;
  traceId?: string;
  spanId?: string;
}

interface Metric {
  level: string;
  count: number;
  timestamp?: string;
}

interface SystemHealth {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  uptime: number;
}



const API_URL = "http://localhost:3000/logs";

const COLORS = {
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  debug: '#6b7280',
  success: '#10b981'
};

export function App() {
  const { t } = useTranslation();
  const { general } = useSettings();
  const [logs, setLogs] = useState<Log[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0,
    uptime: 0
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  // Mock data for demonstration
  const mockSystemHealth = {
    cpu: 45,
    memory: 72,
    disk: 23,
    network: 85,
    uptime: 99.9
  };

  const mockErrorData = [
    { time: '00:00', errors: 12 },
    { time: '04:00', errors: 8 },
    { time: '08:00', errors: 15 },
    { time: '12:00', errors: 22 },
    { time: '16:00', errors: 18 },
    { time: '20:00', errors: 11 },
    { time: '24:00', errors: 9 }
  ];

  useEffect(() => {
    fetchLogs();
    fetchMetrics();
    setSystemHealth(mockSystemHealth);
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await axios.get<Log[]>(API_URL);
      setLogs(response.data);
    } catch (err) {
      console.error("Error fetching logs:", err);
      toast.error(t('failed_to_fetch_logs'));
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await axios.get(`${API_URL}/metrics`);
      const parsed = response.data.map((item: { level: string; sum: number }) => ({
          level: item.level,
          count: item.sum,
        }));
        setMetrics(parsed);
    } catch (err) {
      console.error("Error fetching metrics:", err);
      // Use mock data if API fails
      setMetrics([
        { level: 'error', count: 45 },
        { level: 'warning', count: 23 },
        { level: 'info', count: 156 },
        { level: 'debug', count: 89 }
      ]);
    }
  };

  const filterLogs = () => {
    setFilteredLogs(logs);
  };

  const getLevelColor = (level: string) => {
    return COLORS[level as keyof typeof COLORS] || COLORS.info;
  };

  const refreshData = () => {
    fetchLogs();
    fetchMetrics();
    toast.success(t('data_refreshed_successfully'));
  };

  const tabs = [
    { id: 'overview', label: t('dashboard'), icon: BarChart3 },
    { id: 'logs', label: t('logs'), icon: Layers },
    { id: 'errors', label: t('errors'), icon: AlertTriangle },
    { id: 'performance', label: t('performance'), icon: TrendingUp },
    { id: 'apm', label: t('apm'), icon: Zap },
    { id: 'alerts', label: t('alerts'), icon: Bell },
    { id: 'users', label: t('users'), icon: User },
    { id: 'system', label: t('system_health'), icon: Server },
    { id: 'realtime', label: t('real_time'), icon: Activity },
    { id: 'custom-metrics', label: t('custom_metrics'), icon: Target },
    { id: 'security', label: t('security'), icon: Shield },
    { id: 'ml', label: t('machine_learning'), icon: Brain },
    { id: 'advanced-analytics', label: t('advanced_analytics'), icon: BarChart3 },
    { id: 'service-mesh', label: t('service_mesh'), icon: Network },
    { id: 'anomaly-detection', label: t('anomaly_detection'), icon: AlertCircle },
    { id: 'incident-management', label: t('incident_management'), icon: MessageSquare },
    { id: 'dashboard-builder', label: t('dashboard_builder'), icon: Grid },
    { id: 'settings', label: t('settings'), icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" width={120} height={120} />
              </div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{general.dashboardName}</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={refreshData}
                className="btn-secondary flex items-center space-x-2"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>{t('refresh')}</span>
              </button>
              
              <button className="btn-secondary flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>{t('settings')}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <div className="flex">
        <nav className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}>
          <div className="p-4">
            {/* Toggle Button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={sidebarCollapsed ? t('expand_sidebar') : t('collapse_sidebar')}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                ) : (
                  <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                )}
              </button>
            </div>
            
            <div className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors group ${
                    activeTab === tab.id
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 border-r-2 border-primary-500'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  title={sidebarCollapsed ? tab.label : ''}
                >
                  <tab.icon className="w-4 h-4 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <span className="ml-3 truncate">{tab.label}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </nav>

        <main className={`flex-1 p-8 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-0' : ''
        }`}>
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('total_errors')}</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">45</p>
                    <p className="text-xs text-red-600">{t('from_yesterday')}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('uptime')}</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">99.9%</p>
                    <p className="text-xs text-green-600">{t('last_30_days')}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('response_time')}</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">180ms</p>
                    <p className="text-xs text-blue-600">{t('avg_last_hour')}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('active_users')}</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">1,234</p>
                    <p className="text-xs text-purple-600">{t('from_yesterday')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('error_trends')}</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockErrorData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-600" />
                    <XAxis dataKey="time" stroke="#6b7280" className="dark:stroke-gray-400" />
                    <YAxis stroke="#6b7280" className="dark:stroke-gray-400" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'var(--tw-bg-opacity, 1)',
                        border: '1px solid var(--tw-border-opacity, 1)',
                        borderRadius: '0.375rem',
                        color: 'var(--tw-text-opacity, 1)'
                      }}
                    />
                    <Line type="monotone" dataKey="errors" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('log_distribution')}</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={metrics}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ level, percent }) => `${level} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {metrics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getLevelColor(entry.level)} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'var(--tw-bg-opacity, 1)',
                        border: '1px solid var(--tw-border-opacity, 1)',
                        borderRadius: '0.375rem',
                        color: 'var(--tw-text-opacity, 1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* System Health */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('system_health')}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-gray-900 dark:text-white">{systemHealth.cpu}%</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t('cpu_usage')}</div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${systemHealth.cpu}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-semibold text-gray-900 dark:text-white">{systemHealth.memory}%</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t('memory_usage')}</div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${systemHealth.memory}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-semibold text-gray-900 dark:text-white">{systemHealth.disk}%</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t('disk_usage')}</div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                    <div 
                      className="bg-yellow-600 h-2 rounded-full" 
                      style={{ width: `${systemHealth.disk}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-semibold text-gray-900 dark:text-white">{systemHealth.network}%</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t('network')}</div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${systemHealth.network}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && <AdvancedLogs />}

        {activeTab === 'errors' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('error_distribution')}</h3>
      <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metrics.filter(m => m.level === 'error')}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="level" />
          <YAxis />
          <Tooltip />
                    <Bar dataKey="count" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>
              </div>

              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('error_trends')}</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={mockErrorData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="errors" stroke="#ef4444" fill="#fef2f2" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('recent_errors')}</h3>
              <div className="space-y-4">
                {filteredLogs
                  .filter(log => log.level === 'error')
                  .slice(0, 10)
                  .map((log) => (
                    <div key={log._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="status-badge status-error">ERROR</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm:ss')}
                            </span>
                          </div>
                          <p className="text-gray-900 dark:text-white font-medium">{log.message}</p>
                          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            <span>{t('app')}: {log.appName || t('unknown')}</span>
                            <span className="mx-2">•</span>
                            <span>{t('env')}: {log.environment || t('unknown')}</span>
                            {log.userId && (
                              <>
                                <span className="mx-2">•</span>
                                <span>{t('user')}: {log.userId}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            <Performance />
          </div>
        )}

        {activeTab === 'apm' && <APMMonitoring />}
        {activeTab === 'alerts' && <AlertSystem />}

        {activeTab === 'users' && <AuthSystem />}

        {activeTab === 'realtime' && <RealTimeSystem />}

        {activeTab === 'custom-metrics' && <CustomMetrics />}

        {activeTab === 'security' && <SecuritySystem />}

        {activeTab === 'ml' && <MachineLearning />}

        {activeTab === 'advanced-analytics' && <AdvancedAnalytics />}

        {activeTab === 'service-mesh' && <ServiceMeshMonitoring />}
        {activeTab === 'anomaly-detection' && <AnomalyDetection />}
        {activeTab === 'incident-management' && <IncidentManagement />}
        {activeTab === 'dashboard-builder' && <DashboardBuilder />}

        {activeTab === 'settings' && <SettingsComponent />}

        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('resource_usage')}</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 dark:text-gray-300">{t('cpu_usage')}</span>
                      <span className="text-gray-900 dark:text-white">{systemHealth.cpu}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${systemHealth.cpu}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 dark:text-gray-300">{t('memory_usage')}</span>
                      <span className="text-gray-900 dark:text-white">{systemHealth.memory}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${systemHealth.memory}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 dark:text-gray-300">{t('disk_usage')}</span>
                      <span className="text-gray-900 dark:text-white">{systemHealth.disk}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${systemHealth.disk}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 dark:text-gray-300">{t('network_usage')}</span>
                      <span className="text-gray-900 dark:text-white">{systemHealth.network}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${systemHealth.network}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('system_information')}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{t('uptime')}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{systemHealth.uptime}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{t('server')}</span>
                    <span className="font-medium text-gray-900 dark:text-white">prod-web-01</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{t('region')}</span>
                    <span className="font-medium text-gray-900 dark:text-white">us-east-1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{t('instance_type')}</span>
                    <span className="font-medium text-gray-900 dark:text-white">t3.large</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{t('os')}</span>
                    <span className="font-medium text-gray-900 dark:text-white">Ubuntu 20.04</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        </main>
      </div>
    </div>
  );
}

export default App;
