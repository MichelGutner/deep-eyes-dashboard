import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Settings, 
  Clock,
  Mail,
  MessageSquare,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved';
  source: string;
  assignedTo?: string;
  tags: string[];
}

interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  metric: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  notifications: {
    email: boolean;
    slack: boolean;
    webhook: boolean;
  };
}

export const AlertSystem: React.FC = () => {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  // Mock data for alerts
  const mockAlerts: Alert[] = [
    {
      id: '1',
      type: 'error',
      title: 'High Error Rate Detected',
      message: 'Error rate exceeded 5% threshold in the last 5 minutes',
      severity: 'high',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      status: 'active',
      source: 'user-service',
      tags: ['api', 'errors', 'performance']
    },
    {
      id: '2',
      type: 'warning',
      title: 'Memory Usage Warning',
      message: 'Memory usage is at 85% of capacity',
      severity: 'medium',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      status: 'acknowledged',
      source: 'api-gateway',
      assignedTo: 'john.doe@company.com',
      tags: ['infrastructure', 'memory']
    },
    {
      id: '3',
      type: 'info',
      title: 'Deployment Completed',
      message: 'New version v2.1.0 successfully deployed to production',
      severity: 'low',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      status: 'resolved',
      source: 'deployment-service',
      tags: ['deployment', 'success']
    }
  ];

  // Mock data for alert rules
  const mockAlertRules: AlertRule[] = [
    {
      id: '1',
      name: 'High Error Rate',
      condition: 'error_rate > 5%',
      threshold: 5,
      metric: 'error_rate',
      severity: 'high',
      enabled: true,
      notifications: {
        email: true,
        slack: true,
        webhook: false
      }
    },
    {
      id: '2',
      name: 'Memory Usage',
      condition: 'memory_usage > 80%',
      threshold: 80,
      metric: 'memory_usage',
      severity: 'medium',
      enabled: true,
      notifications: {
        email: true,
        slack: false,
        webhook: true
      }
    },
    {
      id: '3',
      name: 'Response Time',
      condition: 'response_time > 500ms',
      threshold: 500,
      metric: 'response_time',
      severity: 'medium',
      enabled: false,
      notifications: {
        email: false,
        slack: true,
        webhook: false
      }
    }
  ];

  useEffect(() => {
    setAlerts(mockAlerts);
    setAlertRules(mockAlertRules);
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
      active: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      acknowledged: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    };
    return colors[status as keyof typeof colors] || colors.active;
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'acknowledged' as const }
        : alert
    ));
    toast.success(t('alert_acknowledged'));
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'resolved' as const }
        : alert
    ));
    toast.success(t('alert_resolved'));
  };

  const toggleAlertRule = (ruleId: string) => {
    setAlertRules(alertRules.map(rule => 
      rule.id === ruleId 
        ? { ...rule, enabled: !rule.enabled }
        : rule
    ));
    toast.success(t('alert_rule_updated'));
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filterStatus !== 'all' && alert.status !== filterStatus) return false;
    if (filterSeverity !== 'all' && alert.severity !== filterSeverity) return false;
    return true;
  });

  const exportAlertReport = () => {
    toast.success(t('export_report_success'));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('alert_system')}</h2>
          <p className="text-gray-600 dark:text-gray-400">{t('alert_system_subtitle')}</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={exportAlertReport}
            className="btn-secondary flex items-center space-x-2"
          >
            <Activity className="w-4 h-4" />
            <span>{t('export_report')}</span>
          </button>
        </div>
      </div>

      {/* Alert Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('active_alerts')}</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {alerts.filter(a => a.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('acknowledged')}</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {alerts.filter(a => a.status === 'acknowledged').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('resolved')}</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {alerts.filter(a => a.status === 'resolved').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('alert_rules')}</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {alertRules.filter(r => r.enabled).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('filter_by_status')}</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 dark:bg-gray-700 text-gray-900 dark:text-white dark:text-white"
            >
              <option value="all">{t('all_status')}</option>
              <option value="active">{t('active')}</option>
              <option value="acknowledged">{t('acknowledged')}</option>
              <option value="resolved">{t('resolved')}</option>
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('filter_by_severity')}</label>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 dark:bg-gray-700 text-gray-900 dark:text-white dark:text-white"
            >
              <option value="all">{t('all_severities')}</option>
              <option value="low">{t('low')}</option>
              <option value="medium">{t('medium')}</option>
              <option value="high">{t('high')}</option>
              <option value="critical">{t('critical')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('recent_alerts')}</h3>
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">{t('no_alerts_found')}</div>
          ) : (
            filteredAlerts.map((alert) => (
              <div key={alert.id} className="border border-gray-200 dark:border-gray-700 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                        {alert.status.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(alert.timestamp).toLocaleString()}
                      </span>
                    </div>
                    
                    <h4 className="font-medium text-gray-900 dark:text-white">{alert.title}</h4>
                    <p className="text-gray-600 dark:text-gray-400">{alert.message}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>{t('source')}: {alert.source}</span>
                      {alert.assignedTo && (
                        <>
                          <span>•</span>
                          <span>{t('assigned_to')}: {alert.assignedTo}</span>
                        </>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {alert.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 dark:bg-gray-700 text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-300 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    {alert.status === 'active' && (
                      <>
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="btn-secondary text-xs"
                        >
                          {t('acknowledge')}
                        </button>
                        <button
                          onClick={() => resolveAlert(alert.id)}
                          className="btn-primary text-xs"
                        >
                          {t('resolve')}
                        </button>
                      </>
                    )}
                    {alert.status === 'acknowledged' && (
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="btn-primary text-xs"
                      >
                        {t('resolve')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Alert Rules */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('alert_rules')}</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('rule_name')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('condition')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('severity')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('notifications')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200">
              {alertRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {rule.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {rule.condition}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(rule.severity)}`}>
                      {rule.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleAlertRule(rule.id)}
                      className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                        rule.enabled ? 'bg-primary-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white dark:bg-gray-700 shadow transform ring-0 transition ease-in-out duration-200 ${
                          rule.enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex space-x-2">
                      {rule.notifications.email && <Mail className="w-4 h-4" />}
                      {rule.notifications.slack && <MessageSquare className="w-4 h-4" />}
                      {rule.notifications.webhook && <Settings className="w-4 h-4" />}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-primary-600 hover:text-primary-900 mr-3">{t('edit')}</button>
                    <button className="text-red-600 hover:text-red-900">{t('delete')}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}; 