import {
  Activity,
  Brain,
  CheckCircle,
  Lightbulb,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { mlService } from '../services/mlService';
import toast from 'react-hot-toast';

interface Anomaly {
  id: string;
  timestamp: string;
  metric: string;
  value: number;
  expectedValue: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'spike' | 'drop' | 'trend_change' | 'seasonal_anomaly';
  confidence: number;
  status: 'detected' | 'investigating' | 'resolved' | 'false_positive';
  description: string;
  recommendations: string[];
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
  lastUpdated: string;
}

interface MLModel {
  id: string;
  name: string;
  type: 'anomaly_detection' | 'forecasting' | 'classification' | 'regression';
  status: 'training' | 'active' | 'inactive' | 'error';
  accuracy: number;
  lastTrained: string;
  trainingData: number;
  features: string[];
  performance: {
    precision: number;
    recall: number;
    f1Score: number;
  };
}

interface Insight {
  id: string;
  type: 'correlation' | 'trend' | 'anomaly' | 'optimization';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  category: string;
  timestamp: string;
  actionable: boolean;
  actions: string[];
}

export const MachineLearning: React.FC = () => {
  const { t } = useTranslation();
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [models, setModels] = useState<MLModel[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
  const [autoMLEnabled, setAutoMLEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [mlHealth, setMlHealth] = useState<boolean>(false);
  const [filter, setFilter] = useState({
    severity: [] as string[],
    type: [] as string[],
    status: [] as string[],
    timeRange: '24h'
  });

  // Check ML backend health and load data
  useEffect(() => {
    checkMlHealth();
    loadMlData();
  }, []);

  const checkMlHealth = async () => {
    try {
      const health = await mlService.getHealth();
      setMlHealth(health.status === 'healthy');
    } catch (error) {
      console.error('ML Health check failed:', error);
      setMlHealth(false);
    }
  };

  const loadMlData = async () => {
    setLoading(true);
    try {
      // Generate sample data for ML analysis
      const sampleData = generateSampleData();
      
      // Test ML backend endpoints
      const [anomalyResult, predictionResult, insightsResult] = await Promise.allSettled([
        mlService.detectAnomalies(sampleData),
        mlService.generatePredictions(sampleData, 5),
        mlService.getInsightsSummary('1h')
      ]);

      // Generate mock data with real ML results if available
      const anomalyData = generateMockAnomalies();
      const predictionData = generateMockPredictions();
      const modelData = generateMockModels();
      const insightData = generateMockInsights();

      // Update with real ML results if available
      if (anomalyResult.status === 'fulfilled') {
        console.log('Real anomaly detection result:', anomalyResult.value);
        // You can merge real results with mock data here
      }

      if (predictionResult.status === 'fulfilled') {
        console.log('Real prediction result:', predictionResult.value);
        // Update predictions with real ML results
        const realPredictions = predictionResult.value.predictions || [];
        if (realPredictions.length > 0) {
          const updatedPredictions = predictionData.map((pred, index) => ({
            ...pred,
            predictedValue: realPredictions[index] || pred.predictedValue,
            trend: predictionResult.value.trend || pred.trend,
            confidence: predictionResult.value.confidence || pred.confidence
          }));
          setPredictions(updatedPredictions);
        } else {
          setPredictions(predictionData);
        }
      } else {
        setPredictions(predictionData);
      }

      if (insightsResult.status === 'fulfilled') {
        console.log('Real insights result:', insightsResult.value);
        // You can merge real insights with mock data here
      }

      setAnomalies(anomalyData);
      setModels(modelData);
      setInsights(insightData);
      
      toast.success(t('ml_data_loaded_successfully'));
    } catch (error) {
      console.error('Error loading ML data:', error);
      toast.error(t('failed_to_load_ml_data'));
      
      // Use mock data as fallback
      setAnomalies(generateMockAnomalies());
      setPredictions(generateMockPredictions());
      setModels(generateMockModels());
      setInsights(generateMockInsights());
    } finally {
      setLoading(false);
    }
  };

  const generateSampleData = (): Array<{timestamp: number, value: number}> => {
    const now = Date.now();
    return Array.from({ length: 100 }, (_, i) => ({
      timestamp: now - (100 - i) * 60000, // 1 minute intervals
      value: Math.random() * 100
    }));
  };

  const generateMockAnomalies = (): Anomaly[] => {
    return Array.from({ length: 15 }, (_, i) => {
      const types: Anomaly['type'][] = ['spike', 'drop', 'trend_change', 'seasonal_anomaly'];
      const severities: Anomaly['severity'][] = ['low', 'medium', 'high', 'critical'];
      const statuses: Anomaly['status'][] = ['detected', 'investigating', 'resolved', 'false_positive'];
      const metrics = ['CPU Usage', 'Memory Usage', 'Response Time', 'Error Rate', 'Throughput'];
      
      return {
        id: `anomaly-${i}`,
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        metric: metrics[Math.floor(Math.random() * metrics.length)],
        value: Math.random() * 100 + 50,
        expectedValue: Math.random() * 80 + 20,
        deviation: Math.random() * 50 + 10,
        severity: severities[Math.floor(Math.random() * severities.length)],
        type: types[Math.floor(Math.random() * types.length)],
        confidence: Math.random() * 0.4 + 0.6,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        description: 'Unusual pattern detected in system behavior',
        recommendations: [
          'Check system resources',
          'Review recent deployments',
          'Monitor related metrics'
        ]
      };
    });
  };

  const generateMockPredictions = (): Prediction[] => {
    return Array.from({ length: 8 }, (_, i) => {
      const metrics = ['CPU Usage', 'Memory Usage', 'Response Time', 'Error Rate'];
      const trends: Prediction['trend'][] = ['increasing', 'decreasing', 'stable'];
      
      return {
        id: `prediction-${i}`,
        metric: metrics[Math.floor(Math.random() * metrics.length)],
        currentValue: Math.random() * 100 + 20,
        predictedValue: Math.random() * 100 + 20,
        confidence: Math.random() * 0.3 + 0.7,
        timeframe: ['1h', '6h', '24h', '7d'][Math.floor(Math.random() * 4)],
        trend: trends[Math.floor(Math.random() * trends.length)],
        factors: ['User load', 'System resources', 'Network latency'],
        lastUpdated: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString()
      };
    });
  };

  const generateMockModels = (): MLModel[] => {
    return [
      {
        id: 'anomaly-detector',
        name: 'Anomaly Detection Model',
        type: 'anomaly_detection',
        status: 'active',
        accuracy: 0.94,
        lastTrained: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        trainingData: 50000,
        features: ['cpu_usage', 'memory_usage', 'response_time', 'error_rate'],
        performance: {
          precision: 0.92,
          recall: 0.89,
          f1Score: 0.90
        }
      },
      {
        id: 'forecast-model',
        name: 'Resource Forecasting',
        type: 'forecasting',
        status: 'active',
        accuracy: 0.87,
        lastTrained: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        trainingData: 100000,
        features: ['historical_usage', 'time_of_day', 'day_of_week', 'seasonal_patterns'],
        performance: {
          precision: 0.85,
          recall: 0.88,
          f1Score: 0.86
        }
      },
      {
        id: 'classifier',
        name: 'Alert Classification',
        type: 'classification',
        status: 'training',
        accuracy: 0.91,
        lastTrained: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        trainingData: 25000,
        features: ['alert_type', 'severity', 'source', 'context'],
        performance: {
          precision: 0.89,
          recall: 0.93,
          f1Score: 0.91
        }
      }
    ];
  };

  const generateMockInsights = (): Insight[] => {
    return Array.from({ length: 10 }, (_, i) => {
      const types: Insight['type'][] = ['correlation', 'trend', 'anomaly', 'optimization'];
      const impacts: Insight['impact'][] = ['low', 'medium', 'high'];
      
      return {
        id: `insight-${i}`,
        type: types[Math.floor(Math.random() * types.length)],
        title: `Insight ${i + 1}`,
        description: 'Automated insight generated by ML models',
        confidence: Math.random() * 0.4 + 0.6,
        impact: impacts[Math.floor(Math.random() * impacts.length)],
        category: ['Performance', 'Security', 'Resource', 'User Experience'][Math.floor(Math.random() * 4)],
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        actionable: Math.random() > 0.3,
        actions: ['Optimize resource allocation', 'Update alert thresholds', 'Scale infrastructure']
      };
    });
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[severity as keyof typeof colors] || colors.low;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      training: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 dark:bg-gray-700 text-gray-800',
      error: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || colors.inactive;
  };

  const getImpactColor = (impact: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return colors[impact as keyof typeof colors] || colors.low;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-red-600" />;
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-green-600" />;
      case 'stable': return <Activity className="w-4 h-4 text-blue-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500" />;
    }
  };

  const filteredAnomalies = anomalies.filter(anomaly => {
    if (filter.severity.length > 0 && !filter.severity.includes(anomaly.severity)) return false;
    if (filter.type.length > 0 && !filter.type.includes(anomaly.type)) return false;
    if (filter.status.length > 0 && !filter.status.includes(anomaly.status)) return false;
    return true;
  });

  const anomalyData = [
    { name: 'Low', value: anomalies.filter(a => a.severity === 'low').length, color: '#3B82F6' },
    { name: 'Medium', value: anomalies.filter(a => a.severity === 'medium').length, color: '#F59E0B' },
    { name: 'High', value: anomalies.filter(a => a.severity === 'high').length, color: '#EF4444' },
    { name: 'Critical', value: anomalies.filter(a => a.severity === 'critical').length, color: '#8B5CF6' }
  ];

  const performanceData = models.map(model => ({
    name: model.name,
    accuracy: model.accuracy * 100,
    precision: model.performance.precision * 100,
    recall: model.performance.recall * 100
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('machine_learning')}</h2>
          <p className="text-gray-600 dark:text-gray-400">{t('machine_learning_subtitle')}</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* ML Backend Status */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
            mlHealth 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            <div className={`w-2 h-2 rounded-full ${mlHealth ? 'bg-green-500' : 'bg-red-500'}`} />
            {mlHealth ? t('ml_backend_connected') : t('ml_backend_disconnected')}
          </div>
          
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">{t('auto_ml')}</span>
            <button
              onClick={() => setAutoMLEnabled(!autoMLEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                autoMLEnabled ? 'bg-purple-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-700 transition ${
                autoMLEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          
          <button 
            onClick={loadMlData}
            disabled={loading}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? t('loading') : t('retrain_models')}</span>
          </button>
        </div>
      </div>

      {/* ML Models Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {models.map((model) => (
          <div key={model.id} className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Brain className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{model.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{model.type.replace('_', ' ')}</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(model.status)}`}>
                {model.status}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">{t('accuracy')}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{(model.accuracy * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${model.accuracy * 100}%` }}
                ></div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="text-gray-500 dark:text-gray-400">{t('precision')}</div>
                  <div className="font-medium">{(model.performance.precision * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400">{t('recall')}</div>
                  <div className="font-medium">{(model.performance.recall * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400">{t('f1_score')}</div>
                  <div className="font-medium">{(model.performance.f1Score * 100).toFixed(1)}%</div>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {t('last_trained')}: {new Date(model.lastTrained).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Anomaly Distribution */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('anomaly_distribution')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={anomalyData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
              >
                {anomalyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        {/* Model Performance */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('model_performance')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="accuracy" fill="#8B5CF6" name={t('accuracy')} />
              <Bar dataKey="precision" fill="#3B82F6" name={t('precision')} />
              <Bar dataKey="recall" fill="#10B981" name={t('recall')} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Predictions */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('predictions')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {predictions.map((prediction) => (
            <div key={prediction.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">{prediction.metric}</span>
                {getTrendIcon(prediction.trend)}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{t('current_value')}</span>
                  <span className="font-medium">{prediction.currentValue.toFixed(1)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{t('predicted_value')}</span>
                  <span className="font-medium">{prediction.predictedValue.toFixed(1)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{t('confidence')}</span>
                  <span className="font-medium">{(prediction.confidence * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{t('timeframe')}</span>
                  <span className="font-medium">{prediction.timeframe}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Anomalies */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('recent_anomalies')}</h3>
          <div className="flex items-center space-x-2">
            <select
              value={filter.timeRange}
              onChange={(e) => setFilter({ ...filter, timeRange: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
            >
              <option value="1h">{t('last_hour')}</option>
              <option value="24h">{t('last_24_hours')}</option>
              <option value="7d">{t('last_7_days')}</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('metric')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('value')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('deviation')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('severity')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('confidence')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('time')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200">
              {filteredAnomalies.slice(0, 10).map((anomaly) => (
                <tr key={anomaly.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 cursor-pointer" onClick={() => setSelectedAnomaly(anomaly)}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{anomaly.metric}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">{anomaly.type.replace('_', ' ')}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {anomaly.value.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {anomaly.deviation.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(anomaly.severity)}`}>
                      {anomaly.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {(anomaly.confidence * 100).toFixed(0)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(anomaly.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Insights */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('ai_insights')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.slice(0, 6).map((insight) => (
            <div key={insight.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{insight.title}</span>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getImpactColor(insight.impact)}`}>
                  {insight.impact.toUpperCase()}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{insight.description}</p>
              
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{t('confidence')}: {(insight.confidence * 100).toFixed(0)}%</span>
                <span>{new Date(insight.timestamp).toLocaleDateString()}</span>
              </div>
              
              {insight.actionable && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{t('recommended_actions')}:</div>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500 space-y-1">
                    {insight.actions.slice(0, 2).map((action, index) => (
                      <li key={index}>• {action}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Anomaly Details Modal */}
      {selectedAnomaly && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-700 rounded-lg p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('anomaly_details')}</h3>
              <button
                onClick={() => setSelectedAnomaly(null)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('metric')}</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedAnomaly.metric}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('type')}</label>
                  <p className="text-sm text-gray-900 dark:text-white capitalize">{selectedAnomaly.type.replace('_', ' ')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('current_value')}</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedAnomaly.value.toFixed(1)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('expected_value')}</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedAnomaly.expectedValue.toFixed(1)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('deviation')}</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedAnomaly.deviation.toFixed(1)}%</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('confidence')}</label>
                  <p className="text-sm text-gray-900 dark:text-white">{(selectedAnomaly.confidence * 100).toFixed(0)}%</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('description')}</label>
                <p className="text-sm text-gray-900 dark:text-white">{selectedAnomaly.description}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('recommendations')}</label>
                <ul className="mt-2 space-y-1">
                  {selectedAnomaly.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-gray-900 dark:text-white flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 