import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  Download,
  Eye,
  EyeOff,
  Filter,
  Info,
  Search
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  service: string;
  traceId?: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  duration?: number;
  metadata: Record<string, unknown>;
  parsed: {
    method?: string;
    path?: string;
    statusCode?: number;
    responseTime?: number;
    errorType?: string;
    stackTrace?: string;
  };
}

interface LogFilter {
  level: string[];
  service: string[];
  timeRange: {
    start: string;
    end: string;
  };
  search: string;
  hasError: boolean;
  hasTraceId: boolean;
}

export const AdvancedLogs: React.FC = () => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<LogFilter>({
    level: [],
    service: [],
    timeRange: {
      start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString()
    },
    search: '',
    hasError: false,
    hasTraceId: false
  });
  const [showFilters, setShowFilters] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [selectedLogs, setSelectedLogs] = useState<Set<string>>(new Set());
  const [logStats, setLogStats] = useState({
    total: 0,
    errors: 0,
    warnings: 0,
    avgResponseTime: 0
  });

  // Generate mock logs
  useEffect(() => {
    const generateLogs = () => {
      const services = ['user-service', 'auth-service', 'payment-service', 'notification-service'];
      const levels = ['debug', 'info', 'warn', 'error', 'fatal'];
      const methods = ['GET', 'POST', 'PUT', 'DELETE'];
      const paths = ['/api/users', '/api/auth', '/api/payments', '/api/notifications'];
      
      const mockLogs: LogEntry[] = [];
      
      for (let i = 0; i < 100; i++) {
        const timestamp = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000);
        const level = levels[Math.floor(Math.random() * levels.length)] as LogEntry['level'];
        const service = services[Math.floor(Math.random() * services.length)];
        const method = methods[Math.floor(Math.random() * methods.length)];
        const path = paths[Math.floor(Math.random() * paths.length)];
        const statusCode = Math.random() > 0.1 ? 200 : [400, 401, 403, 404, 500][Math.floor(Math.random() * 5)];
        const responseTime = Math.floor(Math.random() * 1000) + 50;
        
        const log: LogEntry = {
          id: `log-${i}`,
          timestamp: timestamp.toISOString(),
          level,
          message: `${method} ${path} - ${statusCode === 200 ? 'Success' : 'Error'}`,
          service,
          traceId: Math.random() > 0.3 ? `trace-${Math.random().toString(36).substr(2, 9)}` : undefined,
          userId: Math.random() > 0.2 ? `user-${Math.floor(Math.random() * 1000)}` : undefined,
          ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          duration: responseTime,
          metadata: {
            requestId: `req-${Math.random().toString(36).substr(2, 9)}`,
            sessionId: `session-${Math.random().toString(36).substr(2, 9)}`,
            environment: 'production'
          },
          parsed: {
            method,
            path,
            statusCode,
            responseTime,
            errorType: statusCode !== 200 ? 'HTTPError' : undefined,
            stackTrace: statusCode !== 200 ? 'Error: Request failed\n    at processRequest (/app/src/controllers/user.js:15:10)' : undefined
          }
        };
        
        mockLogs.push(log);
      }
      
      setLogs(mockLogs);
    };
    
    generateLogs();
  }, []);

  // Filter logs
  useEffect(() => {
    let filtered = logs;
    
    // Level filter
    if (filter.level.length > 0) {
      filtered = filtered.filter(log => filter.level.includes(log.level));
    }
    
    // Service filter
    if (filter.service.length > 0) {
      filtered = filtered.filter(log => filter.service.includes(log.service));
    }
    
    // Time range filter
    filtered = filtered.filter(log => {
      const logTime = new Date(log.timestamp).getTime();
      const startTime = new Date(filter.timeRange.start).getTime();
      const endTime = new Date(filter.timeRange.end).getTime();
      return logTime >= startTime && logTime <= endTime;
    });
    
    // Search filter
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchLower) ||
        log.service.toLowerCase().includes(searchLower) ||
        log.traceId?.toLowerCase().includes(searchLower) ||
        log.userId?.toLowerCase().includes(searchLower)
      );
    }
    
    // Error filter
    if (filter.hasError) {
      filtered = filtered.filter(log => log.level === 'error' || log.level === 'fatal');
    }
    
    // Trace ID filter
    if (filter.hasTraceId) {
      filtered = filtered.filter(log => log.traceId);
    }
    
    setFilteredLogs(filtered);
    
    // Calculate stats
    const stats = {
      total: filtered.length,
      errors: filtered.filter(log => log.level === 'error' || log.level === 'fatal').length,
      warnings: filtered.filter(log => log.level === 'warn').length,
      avgResponseTime: filtered.length > 0 
        ? filtered.reduce((sum, log) => sum + (log.duration || 0), 0) / filtered.length 
        : 0
    };
    setLogStats(stats);
  }, [logs, filter]);

  const toggleLogExpansion = (logId: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  const toggleLogSelection = (logId: string) => {
    const newSelected = new Set(selectedLogs);
    if (newSelected.has(logId)) {
      newSelected.delete(logId);
    } else {
      newSelected.add(logId);
    }
    setSelectedLogs(newSelected);
  };

  const copyLogToClipboard = (log: LogEntry) => {
    const logText = JSON.stringify(log, null, 2);
    navigator.clipboard.writeText(logText);
    toast.success(t('log_copied_to_clipboard'));
  };

  const exportLogs = () => {
    const logsToExport = selectedLogs.size > 0 
      ? filteredLogs.filter(log => selectedLogs.has(log.id))
      : filteredLogs;
    
    const csvContent = [
      `${t('timestamp')},${t('level')},${t('service')},${t('message')},${t('trace_id')},${t('user_id')},${t('response_time')}`,
      ...logsToExport.map(log => 
        `${log.timestamp},${log.level},${log.service},"${log.message}",${log.traceId || ''},${log.userId || ''},${log.duration || ''}`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${t('logs')}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success(t('logs_exported_successfully'));
  };

  const getLevelColor = (level: string) => {
    const colors = {
      debug: 'bg-gray-100 dark:bg-gray-700 text-gray-800',
      info: 'bg-blue-100 text-blue-800',
      warn: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      fatal: 'bg-purple-100 text-purple-800'
    };
    return colors[level as keyof typeof colors] || colors.info;
  };

  const getLevelIcon = (level: string) => {
    if (level === 'error' || level === 'fatal') return <AlertTriangle className="w-4 h-4" />;
    if (level === 'warn') return <AlertTriangle className="w-4 h-4" />;
    return <Info className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('advanced_logs')}</h2>
          <p className="text-gray-600 dark:text-gray-400">{t('advanced_logs_subtitle')}</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>{t('filters')}</span>
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={exportLogs}
            className="btn-primary flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>{t('export_logs')}</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('total_logs')}</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{logStats.total}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Info className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('errors')}</p>
              <p className="text-2xl font-semibold text-red-600">{logStats.errors}</p>
            </div>
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('warnings')}</p>
              <p className="text-2xl font-semibold text-yellow-600">{logStats.warnings}</p>
            </div>
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('avg_response')}</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{Math.round(logStats.avgResponseTime)}ms</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Clock className="w-4 h-4 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('filters')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Level Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('log_level')}</label>
              <div className="space-y-2">
                {['debug', 'info', 'warn', 'error', 'fatal'].map(level => (
                  <label key={level} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filter.level.includes(level)}
                      onChange={(e) => {
                        const newLevels = e.target.checked
                          ? [...filter.level, level]
                          : filter.level.filter(l => l !== level);
                        setFilter({ ...filter, level: newLevels });
                      }}
                      className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">{level}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Service Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('service')}</label>
              <div className="space-y-2">
                {['user-service', 'auth-service', 'payment-service', 'notification-service'].map(service => (
                  <label key={service} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filter.service.includes(service)}
                      onChange={(e) => {
                        const newServices = e.target.checked
                          ? [...filter.service, service]
                          : filter.service.filter(s => s !== service);
                        setFilter({ ...filter, service: newServices });
                      }}
                      className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{service}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Time Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('time_range')}</label>
              <div className="space-y-2">
                <input
                  type="datetime-local"
                  value={filter.timeRange.start.slice(0, 16)}
                  onChange={(e) => setFilter({
                    ...filter,
                    timeRange: { ...filter.timeRange, start: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <input
                  type="datetime-local"
                  value={filter.timeRange.end.slice(0, 16)}
                  onChange={(e) => setFilter({
                    ...filter,
                    timeRange: { ...filter.timeRange, end: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Additional Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('additional_filters')}</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filter.hasError}
                    onChange={(e) => setFilter({ ...filter, hasError: e.target.checked })}
                    className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{t('has_errors')}</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filter.hasTraceId}
                    onChange={(e) => setFilter({ ...filter, hasTraceId: e.target.checked })}
                    className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{t('has_trace_id')}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
        <input
          type="text"
          placeholder={t('search_logs')}
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      {/* Logs Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedLogs.size === filteredLogs.length && filteredLogs.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedLogs(new Set(filteredLogs.map(log => log.id)));
                      } else {
                        setSelectedLogs(new Set());
                      }
                    }}
                    className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('timestamp')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('level')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('service')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('message')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('trace_id')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <React.Fragment key={log.id}>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedLogs.has(log.id)}
                        onChange={() => toggleLogSelection(log.id)}
                        className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelColor(log.level)}`}>
                        {getLevelIcon(log.level)}
                        <span className="ml-1 capitalize">{log.level}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {log.service}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-md truncate">
                      {log.message}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                      {log.traceId ? (
                        <span className="font-mono text-xs">{log.traceId}</span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleLogExpansion(log.id)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          {expandedLogs.has(log.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => copyLogToClipboard(log)}
                          className="text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white dark:text-white"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedLogs.has(log.id) && (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 bg-gray-50 dark:bg-gray-800">
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">{t('request_details')}</h4>
                              <div className="space-y-1 text-sm">
                                <div><span className="font-medium">{t('method')}:</span> {log.parsed.method}</div>
                                <div><span className="font-medium">{t('path')}:</span> {log.parsed.path}</div>
                                <div><span className="font-medium">{t('status')}:</span> {log.parsed.statusCode}</div>
                                <div><span className="font-medium">{t('response_time')}:</span> {log.parsed.responseTime}ms</div>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">{t('user_details')}</h4>
                              <div className="space-y-1 text-sm">
                                <div><span className="font-medium">{t('user_id')}:</span> {log.userId || '-'}</div>
                                <div><span className="font-medium">{t('ip')}:</span> {log.ip}</div>
                                <div><span className="font-medium">{t('user_agent')}:</span> {log.userAgent}</div>
                              </div>
                            </div>
                          </div>
                          
                          {log.parsed.stackTrace && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">{t('stack_trace')}</h4>
                              <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs font-mono overflow-x-auto">
                                {log.parsed.stackTrace}
                              </pre>
                            </div>
                          )}
                          
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">{t('metadata')}</h4>
                            <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs font-mono overflow-x-auto">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredLogs.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 dark:text-gray-500">
            {t('no_logs_found_matching_filters')}
          </div>
        )}
      </div>
    </div>
  );
}; 