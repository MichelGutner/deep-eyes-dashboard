import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, TrendingUp, TrendingDown, Clock, Zap, Smile, Meh, Frown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import toast from 'react-hot-toast';

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  timestamp: string;
}

interface PerformanceData {
  date: string;
  responseTime: number;
  throughput: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
  apdex: number;
}

export const Performance: React.FC = () => {
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState('24h');
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(true);

  // Calculate Apdex score based on response time
  const calculateApdex = (responseTime: number, satisfiedThreshold: number, toleratedThreshold: number): number => {
    if (responseTime <= satisfiedThreshold) {
      return 1.0; // Satisfied
    } else if (responseTime <= toleratedThreshold) {
      return 0.5; // Tolerated
    } else {
      return 0.0; // Frustrated
    }
  };

  // Get Apdex satisfaction level and color
  const getApdexSatisfaction = (apdex: number) => {
    if (apdex >= 0.94) return { level: 'excellent', color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900', icon: <Smile className="w-4 h-4" /> };
    if (apdex >= 0.85) return { level: 'good', color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900', icon: <Smile className="w-4 h-4" /> };
    if (apdex >= 0.70) return { level: 'fair', color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-900', icon: <Meh className="w-4 h-4" /> };
    return { level: 'poor', color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900', icon: <Frown className="w-4 h-4" /> };
  };

  useEffect(() => {
    const generateMockData = () => {
      const data: PerformanceData[] = [];
      const now = new Date();
      
      for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        const responseTime = Math.random() * 200 + 50;
        // Calculate Apdex based on response time (threshold: 200ms, frustration: 800ms)
        const apdex = calculateApdex(responseTime, 200, 800);
        
        data.push({
          date: time.toISOString(),
          responseTime,
          throughput: Math.random() * 1000 + 500,
          errorRate: Math.random() * 5,
          cpuUsage: Math.random() * 30 + 40,
          memoryUsage: Math.random() * 20 + 60,
          apdex
        });
      }
      
      setPerformanceData(data);
      
      // Calculate average Apdex for the current period
      const avgApdex = data.reduce((sum, item) => sum + item.apdex, 0) / data.length;
      const apdexChange = Math.random() * 10 - 5; // Random change between -5 and +5
      
      setMetrics([
        {
          id: '1',
          name: t('avg_response_time'),
          value: 125,
          unit: 'ms',
          change: 2.3,
          trend: 'up',
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          name: t('requests_per_second'),
          value: 850,
          unit: 'req/s',
          change: -1.2,
          trend: 'down',
          timestamp: new Date().toISOString()
        },
        {
          id: '3',
          name: t('error_rate'),
          value: 0.8,
          unit: '%',
          change: -0.5,
          trend: 'down',
          timestamp: new Date().toISOString()
        },
        {
          id: '4',
          name: t('apdex_score'),
          value: Math.round(avgApdex * 100) / 100,
          unit: '',
          change: apdexChange,
          trend: apdexChange > 0 ? 'up' : apdexChange < 0 ? 'down' : 'stable',
          timestamp: new Date().toISOString()
        }
      ]);
      
      setLoading(false);
    };

    generateMockData();
    const interval = setInterval(generateMockData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [t]);

  const exportPerformanceReport = () => {
    toast.success(t('performance_report_exported'));
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return <div className="text-center py-8">{t('loading_performance_data')}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('performance')}</h2>
          <p className="text-gray-600 dark:text-gray-400">{t('performance_subtitle')}</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="1h">{t('last_hour')}</option>
            <option value="24h">{t('last_24_hours')}</option>
            <option value="7d">{t('last_7_days')}</option>
            <option value="30d">{t('last_30_days')}</option>
          </select>
          <button
            onClick={exportPerformanceReport}
            className="btn-secondary flex items-center space-x-2"
          >
            <Activity className="w-4 h-4" />
            <span>{t('export_report')}</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <div key={metric.id} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{metric.name}</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {metric.value}{metric.unit}
                </p>
              </div>
              <div className="flex items-center space-x-1">
                {getTrendIcon(metric.trend)}
                <span className={`text-sm font-medium ${getTrendColor(metric.trend)}`}>
                  {metric.change > 0 ? '+' : ''}{metric.change}%
                </span>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {t('updated')}: {new Date(metric.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Apdex Chart */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('apdex_trend')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="apdexGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              />
              <YAxis domain={[0, 1]} />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleString()}
                formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, t('apdex_score')]}
              />
              <Area 
                type="monotone" 
                dataKey="apdex" 
                stroke="#10B981" 
                strokeWidth={2}
                fill="url(#apdexGradient)"
              />
              {/* Satisfaction threshold lines */}
              <Line 
                type="monotone" 
                dataKey={() => 0.94} 
                stroke="#059669" 
                strokeDasharray="5 5" 
                strokeWidth={1}
                name={t('excellent_threshold')}
              />
              <Line 
                type="monotone" 
                dataKey={() => 0.85} 
                stroke="#0D9488" 
                strokeDasharray="5 5" 
                strokeWidth={1}
                name={t('good_threshold')}
              />
              <Line 
                type="monotone" 
                dataKey={() => 0.70} 
                stroke="#F59E0B" 
                strokeDasharray="5 5" 
                strokeWidth={1}
                name={t('fair_threshold')}
              />
            </AreaChart>
          </ResponsiveContainer>
          {/* Apdex Legend */}
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-gray-600 dark:text-gray-400">{t('excellent')} (≥0.94)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-gray-600 dark:text-gray-400">{t('good')} (≥0.85)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-gray-600 dark:text-gray-400">{t('fair')} (≥0.70)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-gray-600 dark:text-gray-400">{t('poor')} (&lt;0.70)</span>
            </div>
          </div>
        </div>

        {/* Response Time Chart */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('response_time_trend')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleString()}
                formatter={(value: number) => [`${value}ms`, t('response_time')]}
              />
              <Line type="monotone" dataKey="responseTime" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Throughput Chart */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('throughput_trend')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleString()}
                formatter={(value: number) => [`${value} req/s`, t('throughput')]}
              />
              <Bar dataKey="throughput" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Apdex Distribution */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('apdex_distribution')}</h3>
          <div className="space-y-4">
            {performanceData.slice(-6).map((data, index) => {
              const satisfaction = getApdexSatisfaction(data.apdex);
              return (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    {satisfaction.icon}
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(data.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-16 h-2 rounded-full ${satisfaction.bgColor}`}>
                      <div 
                        className="h-full bg-green-500 rounded-full transition-all duration-300"
                        style={{ width: `${data.apdex * 100}%` }}
                      ></div>
                    </div>
                    <span className={`text-sm font-medium ${satisfaction.color}`}>
                      {(data.apdex * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* System Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPU Usage */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('cpu_usage')}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleString()}
                formatter={(value: number) => [`${value}%`, t('cpu_usage')]}
              />
              <Line type="monotone" dataKey="cpuUsage" stroke="#F59E0B" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Memory Usage */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('memory_usage')}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleString()}
                formatter={(value: number) => [`${value}%`, t('memory_usage')]}
              />
              <Line type="monotone" dataKey="memoryUsage" stroke="#8B5CF6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Alerts */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('performance_alerts')}</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
            <Zap className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{t('high_response_time_alert')}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{t('response_time_exceeded_threshold')}</p>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">{t('2m_ago')}</span>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900 rounded-lg">
            <Zap className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{t('performance_improved')}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{t('error_rate_below_threshold')}</p>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">{t('5m_ago')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 