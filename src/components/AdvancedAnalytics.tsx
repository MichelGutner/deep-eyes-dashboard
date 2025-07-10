import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, TrendingDown, AlertTriangle, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface Anomaly {
  id: string;
  metric: string;
  value: number;
  expectedValue: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  description: string;
  status: 'new' | 'investigating' | 'resolved' | 'false_positive';
  impact: string;
}

interface Prediction {
  id: string;
  metric: string;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  timeframe: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  factors: string[];
  timestamp: string;
}

interface RootCause {
  id: string;
  incident: string;
  primaryCause: string;
  contributingFactors: string[];
  impact: 'low' | 'medium' | 'high' | 'critical';
  resolution: string;
  prevention: string[];
  detectedAt: string;
  resolvedAt?: string;
}

interface BusinessMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  category: 'revenue' | 'users' | 'performance' | 'operations';
  timestamp: string;
}

interface CapacityForecast {
  id: string;
  resource: string;
  currentUsage: number;
  predictedUsage: number;
  capacity: number;
  timeframe: string;
  risk: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}

export const AdvancedAnalytics: React.FC = () => {
  const { t } = useTranslation();
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [rootCauses, setRootCauses] = useState<RootCause[]>([]);
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetric[]>([]);
  const [capacityForecasts, setCapacityForecasts] = useState<CapacityForecast[]>([]);
  const [selectedView, setSelectedView] = useState('anomalies');
  const [filter, setFilter] = useState({
    severity: 'all',
    category: 'all',
    timeRange: '24h'
  });

  // Generate mock analytics data
  useEffect(() => {
    const generateAnalyticsData = () => {
      // Generate anomalies
      const mockAnomalies: Anomaly[] = Array.from({ length: 15 }, (_, i) => ({
        id: `anomaly-${i}`,
        metric: ['CPU Usage', 'Memory Usage', 'Response Time', 'Error Rate', 'Throughput'][Math.floor(Math.random() * 5)],
        value: Math.floor(Math.random() * 100),
        expectedValue: Math.floor(Math.random() * 80) + 10,
        deviation: Math.floor(Math.random() * 50) + 10,
        severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as Anomaly['severity'],
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        description: `Anomaly detected in ${['CPU Usage', 'Memory Usage', 'Response Time', 'Error Rate', 'Throughput'][Math.floor(Math.random() * 5)]}`,
        status: ['new', 'investigating', 'resolved', 'false_positive'][Math.floor(Math.random() * 4)] as Anomaly['status'],
        impact: ['Low impact on performance', 'Moderate performance degradation', 'Significant service impact', 'Critical system failure'][Math.floor(Math.random() * 4)]
      }));

      // Generate predictions
      const mockPredictions: Prediction[] = Array.from({ length: 10 }, (_, i) => ({
        id: `prediction-${i}`,
        metric: ['User Growth', 'Revenue', 'Server Load', 'Storage Usage', 'API Calls'][Math.floor(Math.random() * 5)],
        currentValue: Math.floor(Math.random() * 1000),
        predictedValue: Math.floor(Math.random() * 1500) + 500,
        confidence: Math.floor(Math.random() * 30) + 70,
        timeframe: ['1 hour', '24 hours', '7 days', '30 days'][Math.floor(Math.random() * 4)],
        trend: ['increasing', 'decreasing', 'stable'][Math.floor(Math.random() * 3)] as Prediction['trend'],
        factors: ['User activity', 'Seasonal patterns', 'Marketing campaigns', 'System changes'].slice(0, Math.floor(Math.random() * 3) + 1),
        timestamp: new Date().toISOString()
      }));

      // Generate root causes
      const mockRootCauses: RootCause[] = Array.from({ length: 8 }, (_, i) => ({
        id: `rca-${i}`,
        incident: `Incident ${i + 1}`,
        primaryCause: ['Database connection pool exhaustion', 'Memory leak in application', 'Network latency spike', 'Third-party service outage', 'Configuration error'][Math.floor(Math.random() * 5)],
        contributingFactors: ['High traffic load', 'Insufficient monitoring', 'Lack of redundancy', 'Poor error handling'].slice(0, Math.floor(Math.random() * 3) + 1),
        impact: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as RootCause['impact'],
        resolution: ['Restarted service', 'Increased resources', 'Fixed configuration', 'Implemented circuit breaker'][Math.floor(Math.random() * 4)],
        prevention: ['Add monitoring', 'Implement caching', 'Increase redundancy', 'Improve error handling'].slice(0, Math.floor(Math.random() * 3) + 1),
        detectedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        resolvedAt: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 6 * 24 * 60 * 60 * 1000).toISOString() : undefined
      }));

      // Generate business metrics
      const mockBusinessMetrics: BusinessMetric[] = [
        {
          id: 'revenue-1',
          name: 'Monthly Recurring Revenue',
          value: 125000,
          target: 150000,
          unit: 'USD',
          trend: 'up',
          change: 8.5,
          category: 'revenue',
          timestamp: new Date().toISOString()
        },
        {
          id: 'users-1',
          name: 'Active Users',
          value: 15420,
          target: 20000,
          unit: 'users',
          trend: 'up',
          change: 12.3,
          category: 'users',
          timestamp: new Date().toISOString()
        },
        {
          id: 'performance-1',
          name: 'System Uptime',
          value: 99.8,
          target: 99.9,
          unit: '%',
          trend: 'stable',
          change: 0.1,
          category: 'performance',
          timestamp: new Date().toISOString()
        },
        {
          id: 'operations-1',
          name: 'Support Tickets',
          value: 45,
          target: 30,
          unit: 'tickets',
          trend: 'down',
          change: -15.2,
          category: 'operations',
          timestamp: new Date().toISOString()
        }
      ];

      // Generate capacity forecasts
      const mockCapacityForecasts: CapacityForecast[] = Array.from({ length: 6 }, (_, i) => ({
        id: `capacity-${i}`,
        resource: ['CPU', 'Memory', 'Storage', 'Network', 'Database Connections', 'API Rate Limit'][i],
        currentUsage: Math.floor(Math.random() * 80) + 20,
        predictedUsage: Math.floor(Math.random() * 40) + 60,
        capacity: 100,
        timeframe: ['1 week', '1 month', '3 months'][Math.floor(Math.random() * 3)],
        risk: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as CapacityForecast['risk'],
        recommendations: ['Scale horizontally', 'Optimize queries', 'Add caching', 'Upgrade resources'].slice(0, Math.floor(Math.random() * 3) + 1)
      }));

      setAnomalies(mockAnomalies);
      setPredictions(mockPredictions);
      setRootCauses(mockRootCauses);
      setBusinessMetrics(mockBusinessMetrics);
      setCapacityForecasts(mockCapacityForecasts);
    };

    generateAnalyticsData();
  }, []);

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[severity as keyof typeof colors] || colors.low;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      investigating: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      false_positive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    };
    return colors[status as keyof typeof colors] || colors.new;
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Activity className="w-4 h-4 text-gray-600" />;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      revenue: <BarChart3 className="w-4 h-4" />,
      users: <Activity className="w-4 h-4" />,
      performance: <Activity className="w-4 h-4" />,
      operations: <Activity className="w-4 h-4" />
    };
    return icons[category as keyof typeof icons] || <Activity className="w-4 h-4" />;
  };

  const filteredAnomalies = anomalies.filter(anomaly => {
    if (filter.severity !== 'all' && anomaly.severity !== filter.severity) return false;
    return true;
  });

  const exportData = () => {
    const data = {
      anomalies: filteredAnomalies,
      predictions,
      rootCauses: rootCauses,
      businessMetrics,
      capacityForecasts
    };
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'analytics-export.json';
    link.click();
    URL.revokeObjectURL(url);
    toast.success(t('analytics_export_success'));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('advanced_analytics')}</h2>
          <p className="text-gray-600 dark:text-gray-400">{t('advanced_analytics_subtitle')}</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={exportData}
            className="btn-secondary flex items-center space-x-2"
          >
            <Activity className="w-4 h-4" />
            <span>{t('export_report')}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
        {[
          { id: 'anomalies', label: t('anomaly_detection'), icon: AlertTriangle },
          { id: 'predictions', label: t('predictive_analytics'), icon: Activity },
          { id: 'rca', label: t('root_cause_analysis'), icon: Activity },
          { id: 'business', label: t('business_metrics'), icon: BarChart3 },
          { id: 'capacity', label: t('capacity_planning'), icon: Activity }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedView(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedView === tab.id
                ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Anomaly Detection */}
      {selectedView === 'anomalies' && (
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('anomaly_detection')}</h3>
              <select
                value={filter.severity}
                onChange={(e) => setFilter({ ...filter, severity: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">{t('all_severities')}</option>
                <option value="low">{t('low')}</option>
                <option value="medium">{t('medium')}</option>
                <option value="high">{t('high')}</option>
                <option value="critical">{t('critical')}</option>
              </select>
            </div>
            
            <div className="space-y-4">
              {filteredAnomalies.map((anomaly) => (
                <div key={anomaly.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(anomaly.severity)}`}>
                          {anomaly.severity.toUpperCase()}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(anomaly.status)}`}>
                          {anomaly.status.replace('_', ' ')}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{anomaly.metric}</span>
                      </div>
                      <p className="text-sm text-gray-900 dark:text-white mb-2">{anomaly.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>{t('value')}: {anomaly.value} ({t('expected')}: {anomaly.expectedValue})</span>
                        <span>{t('deviation')}: {anomaly.deviation}%</span>
                        <span>{t('impact')}: {anomaly.impact}</span>
                        <span>{new Date(anomaly.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Predictive Analytics */}
      {selectedView === 'predictions' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('predictive_analytics')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {predictions.map((prediction) => (
                <div key={prediction.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900 dark:text-white">{prediction.metric}</h4>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(prediction.trend)}
                      <span className="text-sm text-gray-500 dark:text-gray-400">{prediction.timeframe}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">{t('current_value')}</span>
                      <span className="text-gray-900 dark:text-white">{prediction.currentValue}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">{t('predicted_value')}</span>
                      <span className="text-gray-900 dark:text-white">{prediction.predictedValue}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">{t('confidence')}</span>
                      <span className="text-gray-900 dark:text-white">{prediction.confidence}%</span>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('factors')}:</p>
                    <div className="flex flex-wrap gap-1">
                      {prediction.factors.map((factor, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                          {factor}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Root Cause Analysis */}
      {selectedView === 'rca' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('root_cause_analysis')}</h3>
            <div className="space-y-4">
              {rootCauses.map((rca) => (
                <div key={rca.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(rca.impact)}`}>
                          {rca.impact.toUpperCase()}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{rca.incident}</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('primary_cause')}:</p>
                          <p className="text-sm text-gray-900 dark:text-white">{rca.primaryCause}</p>
                        </div>
                        
                        <div>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('contributing_factors')}:</p>
                          <ul className="text-sm text-gray-600 dark:text-gray-300">
                            {rca.contributingFactors.map((factor, index) => (
                              <li key={index}>• {factor}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('resolution')}:</p>
                          <p className="text-sm text-gray-900 dark:text-white">{rca.resolution}</p>
                        </div>
                        
                        <div>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('prevention')}:</p>
                          <ul className="text-sm text-gray-600 dark:text-gray-300">
                            {rca.prevention.map((action, index) => (
                              <li key={index}>• {action}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                        <span>{t('detected_at')}: {new Date(rca.detectedAt).toLocaleDateString()}</span>
                        {rca.resolvedAt && (
                          <span>{t('resolved_at')}: {new Date(rca.resolvedAt).toLocaleDateString()}</span>
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

      {/* Business Metrics */}
      {selectedView === 'business' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {businessMetrics.map((metric) => (
              <div key={metric.id} className="card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(metric.category)}
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">{metric.category}</span>
                  </div>
                  {getTrendIcon(metric.trend)}
                </div>
                
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metric.value.toLocaleString()}{metric.unit}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{metric.name}</p>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.change >= 0 ? '+' : ''}{metric.change}%
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t('vs_target')}</span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>{t('progress')}</span>
                    <span>{Math.round((metric.value / metric.target) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        (metric.value / metric.target) >= 1 ? 'bg-green-500' :
                        (metric.value / metric.target) >= 0.8 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Capacity Planning */}
      {selectedView === 'capacity' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('capacity_planning')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {capacityForecasts.map((forecast) => (
                <div key={forecast.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900 dark:text-white">{forecast.resource}</h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(forecast.risk)}`}>
                      {forecast.risk.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">{t('current_usage')}</span>
                      <span className="text-gray-900 dark:text-white">{forecast.currentUsage}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">{t('predicted_usage')}</span>
                      <span className="text-gray-900 dark:text-white">{forecast.predictedUsage}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">{t('timeframe')}</span>
                      <span className="text-gray-900 dark:text-white">{forecast.timeframe}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          forecast.predictedUsage > 90 ? 'bg-red-500' :
                          forecast.predictedUsage > 75 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${forecast.predictedUsage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('recommendations')}:</p>
                    <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                      {forecast.recommendations.map((rec, index) => (
                        <li key={index}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 