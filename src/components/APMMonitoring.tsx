import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Activity, 
  Clock, 
  Database, 
  Globe, 
  Layers, 
  TrendingUp, 
  Users,
  Zap,
  Target,
  ArrowRight,
  Circle
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  AreaChart,
  Area
} from 'recharts';

interface Service {
  id: string;
  name: string;
  type: 'api' | 'database' | 'cache' | 'queue' | 'external';
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  throughput: number;
  errorRate: number;
  uptime: number;
  dependencies: string[];
}

interface Trace {
  id: string;
  serviceName: string;
  operation: string;
  duration: number;
  timestamp: string;
  status: 'success' | 'error' | 'timeout';
  spans: Span[];
}

interface Span {
  id: string;
  name: string;
  service: string;
  duration: number;
  startTime: number;
  endTime: number;
  tags: Record<string, string>;
}

interface PerformanceMetric {
  timestamp: string;
  responseTime: number;
  throughput: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
}

export const APMMonitoring: React.FC = () => {
  const { t } = useTranslation();
  const [services, setServices] = useState<Service[]>([]);
  const [traces, setTraces] = useState<Trace[]>([]);

  const [timeRange, setTimeRange] = useState<string>('1h');

  // Mock data for services
  const mockServices: Service[] = [
    {
      id: '1',
      name: 'user-service',
      type: 'api',
      status: 'healthy',
      responseTime: 120,
      throughput: 1500,
      errorRate: 0.5,
      uptime: 99.9,
      dependencies: ['user-db', 'cache-service']
    },
    {
      id: '2',
      name: 'user-db',
      type: 'database',
      status: 'healthy',
      responseTime: 45,
      throughput: 2000,
      errorRate: 0.1,
      uptime: 99.8,
      dependencies: []
    },
    {
      id: '3',
      name: 'cache-service',
      type: 'cache',
      status: 'degraded',
      responseTime: 15,
      throughput: 5000,
      errorRate: 2.1,
      uptime: 98.5,
      dependencies: []
    },
    {
      id: '4',
      name: 'payment-service',
      type: 'api',
      status: 'healthy',
      responseTime: 180,
      throughput: 800,
      errorRate: 0.8,
      uptime: 99.7,
      dependencies: ['payment-db', 'external-payment']
    },
    {
      id: '5',
      name: 'external-payment',
      type: 'external',
      status: 'healthy',
      responseTime: 250,
      throughput: 600,
      errorRate: 1.2,
      uptime: 99.5,
      dependencies: []
    }
  ];

  // Mock performance data
  const mockPerformanceData: PerformanceMetric[] = [
    { timestamp: '00:00', responseTime: 120, throughput: 1500, errorRate: 0.5, cpuUsage: 45, memoryUsage: 72 },
    { timestamp: '04:00', responseTime: 95, throughput: 1200, errorRate: 0.3, cpuUsage: 35, memoryUsage: 68 },
    { timestamp: '08:00', responseTime: 180, throughput: 2200, errorRate: 1.2, cpuUsage: 65, memoryUsage: 85 },
    { timestamp: '12:00', responseTime: 220, throughput: 2800, errorRate: 2.1, cpuUsage: 75, memoryUsage: 90 },
    { timestamp: '16:00', responseTime: 160, throughput: 2000, errorRate: 0.8, cpuUsage: 55, memoryUsage: 78 },
    { timestamp: '20:00', responseTime: 140, throughput: 1800, errorRate: 0.6, cpuUsage: 45, memoryUsage: 75 },
    { timestamp: '24:00', responseTime: 110, throughput: 1400, errorRate: 0.4, cpuUsage: 40, memoryUsage: 70 }
  ];

  // Mock traces data
  const mockTraces: Trace[] = [
    {
      id: 'trace-001',
      serviceName: 'user-service',
      operation: 'GET /api/users',
      duration: 150,
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      status: 'success',
      spans: [
        { id: 'span-1', name: 'HTTP Request', service: 'user-service', duration: 150, startTime: 0, endTime: 150, tags: { method: 'GET', path: '/api/users' } },
        { id: 'span-2', name: 'Database Query', service: 'user-db', duration: 45, startTime: 10, endTime: 55, tags: { query: 'SELECT * FROM users' } },
        { id: 'span-3', name: 'Cache Lookup', service: 'cache-service', duration: 15, startTime: 20, endTime: 35, tags: { key: 'user:123' } }
      ]
    },
    {
      id: 'trace-002',
      serviceName: 'payment-service',
      operation: 'POST /api/payments',
      duration: 280,
      timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      status: 'success',
      spans: [
        { id: 'span-4', name: 'HTTP Request', service: 'payment-service', duration: 280, startTime: 0, endTime: 280, tags: { method: 'POST', path: '/api/payments' } },
        { id: 'span-5', name: 'External Payment', service: 'external-payment', duration: 250, startTime: 30, endTime: 280, tags: { provider: 'stripe' } }
      ]
    }
  ];

  useEffect(() => {
    setServices(mockServices);
    setTraces(mockTraces);
  }, []);

  const getStatusColor = (status: string) => {
    const colors = {
      healthy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      degraded: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      down: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[status as keyof typeof colors] || colors.healthy;
  };

  const getServiceIcon = (type: string) => {
    const icons = {
      api: Globe,
      database: Database,
      cache: Zap,
      queue: Layers,
      external: Target
    };
    return icons[type as keyof typeof icons] || Globe;
  };

  const exportAPMReport = () => {
    alert('Exporting APM Report...');
    // In a real application, you would implement actual export logic here
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('apm_monitoring')}</h2>
          <p className="text-gray-600 dark:text-gray-400">{t('apm_monitoring_subtitle')}</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 dark:bg-gray-700 text-gray-900 dark:text-white dark:text-white"
          >
            <option value="15m">{t('last_15_minutes')}</option>
            <option value="1h">{t('last_hour')}</option>
            <option value="6h">{t('last_6_hours')}</option>
            <option value="24h">{t('last_24_hours')}</option>
          </select>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={exportAPMReport}
            className="btn-secondary flex items-center space-x-2"
          >
            <Activity className="w-4 h-4" />
            <span>{t('export_report')}</span>
          </button>
        </div>
      </div>

      {/* Service Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">{t('total_services')}</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white dark:text-white">{services.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">{t('avg_response_time')}</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white dark:text-white">
                {Math.round(services.reduce((acc, s) => acc + s.responseTime, 0) / services.length)}ms
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">{t('total_throughput')}</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white dark:text-white">
                {services.reduce((acc, s) => acc + s.throughput, 0).toLocaleString()}/s
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">{t('avg_error_rate')}</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white dark:text-white">
                {(services.reduce((acc, s) => acc + s.errorRate, 0) / services.length).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Service Map */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white dark:text-white dark:text-white mb-4">{t('service_map')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => {
            const IconComponent = getServiceIcon(service.type);
            return (
              <div key={service.id} className="border border-gray-200 dark:border-gray-700 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <IconComponent className="w-5 h-5 text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500" />
                    <h4 className="font-medium text-gray-900 dark:text-white dark:text-white">{service.name}</h4>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                    {service.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400 dark:text-gray-500">{t('response_time')}:</span>
                    <span className="font-medium">{service.responseTime}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400 dark:text-gray-500">{t('throughput')}:</span>
                    <span className="font-medium">{service.throughput.toLocaleString()}/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400 dark:text-gray-500">{t('error_rate')}:</span>
                    <span className="font-medium">{service.errorRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400 dark:text-gray-500">{t('uptime')}:</span>
                    <span className="font-medium">{service.uptime}%</span>
                  </div>
                </div>

                {service.dependencies.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-1">{t('dependencies')}:</p>
                    <div className="flex flex-wrap gap-1">
                      {service.dependencies.map((dep) => (
                        <span key={dep} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 text-xs rounded">
                          {dep}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white dark:text-white mb-4">{t('response_time_trend')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="responseTime" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white dark:text-white mb-4">{t('throughput_vs_error_rate')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={mockPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="throughput" />
              <YAxis dataKey="errorRate" />
              <Tooltip />
              <Scatter dataKey="errorRate" fill="#ef4444" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Resource Usage */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white dark:text-white mb-4">{t('resource_usage')}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={mockPerformanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="cpuUsage" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
            <Area type="monotone" dataKey="memoryUsage" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Distributed Traces */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white dark:text-white mb-4">{t('recent_traces')}</h3>
        <div className="space-y-4">
          {traces.map((trace) => (
            <div key={trace.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">{trace.operation}</h4>
                  <span className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">{trace.serviceName}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    trace.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {trace.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{trace.duration}ms</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                    {new Date(trace.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                {trace.spans.map((span, index) => (
                  <div key={span.id} className="flex items-center space-x-2 text-sm">
                    <div className="flex items-center space-x-1">
                      {index > 0 && <ArrowRight className="w-3 h-3 text-gray-400 dark:text-gray-500" />}
                      <Circle className="w-2 h-2 text-blue-500" />
                      <span className="font-medium">{span.name}</span>
                    </div>
                    <span className="text-gray-500 dark:text-gray-400 dark:text-gray-500">({span.service})</span>
                    <span className="text-gray-400 dark:text-gray-500">•</span>
                    <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">{span.duration}ms</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 