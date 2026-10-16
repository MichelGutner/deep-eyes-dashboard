import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Wifi,
  WifiOff,
  Users,
  Activity,
  Send,
  Play,
  Pause
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useRealtimeStream } from '../hooks/useRealtime';

interface RealTimeMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  trend: 'up' | 'down' | 'stable';
}

interface LiveEvent {
  id: string;
  type: 'log' | 'error' | 'alert' | 'metric';
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
}

interface CollaborationMessage {
  id: string;
  user: string;
  message: string;
  timestamp: string;
  type: 'comment' | 'alert' | 'note';
}

export const RealTimeSystem: React.FC = () => {
  const { t } = useTranslation();
  const { data: streamData, connected: isConnected } = useRealtimeStream();
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [collaborationMessages, setCollaborationMessages] = useState<CollaborationMessage[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [newMessage, setNewMessage] = useState('');

  // Mapeia eventos do backend para LiveEvent
  useEffect(() => {
    if (!streamData?.events?.length) return;
    const incoming: LiveEvent[] = streamData.events.map(e => ({
      id: e.id,
      type: (e.level === 'error' || e.level === 'fatal') ? 'error' : 'log',
      message: e.message,
      timestamp: e.timestamp,
      severity: e.level === 'fatal' ? 'critical' : e.level === 'error' ? 'high' : e.level === 'warn' ? 'medium' : 'low',
      source: e.app ?? e.platform ?? 'unknown',
    }));
    setLiveEvents(prev => {
      const existingIds = new Set(prev.map(e => e.id));
      const fresh = incoming.filter(e => !existingIds.has(e.id));
      return [...fresh, ...prev].slice(0, 50);
    });
  }, [streamData]);

  const realTimeMetrics: RealTimeMetric[] = streamData ? [
    { id: '1', name: 'Requests/min', value: streamData.requestsPerMin, unit: 'req/min', timestamp: new Date().toISOString(), trend: 'stable' },
    { id: '2', name: 'Errors/min',   value: streamData.errorsLastMinute, unit: 'errors', timestamp: new Date().toISOString(), trend: streamData.errorsLastMinute > 0 ? 'up' : 'stable' },
    { id: '3', name: 'Avg Response', value: streamData.avgResponseTime, unit: 'ms', timestamp: new Date().toISOString(), trend: 'stable' },
    { id: '4', name: 'Active Users', value: streamData.activeUsers, unit: 'users', timestamp: new Date().toISOString(), trend: 'stable' },
  ] : [];

  const sendCollaborationMessage = () => {
    if (newMessage.trim()) {
      const message: CollaborationMessage = {
        id: Date.now().toString(),
        user: 'John Admin',
        message: newMessage,
        timestamp: new Date().toISOString(),
        type: 'comment'
      };
      
      setCollaborationMessages(prev => [message, ...prev]);
      setNewMessage('');
      toast.success('Message sent!');
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return '↗️';
    if (trend === 'down') return '↘️';
    return '→';
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[severity as keyof typeof colors] || colors.low;
  };

  const filteredMetrics = realTimeMetrics;
  void refreshInterval; // controlled by SSE server (5s)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('real_time_system')}</h2>
          <p className="text-gray-600 dark:text-gray-400">{t('real_time_system_subtitle')}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Wifi className="w-5 h-5 text-green-600" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-600" />
            )}
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {isConnected ? t('connected') : t('disconnected')}
            </span>
          </div>
          
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md ${
              autoRefresh ? 'bg-green-100 text-green-800' : 'bg-gray-100 dark:bg-gray-700 text-gray-800'
            }`}
          >
            {autoRefresh ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            <span>{autoRefresh ? t('live') : t('paused')}</span>
          </button>
          
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value={1000}>1s</option>
            <option value={5000}>5s</option>
            <option value={10000}>10s</option>
            <option value={30000}>30s</option>
          </select>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredMetrics.map((metric) => (
          <div key={metric.id} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-300">{metric.name}</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {metric.value.toFixed(metric.unit === '%' ? 1 : 0)}{metric.unit}
                </p>
              </div>
              <div className="text-2xl">
                {getTrendIcon(metric.trend)}
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {t('updated')}: {new Date(metric.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      {/* Live Events and Collaboration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Events */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('live_events')}</h3>
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-green-600 animate-pulse" />
              <span className="text-sm text-gray-500 dark:text-gray-400">{t('live')}</span>
            </div>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {liveEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {t('no_live_events_yet')}
              </div>
            ) : (
              liveEvents.map((event) => (
                <div key={event.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(event.severity)}`}>
                          {event.severity.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-300">{event.type}</span>
                      </div>
                      <p className="text-sm text-gray-900 dark:text-white">{event.message}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>{t('source')}: {event.source}</span>
                        <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Collaboration */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('team_collaboration')}</h3>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-500 dark:text-gray-400">{t('online_users')}</span>
            </div>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
            {collaborationMessages.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {t('no_messages_yet')}
              </div>
            ) : (
              collaborationMessages.map((message) => (
                <div key={message.id} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{message.user}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-300">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{message.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendCollaborationMessage()}
              placeholder={t('type_message')}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              onClick={sendCollaborationMessage}
              className="btn-primary flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{t('send')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Activity Feed */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('activity_feed')}</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-700 dark:text-gray-200">{t('new_user_login')}</span>
            <span className="text-xs text-gray-500 dark:text-gray-300 ml-auto">{t('2s_ago')}</span>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700 dark:text-gray-200">{t('database_backup_completed')}</span>
            <span className="text-xs text-gray-500 dark:text-gray-300 ml-auto">{t('1m_ago')}</span>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-gray-700 dark:text-gray-200">{t('high_memory_usage_alert_resolved')}</span>
            <span className="text-xs text-gray-500 dark:text-gray-300 ml-auto">{t('3m_ago')}</span>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900 rounded-lg">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-sm text-gray-700 dark:text-gray-200">{t('new_deployment_to_production')}</span>
            <span className="text-xs text-gray-500 dark:text-gray-300 ml-auto">{t('5m_ago')}</span>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('connection_status')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-700 dark:text-gray-200">{t('web_socket_connection')}</span>
            <span className={`text-xs ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isConnected ? t('connected') : t('disconnected')}
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700 dark:text-gray-200">{t('api_endpoints')}</span>
            <span className="text-xs text-green-600">{t('healthy')}</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700 dark:text-gray-200">{t('data_stream')}</span>
            <span className="text-xs text-green-600">{t('active')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 