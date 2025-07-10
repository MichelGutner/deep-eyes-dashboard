import {
    AlertTriangle,
    CheckCircle,
    Clock,
    Download,
    GitBranch,
    Pause,
    Play,
    Search,
    Server,
    Target,
    XCircle
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface Trace {
  id: string;
  name: string;
  duration: number;
  status: 'success' | 'error' | 'timeout';
  services: string[];
  timestamp: string;
  spans: Span[];
  rootCause?: string;
  performanceScore: number;
  errorRate: number;
}

interface Span {
  id: string;
  name: string;
  service: string;
  duration: number;
  timestamp: string;
  status: 'success' | 'error' | 'timeout';
  tags: Record<string, string>;
  logs: Log[];
  children: Span[];
}

interface Log {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  fields: Record<string, unknown>;
}

interface ServiceMesh {
  service: string;
  version: string;
  instances: number;
  health: 'healthy' | 'degraded' | 'unhealthy';
  latency: number;
  errorRate: number;
  throughput: number;
  dependencies: string[];
}

interface PerformanceBottleneck {
  id: string;
  service: string;
  type: 'database' | 'network' | 'cpu' | 'memory' | 'external';
  severity: 'low' | 'medium' | 'high' | 'critical';
  impact: number;
  description: string;
  recommendations: string[];
  detectedAt: string;
}

export const DistributedTracing: React.FC = () => {
  const { t } = useTranslation();
  const [traces, setTraces] = useState<Trace[]>([]);
  const [selectedTrace, setSelectedTrace] = useState<Trace | null>(null);
  const [serviceMesh, setServiceMesh] = useState<ServiceMesh[]>([]);
  const [bottlenecks, setBottlenecks] = useState<PerformanceBottleneck[]>([]);
  const [filter, setFilter] = useState({
    service: 'all',
    status: 'all',
    timeRange: '1h',
    minDuration: 0
  });
  const [isLive, setIsLive] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Generate mock tracing data
  useEffect(() => {
    const generateTracingData = () => {
      // Generate traces
      const mockTraces: Trace[] = Array.from({ length: 50 }, (_, i) => {
        const services = ['user-service', 'auth-service', 'payment-service', 'notification-service', 'database'];
        const trace: Trace = {
          id: `trace-${Math.random().toString(36).substr(2, 9)}`,
          name: `API Request ${i + 1}`,
          duration: Math.floor(Math.random() * 2000) + 100,
          status: Math.random() > 0.1 ? 'success' : 'error',
          services: services.slice(0, Math.floor(Math.random() * 4) + 2),
          timestamp: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString(),
          spans: generateSpans(services),
          performanceScore: Math.floor(Math.random() * 40) + 60,
          errorRate: Math.random() * 5
        };
        return trace;
      });

      const servicesList = ['user-service', 'auth-service', 'payment-service', 'notification-service', 'database'];
      
      // Generate service mesh data
      const meshData: ServiceMesh[] = servicesList.map(service => ({
        service,
        version: `v${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
        instances: Math.floor(Math.random() * 10) + 1,
        health: Math.random() > 0.2 ? 'healthy' : Math.random() > 0.5 ? 'degraded' : 'unhealthy',
        latency: Math.floor(Math.random() * 500) + 50,
        errorRate: Math.random() * 3,
        throughput: Math.floor(Math.random() * 1000) + 100,
        dependencies: servicesList.filter(s => s !== service).slice(0, Math.floor(Math.random() * 3))
      }));

      // Generate bottlenecks
      const bottleneckData: PerformanceBottleneck[] = Array.from({ length: 5 }, (_, i) => ({
        id: `bottleneck-${i}`,
        service: servicesList[Math.floor(Math.random() * servicesList.length)],
        type: ['database', 'network', 'cpu', 'memory', 'external'][Math.floor(Math.random() * 5)] as PerformanceBottleneck['type'],
        severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as PerformanceBottleneck['severity'],
        impact: Math.floor(Math.random() * 50) + 10,
        description: `Performance bottleneck detected in ${servicesList[Math.floor(Math.random() * servicesList.length)]}`,
        recommendations: [
          'Optimize database queries',
          'Add caching layer',
          'Scale horizontally',
          'Update dependencies'
        ].slice(0, Math.floor(Math.random() * 3) + 1),
        detectedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
      }));

      setTraces(mockTraces);
      setServiceMesh(meshData);
      setBottlenecks(bottleneckData);
    };

    const generateSpans = (services: string[]): Span[] => {
      return services.map((service) => ({
        id: `span-${Math.random().toString(36).substr(2, 9)}`,
        name: `${service} operation`,
        service,
        duration: Math.floor(Math.random() * 500) + 50,
        timestamp: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString(),
        status: Math.random() > 0.1 ? 'success' : 'error',
        tags: {
          'http.method': 'GET',
          'http.status_code': '200',
          'component': service
        },
        logs: [],
        children: []
      }));
    };

    generateTracingData();
  }, []);

  const getStatusColor = (status: string) => {
    const colors = {
      success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      timeout: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    };
    return colors[status as keyof typeof colors] || colors.success;
  };

  const getHealthColor = (health: string) => {
    const colors = {
      healthy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      degraded: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      unhealthy: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[health as keyof typeof colors] || colors.healthy;
  };

  const getBottleneckColor = (severity: string) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[severity as keyof typeof colors] || colors.low;
  };

  const filteredTraces = traces.filter(trace => {
    if (filter.service !== 'all' && !trace.services.includes(filter.service)) return false;
    if (filter.status !== 'all' && trace.status !== filter.status) return false;
    if (trace.duration < filter.minDuration) return false;
    if (searchTerm && !trace.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const exportTraces = () => {
    const dataStr = JSON.stringify(filteredTraces, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'traces-export.json';
    link.click();
    URL.revokeObjectURL(url);
    toast.success(t('traces_exported_successfully'));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('distributed_tracing')}</h2>
          <p className="text-gray-600 dark:text-gray-400">{t('distributed_tracing_subtitle')}</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md ${
              isLive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
          >
            {isLive ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            <span>{isLive ? t('live') : t('paused')}</span>
          </button>
          
          <button
            onClick={exportTraces}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>{t('export')}</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder={t('search_traces')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <select
            value={filter.service}
            onChange={(e) => setFilter({ ...filter, service: e.target.value })}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">{t('all_services')}</option>
            <option value="user-service">{t('user_service')}</option>
            <option value="auth-service">{t('auth_service')}</option>
            <option value="payment-service">{t('payment_service')}</option>
            <option value="notification-service">{t('notification_service')}</option>
            <option value="database">{t('database')}</option>
          </select>
          
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">{t('all_status')}</option>
            <option value="success">{t('success')}</option>
            <option value="error">{t('error')}</option>
            <option value="timeout">{t('timeout')}</option>
          </select>
          
          <select
            value={filter.timeRange}
            onChange={(e) => setFilter({ ...filter, timeRange: e.target.value })}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="1h">{t('last_hour')}</option>
            <option value="24h">{t('last_24_hours')}</option>
            <option value="7d">{t('last_7_days')}</option>
            <option value="30d">{t('last_30_days')}</option>
          </select>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <GitBranch className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('total_traces')}</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{traces.length}</p>
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
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('success_rate')}</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {Math.round((traces.filter(t => t.status === 'success').length / traces.length) * 100)}%
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('avg_duration')}</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {Math.round(traces.reduce((sum, t) => sum + t.duration, 0) / traces.length)}ms
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('bottlenecks')}</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{bottlenecks.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Service Mesh Overview */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('service_mesh_health')}</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('service')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('version')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('health')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('latency')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('error_rate')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('throughput')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
              {serviceMesh.map((service) => (
                <tr key={service.service} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Server className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{service.service}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {service.version}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHealthColor(service.health)}`}>
                      {service.health}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {service.latency}ms
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {service.errorRate.toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {service.throughput}/s
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Bottlenecks */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('performance_bottlenecks')}</h3>
        <div className="space-y-4">
          {bottlenecks.map((bottleneck) => (
            <div key={bottleneck.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBottleneckColor(bottleneck.severity)}`}>
                      {bottleneck.severity.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">{bottleneck.type}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">•</span>
                    <span className="text-sm text-gray-900 dark:text-white font-medium">{bottleneck.service}</span>
                  </div>
                  <p className="text-sm text-gray-900 dark:text-white mb-2">{bottleneck.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>{t('impact')}: {bottleneck.impact}%</span>
                    <span>{t('detected_at')}: {new Date(bottleneck.detectedAt).toLocaleString()}</span>
                  </div>
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('recommendations')}:</p>
                    <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                      {bottleneck.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-center">
                          <Target className="w-3 h-3 text-blue-500 mr-1" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Traces List */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('recent_traces')}</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('trace_id')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('name')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('duration')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('services')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('performance')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('timestamp')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTraces.slice(0, 20).map((trace) => (
                <tr key={trace.id} className="hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer" onClick={() => setSelectedTrace(trace)}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-mono">
                    {trace.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {trace.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {trace.duration}ms
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(trace.status)}`}>
                      {trace.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {trace.services.join(', ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            trace.performanceScore > 80 ? 'bg-green-500' :
                            trace.performanceScore > 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${trace.performanceScore}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{trace.performanceScore}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(trace.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trace Details Modal */}
      {selectedTrace && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-700 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('trace_details')}</h3>
              <button
                onClick={() => setSelectedTrace(null)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('trace_id')}</p>
                  <p className="text-sm text-gray-900 dark:text-white font-mono">{selectedTrace.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('duration')}</p>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedTrace.duration}ms</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('status')}</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedTrace.status)}`}>
                    {selectedTrace.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('performance_score')}</p>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedTrace.performanceScore}%</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{t('spans')}</p>
                <div className="space-y-2">
                  {selectedTrace.spans.map((span) => (
                    <div key={span.id} className="border border-gray-200 dark:border-gray-600 rounded p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{span.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{span.service}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-900 dark:text-white">{span.duration}ms</p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(span.status)}`}>
                            {span.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 