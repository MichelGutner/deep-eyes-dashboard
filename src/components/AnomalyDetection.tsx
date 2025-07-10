import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle,
  TrendingUp,
  Activity,
  Clock,
  Zap,
  Shield,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Info,
  Target,
  Brain,
  AlertCircle
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';

interface AnomalyData {
  id: string;
  timestamp: string;
  type: 'performance' | 'security' | 'error' | 'resource' | 'network';
  severity: 'low' | 'medium' | 'high' | 'critical';
  metric: string;
  value: number;
  expectedValue: number;
  deviation: number;
  confidence: number;
  description: string;
  status: 'detected' | 'investigating' | 'resolved' | 'false_positive';
  source: string;
  affectedServices: string[];
  recommendations: string[];
}

interface AnomalyPattern {
  id: string;
  name: string;
  description: string;
  confidence: number;
  frequency: number;
  lastSeen: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  pattern: string;
  affectedMetrics: string[];
}

export const AnomalyDetection: React.FC = () => {
  const { t } = useTranslation();
  const [anomalies, setAnomalies] = useState<AnomalyData[]>([]);
  const [patterns, setPatterns] = useState<AnomalyPattern[]>([]);
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyData | null>(null);
  const [filters, setFilters] = useState({
    type: 'all',
    severity: 'all',
    status: 'all',
    timeRange: '24h'
  });

  // Mock data for demonstration
  const mockAnomalies: AnomalyData[] = [
    {
      id: '1',
      timestamp: '2024-01-15T10:30:00Z',
      type: 'performance',
      severity: 'high',
      metric: 'response_time',
      value: 850,
      expectedValue: 180,
      deviation: 372,
      confidence: 95.2,
      description: 'Response time spike detected in payment service',
      status: 'detected',
      source: 'payment-service',
      affectedServices: ['payment-service', 'user-service'],
      recommendations: [
        'Check database connection pool',
        'Review recent deployments',
        'Monitor CPU usage',
        'Check for memory leaks'
      ]
    },
    {
      id: '2',
      timestamp: '2024-01-15T09:45:00Z',
      type: 'security',
      severity: 'critical',
      metric: 'failed_logins',
      value: 150,
      expectedValue: 5,
      deviation: 2900,
      confidence: 98.7,
      description: 'Unusual spike in failed login attempts',
      status: 'investigating',
      source: 'auth-service',
      affectedServices: ['auth-service'],
      recommendations: [
        'Enable rate limiting',
        'Check for brute force attacks',
        'Review security logs',
        'Consider IP blocking'
      ]
    },
    {
      id: '3',
      timestamp: '2024-01-15T08:20:00Z',
      type: 'error',
      severity: 'medium',
      metric: 'error_rate',
      value: 8.5,
      expectedValue: 0.5,
      deviation: 1600,
      confidence: 87.3,
      description: 'Increased error rate in notification service',
      status: 'detected',
      source: 'notification-service',
      affectedServices: ['notification-service'],
      recommendations: [
        'Check external API status',
        'Review error logs',
        'Monitor queue health',
        'Check service dependencies'
      ]
    },
    {
      id: '4',
      timestamp: '2024-01-15T07:15:00Z',
      type: 'resource',
      severity: 'high',
      metric: 'memory_usage',
      value: 95,
      expectedValue: 65,
      deviation: 46,
      confidence: 92.1,
      description: 'Memory usage exceeded normal threshold',
      status: 'resolved',
      source: 'user-service',
      affectedServices: ['user-service'],
      recommendations: [
        'Restart service pods',
        'Check for memory leaks',
        'Increase memory limits',
        'Optimize application code'
      ]
    }
  ];

  const mockPatterns: AnomalyPattern[] = [
    {
      id: '1',
      name: 'Periodic Performance Degradation',
      description: 'Performance issues occurring every 4 hours',
      confidence: 94.2,
      frequency: 6,
      lastSeen: '2024-01-15T10:30:00Z',
      severity: 'high',
      pattern: 'Every 4 hours, response time increases by 300-500ms',
      affectedMetrics: ['response_time', 'throughput', 'error_rate']
    },
    {
      id: '2',
      name: 'Security Attack Pattern',
      description: 'Repeated failed login attempts from same IP range',
      confidence: 97.8,
      frequency: 12,
      lastSeen: '2024-01-15T09:45:00Z',
      severity: 'critical',
      pattern: 'Multiple failed logins from 192.168.1.x range',
      affectedMetrics: ['failed_logins', 'security_events']
    },
    {
      id: '3',
      name: 'Resource Exhaustion',
      description: 'Memory usage spikes followed by service restarts',
      confidence: 89.5,
      frequency: 3,
      lastSeen: '2024-01-15T07:15:00Z',
      severity: 'medium',
      pattern: 'Memory usage >90% followed by pod restart within 5 minutes',
      affectedMetrics: ['memory_usage', 'pod_restarts']
    }
  ];

  const mockAnomalyTrends = [
    { time: '00:00', anomalies: 2, performance: 1, security: 0, error: 1, resource: 0 },
    { time: '04:00', anomalies: 1, performance: 0, security: 0, error: 1, resource: 0 },
    { time: '08:00', anomalies: 3, performance: 1, security: 1, error: 1, resource: 0 },
    { time: '12:00', anomalies: 5, performance: 2, security: 1, error: 1, resource: 1 },
    { time: '16:00', anomalies: 4, performance: 1, security: 1, error: 1, resource: 1 },
    { time: '20:00', anomalies: 2, performance: 1, security: 0, error: 1, resource: 0 },
    { time: '24:00', anomalies: 1, performance: 0, security: 0, error: 1, resource: 0 }
  ];

  const mockConfidenceDistribution = [
    { range: '90-100%', count: 8, color: '#ef4444' },
    { range: '80-89%', count: 12, color: '#f59e0b' },
    { range: '70-79%', count: 15, color: '#3b82f6' },
    { range: '60-69%', count: 6, color: '#10b981' },
    { range: '50-59%', count: 3, color: '#6b7280' }
  ];

  useEffect(() => {
    setAnomalies(mockAnomalies);
    setPatterns(mockPatterns);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-400';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400';
      case 'low': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'performance': return <TrendingUp className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      case 'resource': return <Activity className="w-4 h-4" />;
      case 'network': return <Zap className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'detected': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'investigating': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'false_positive': return <XCircle className="w-4 h-4 text-gray-600" />;
      default: return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  const filteredAnomalies = anomalies.filter(anomaly => {
    if (filters.type !== 'all' && anomaly.type !== filters.type) return false;
    if (filters.severity !== 'all' && anomaly.severity !== filters.severity) return false;
    if (filters.status !== 'all' && anomaly.status !== filters.status) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('anomaly_detection')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('anomaly_detection_subtitle')}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="btn-secondary">
            <Download className="w-4 h-4" />
            {t('export_report')}
          </button>
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
              <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('total_anomalies')}
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {anomalies.length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('active_patterns')}
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {patterns.length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('avg_confidence')}
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {Math.round(anomalies.reduce((acc, a) => acc + a.confidence, 0) / anomalies.length)}%
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
                {t('resolved_today')}
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {anomalies.filter(a => a.status === 'resolved').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-4">
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="form-select"
          >
            <option value="all">{t('all_types')}</option>
            <option value="performance">{t('performance')}</option>
            <option value="security">{t('security')}</option>
            <option value="error">{t('error')}</option>
            <option value="resource">{t('resource')}</option>
            <option value="network">{t('network')}</option>
          </select>

          <select
            value={filters.severity}
            onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
            className="form-select"
          >
            <option value="all">{t('all_severities')}</option>
            <option value="critical">{t('critical')}</option>
            <option value="high">{t('high')}</option>
            <option value="medium">{t('medium')}</option>
            <option value="low">{t('low')}</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="form-select"
          >
            <option value="all">{t('all_status')}</option>
            <option value="detected">{t('detected')}</option>
            <option value="investigating">{t('investigating')}</option>
            <option value="resolved">{t('resolved')}</option>
            <option value="false_positive">{t('false_positive')}</option>
          </select>

          <select
            value={filters.timeRange}
            onChange={(e) => setFilters({ ...filters, timeRange: e.target.value })}
            className="form-select"
          >
            <option value="1h">{t('last_hour')}</option>
            <option value="6h">{t('last_6_hours')}</option>
            <option value="24h">{t('last_24_hours')}</option>
            <option value="7d">{t('last_7_days')}</option>
          </select>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('anomaly_trends')}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLineChart data={mockAnomalyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="anomalies" stroke="#ef4444" strokeWidth={2} name={t('total_anomalies')} />
              <Line type="monotone" dataKey="performance" stroke="#3b82f6" strokeWidth={2} name={t('performance')} />
              <Line type="monotone" dataKey="security" stroke="#f59e0b" strokeWidth={2} name={t('security')} />
              <Line type="monotone" dataKey="error" stroke="#10b981" strokeWidth={2} name={t('error')} />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('confidence_distribution')}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={mockConfidenceDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ range, count }) => `${range}: ${count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {mockConfidenceDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Anomaly List */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {t('recent_anomalies')}
        </h3>
        <div className="space-y-4">
          {filteredAnomalies.map((anomaly) => (
            <div
              key={anomaly.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedAnomaly?.id === anomaly.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => setSelectedAnomaly(anomaly)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {getTypeIcon(anomaly.type)}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {anomaly.description}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {anomaly.source} • {new Date(anomaly.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(anomaly.status)}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(anomaly.severity)}`}>
                    {anomaly.severity.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">{t('metric')}:</span>
                  <span className="ml-1 text-gray-900 dark:text-white">{anomaly.metric}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">{t('value')}:</span>
                  <span className="ml-1 text-gray-900 dark:text-white">{anomaly.value}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">{t('expected')}:</span>
                  <span className="ml-1 text-gray-900 dark:text-white">{anomaly.expectedValue}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">{t('confidence')}:</span>
                  <span className="ml-1 text-gray-900 dark:text-white">{anomaly.confidence.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Anomaly Details */}
      {selectedAnomaly && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('anomaly_details')}
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                {t('details')}
              </h4>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">{t('description')}:</span>
                  <p className="text-gray-900 dark:text-white">{selectedAnomaly.description}</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">{t('affected_services')}:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedAnomaly.affectedServices.map((service) => (
                      <span key={service} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">{t('deviation')}:</span>
                  <span className="ml-1 text-gray-900 dark:text-white">
                    {selectedAnomaly.deviation > 0 ? '+' : ''}{selectedAnomaly.deviation.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                {t('recommended_actions')}
              </h4>
              <div className="space-y-2">
                {selectedAnomaly.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <Target className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-900 dark:text-white">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pattern Recognition */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {t('pattern_recognition')}
        </h3>
        <div className="space-y-4">
          {patterns.map((pattern) => (
            <div key={pattern.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{pattern.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{pattern.description}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{pattern.pattern}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(pattern.severity)}`}>
                    {pattern.severity.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">{t('confidence')}:</span>
                  <span className="ml-1 text-gray-900 dark:text-white">{pattern.confidence.toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">{t('frequency')}:</span>
                  <span className="ml-1 text-gray-900 dark:text-white">{pattern.frequency} {t('times')}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">{t('last_seen')}:</span>
                  <span className="ml-1 text-gray-900 dark:text-white">
                    {new Date(pattern.lastSeen).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">{t('affected_metrics')}:</span>
                  <span className="ml-1 text-gray-900 dark:text-white">{pattern.affectedMetrics.length}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 