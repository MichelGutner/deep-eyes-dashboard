import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Network,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Server,
  RefreshCw
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface ServiceMeshData {
  service: string;
  version: string;
  health: 'healthy' | 'degraded' | 'unhealthy';
  latency: number;
  throughput: number;
  errorRate: number;
  cpu: number;
  memory: number;
  connections: number;
  lastSeen: string;
  namespace: string;
  podCount: number;
  replicas: number;
  desiredReplicas: number;
}

interface MeshTopology {
  source: string;
  target: string;
  weight: number;
  latency: number;
  errorRate: number;
}

export const ServiceMeshMonitoring: React.FC = () => {
  const { t } = useTranslation();
  const [services, setServices] = useState<ServiceMeshData[]>([]);
  const [topology, setTopology] = useState<MeshTopology[]>([]);
  const [selectedService, setSelectedService] = useState<string>('');
  const [timeRange, setTimeRange] = useState('1h');

  // Mock data for demonstration
  const mockServices: ServiceMeshData[] = [
    {
      service: 'user-service',
      version: 'v1.2.3',
      health: 'healthy',
      latency: 45,
      throughput: 1200,
      errorRate: 0.1,
      cpu: 35,
      memory: 68,
      connections: 150,
      lastSeen: '2024-01-15T10:30:00Z',
      namespace: 'default',
      podCount: 3,
      replicas: 3,
      desiredReplicas: 3
    },
    {
      service: 'auth-service',
      version: 'v2.1.0',
      health: 'healthy',
      latency: 32,
      throughput: 800,
      errorRate: 0.05,
      cpu: 28,
      memory: 45,
      connections: 80,
      lastSeen: '2024-01-15T10:30:00Z',
      namespace: 'security',
      podCount: 2,
      replicas: 2,
      desiredReplicas: 2
    },
    {
      service: 'payment-service',
      version: 'v1.5.2',
      health: 'degraded',
      latency: 120,
      throughput: 450,
      errorRate: 2.5,
      cpu: 85,
      memory: 92,
      connections: 200,
      lastSeen: '2024-01-15T10:30:00Z',
      namespace: 'finance',
      podCount: 4,
      replicas: 4,
      desiredReplicas: 5
    },
    {
      service: 'notification-service',
      version: 'v1.0.1',
      health: 'unhealthy',
      latency: 500,
      throughput: 100,
      errorRate: 15.2,
      cpu: 95,
      memory: 98,
      connections: 50,
      lastSeen: '2024-01-15T10:25:00Z',
      namespace: 'default',
      podCount: 1,
      replicas: 1,
      desiredReplicas: 3
    }
  ];

  const mockTopology: MeshTopology[] = [
    { source: 'user-service', target: 'auth-service', weight: 0.8, latency: 45, errorRate: 0.1 },
    { source: 'user-service', target: 'payment-service', weight: 0.6, latency: 120, errorRate: 2.5 },
    { source: 'auth-service', target: 'payment-service', weight: 0.4, latency: 85, errorRate: 1.2 },
    { source: 'payment-service', target: 'notification-service', weight: 0.9, latency: 500, errorRate: 15.2 },
    { source: 'user-service', target: 'notification-service', weight: 0.3, latency: 200, errorRate: 0.8 }
  ];

  const mockLatencyData = [
    { time: '00:00', user: 45, auth: 32, payment: 120, notification: 500 },
    { time: '04:00', user: 42, auth: 30, payment: 115, notification: 480 },
    { time: '08:00', user: 55, auth: 35, payment: 140, notification: 520 },
    { time: '12:00', user: 65, auth: 40, payment: 180, notification: 600 },
    { time: '16:00', user: 58, auth: 38, payment: 160, notification: 550 },
    { time: '20:00', user: 48, auth: 33, payment: 125, notification: 510 },
    { time: '24:00', user: 45, auth: 32, payment: 120, notification: 500 }
  ];

  const mockErrorRateData = [
    { time: '00:00', user: 0.1, auth: 0.05, payment: 2.5, notification: 15.2 },
    { time: '04:00', user: 0.08, auth: 0.04, payment: 2.2, notification: 14.8 },
    { time: '08:00', user: 0.15, auth: 0.06, payment: 3.1, notification: 16.5 },
    { time: '12:00', user: 0.25, auth: 0.08, payment: 4.2, notification: 18.1 },
    { time: '16:00', user: 0.18, auth: 0.07, payment: 3.5, notification: 17.2 },
    { time: '20:00', user: 0.12, auth: 0.05, payment: 2.8, notification: 15.8 },
    { time: '24:00', user: 0.1, auth: 0.05, payment: 2.5, notification: 15.2 }
  ];

  useEffect(() => {
    setServices(mockServices);
    setTopology(mockTopology);
  }, []);

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400';
      case 'degraded': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400';
      case 'unhealthy': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-400';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'degraded': return <AlertTriangle className="w-4 h-4" />;
      case 'unhealthy': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatLatency = (latency: number) => {
    if (latency < 100) return `${latency}ms`;
    if (latency < 1000) return `${(latency / 1000).toFixed(1)}s`;
    return `${(latency / 1000).toFixed(2)}s`;
  };

  const formatThroughput = (throughput: number) => {
    if (throughput < 1000) return `${throughput}/s`;
    if (throughput < 1000000) return `${(throughput / 1000).toFixed(1)}k/s`;
    return `${(throughput / 1000000).toFixed(1)}M/s`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('service_mesh_monitoring')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('service_mesh_subtitle')}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="form-select"
          >
            <option value="15m">{t('last_15_minutes')}</option>
            <option value="1h">{t('last_hour')}</option>
            <option value="6h">{t('last_6_hours')}</option>
            <option value="24h">{t('last_24_hours')}</option>
          </select>
          <button className="btn-primary">
            <RefreshCw className="w-4 h-4" />
            {t('refresh')}
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Network className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('total_services')}
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {services.length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('healthy_services')}
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {services.filter(s => s.health === 'healthy').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('degraded_services')}
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {services.filter(s => s.health === 'degraded').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('unhealthy_services')}
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {services.filter(s => s.health === 'unhealthy').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Service List */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {t('service_overview')}
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('service')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('health')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('latency')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('throughput')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('error_rate')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('pods')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('namespace')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {services.map((service) => (
                <tr key={service.service} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <Server className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {service.service}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          v{service.version}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHealthColor(service.health)}`}>
                      {getHealthIcon(service.health)}
                      <span className="ml-1 capitalize">{service.health}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatLatency(service.latency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatThroughput(service.throughput)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {service.errorRate.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {service.podCount}/{service.desiredReplicas}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {service.namespace}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('latency_trends')}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockLatencyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="user" stroke="#3b82f6" strokeWidth={2} name="User Service" />
              <Line type="monotone" dataKey="auth" stroke="#10b981" strokeWidth={2} name="Auth Service" />
              <Line type="monotone" dataKey="payment" stroke="#f59e0b" strokeWidth={2} name="Payment Service" />
              <Line type="monotone" dataKey="notification" stroke="#ef4444" strokeWidth={2} name="Notification Service" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('error_rate_trends')}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={mockErrorRateData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="user" stroke="#3b82f6" fill="#dbeafe" name="User Service" />
              <Area type="monotone" dataKey="auth" stroke="#10b981" fill="#d1fae5" name="Auth Service" />
              <Area type="monotone" dataKey="payment" stroke="#f59e0b" fill="#fef3c7" name="Payment Service" />
              <Area type="monotone" dataKey="notification" stroke="#ef4444" fill="#fee2e2" name="Notification Service" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Service Topology */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {t('service_topology')}
        </h3>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {services.map((service) => (
              <div
                key={service.service}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedService === service.service
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
                }`}
                onClick={() => setSelectedService(service.service)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {service.service}
                  </h4>
                  {getHealthIcon(service.health)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                  <div>{t('latency')}: {formatLatency(service.latency)}</div>
                  <div>{t('error_rate')}: {service.errorRate.toFixed(1)}%</div>
                  <div>{t('pods')}: {service.podCount}/{service.desiredReplicas}</div>
                </div>
              </div>
            ))}
          </div>
          
          {selectedService && (
            <div className="mt-6 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                {t('connections_for')} {selectedService}
              </h4>
              <div className="space-y-2">
                {topology
                  .filter(t => t.source === selectedService || t.target === selectedService)
                  .map((connection, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {connection.source} → {connection.target}
                      </span>
                      <div className="flex items-center space-x-4">
                        <span className="text-gray-500 dark:text-gray-400">
                          {t('latency')}: {formatLatency(connection.latency)}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          {t('error_rate')}: {connection.errorRate.toFixed(1)}%
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          {t('weight')}: {connection.weight}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 