import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Lock,
  Settings,
  Shield,
  ShieldAlert,
  Unlock,
  User,
  X,
  XCircle
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface SecurityEvent {
  id: string;
  timestamp: string;
  type: 'login' | 'logout' | 'access_denied' | 'suspicious_activity' | 'threat_detected' | 'config_change';
  severity: 'low' | 'medium' | 'high' | 'critical';
  user: string;
  ip: string;
  location: string;
  userAgent: string;
  action: string;
  resource: string;
  details: Record<string, unknown>;
  status: 'investigating' | 'resolved' | 'false_positive';
}

interface ThreatIntel {
  id: string;
  type: 'ip' | 'domain' | 'hash' | 'url';
  value: string;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  category: string[];
  firstSeen: string;
  lastSeen: string;
  description: string;
  source: string;
}

interface AccessControl {
  id: string;
  user: string;
  role: string;
  permissions: string[];
  lastAccess: string;
  status: 'active' | 'suspended' | 'expired';
  ipWhitelist: string[];
  mfaEnabled: boolean;
  lastLogin: string;
}

interface SecurityMetrics {
  totalEvents: number;
  threatsBlocked: number;
  suspiciousActivities: number;
  failedLogins: number;
  successfulLogins: number;
  avgResponseTime: number;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
}

export const SecuritySystem: React.FC = () => {
  const { t } = useTranslation();
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [threatIntel, setThreatIntel] = useState<ThreatIntel[]>([]);
  const [accessControls, setAccessControls] = useState<AccessControl[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalEvents: 0,
    threatsBlocked: 0,
    suspiciousActivities: 0,
    failedLogins: 0,
    successfulLogins: 0,
    avgResponseTime: 0,
    threatLevel: 'low'
  });
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [filter, setFilter] = useState({
    severity: [] as string[],
    type: [] as string[],
    status: [] as string[],
    timeRange: '24h'
  });

  // Generate mock security data
  useEffect(() => {
    const generateSecurityData = () => {
      // Generate security events
      const events: SecurityEvent[] = Array.from({ length: 50 }, (_, i) => {
        const types: SecurityEvent['type'][] = ['login', 'logout', 'access_denied', 'suspicious_activity', 'threat_detected', 'config_change'];
        const severities: SecurityEvent['severity'][] = ['low', 'medium', 'high', 'critical'];
        const statuses: SecurityEvent['status'][] = ['investigating', 'resolved', 'false_positive'];
        
        const event: SecurityEvent = {
          id: `event-${i}`,
          timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
          type: types[Math.floor(Math.random() * types.length)],
          severity: severities[Math.floor(Math.random() * severities.length)],
          user: `user-${Math.floor(Math.random() * 100)}`,
          ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          location: ['New York', 'London', 'Tokyo', 'Sydney', 'Berlin'][Math.floor(Math.random() * 5)],
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          action: 'API request',
          resource: '/api/users',
          details: {
            method: 'GET',
            statusCode: Math.random() > 0.1 ? 200 : 403,
            responseTime: Math.floor(Math.random() * 1000) + 50
          },
          status: statuses[Math.floor(Math.random() * statuses.length)]
        };
        
        return event;
      });

      // Generate threat intelligence
      const threats: ThreatIntel[] = Array.from({ length: 20 }, (_, i) => ({
        id: `threat-${i}`,
        type: ['ip', 'domain', 'hash', 'url'][Math.floor(Math.random() * 4)] as ThreatIntel['type'],
        value: `threat-${Math.random().toString(36).substr(2, 9)}`,
        threatLevel: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as ThreatIntel['threatLevel'],
        category: ['malware', 'phishing', 'botnet', 'spam'].slice(0, Math.floor(Math.random() * 2) + 1),
        firstSeen: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        lastSeen: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Suspicious activity detected',
        source: 'CrowdStrike'
      }));

      // Generate access controls
      const access: AccessControl[] = Array.from({ length: 10 }, (_, i) => ({
        id: `access-${i}`,
        user: `user-${i}`,
        role: ['admin', 'user', 'viewer', 'operator'][Math.floor(Math.random() * 4)],
        permissions: ['read', 'write', 'delete'].slice(0, Math.floor(Math.random() * 3) + 1),
        lastAccess: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        status: ['active', 'suspended', 'expired'][Math.floor(Math.random() * 3)] as AccessControl['status'],
        ipWhitelist: [`${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.0.0/16`],
        mfaEnabled: Math.random() > 0.3,
        lastLogin: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
      }));

      setSecurityEvents(events);
      setThreatIntel(threats);
      setAccessControls(access);

      // Calculate metrics
      const totalEvents = events.length;
      const threatsBlocked = events.filter(e => e.type === 'threat_detected').length;
      const suspiciousActivities = events.filter(e => e.type === 'suspicious_activity').length;
      const failedLogins = events.filter(e => e.type === 'access_denied').length;
      const successfulLogins = events.filter(e => e.type === 'login').length;
      const avgResponseTime = events.reduce((sum, e) => sum + ((e.details.responseTime as number) || 0), 0) / events.length;
      
      const threatLevel = threatsBlocked > 10 ? 'critical' : 
                         threatsBlocked > 5 ? 'high' : 
                         threatsBlocked > 2 ? 'medium' : 'low';

      setMetrics({
        totalEvents,
        threatsBlocked,
        suspiciousActivities,
        failedLogins,
        successfulLogins,
        avgResponseTime,
        threatLevel
      });
    };

    generateSecurityData();
  }, []);

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[severity as keyof typeof colors] || colors.low;
  };

  const getThreatLevelColor = (level: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[level as keyof typeof colors] || colors.low;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'investigating': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'false_positive': return <XCircle className="w-4 h-4 text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500" />;
      default: return <Activity className="w-4 h-4 text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500" />;
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login': return <Unlock className="w-4 h-4 text-green-600" />;
      case 'logout': return <Lock className="w-4 h-4 text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500" />;
      case 'access_denied': return <ShieldAlert className="w-4 h-4 text-red-600" />;
      case 'suspicious_activity': return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'threat_detected': return <Shield className="w-4 h-4 text-red-600" />;
      case 'config_change': return <Settings className="w-4 h-4 text-blue-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500" />;
    }
  };

  const filteredEvents = securityEvents.filter(event => {
    if (filter.severity.length > 0 && !filter.severity.includes(event.severity)) return false;
    if (filter.type.length > 0 && !filter.type.includes(event.type)) return false;
    if (filter.status.length > 0 && !filter.status.includes(event.status)) return false;
    return true;
  });

  const threatData = [
    { name: t('threat_distribution_blocked'), value: metrics.threatsBlocked, color: '#EF4444' },
    { name: t('threat_distribution_suspicious'), value: metrics.suspiciousActivities, color: '#F59E0B' },
    { name: t('threat_distribution_failed_logins'), value: metrics.failedLogins, color: '#8B5CF6' },
    { name: t('threat_distribution_successful_logins'), value: metrics.successfulLogins, color: '#10B981' }
  ];

  const timelineData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    events: Math.floor(Math.random() * 10),
    threats: Math.floor(Math.random() * 3)
  }));

  const exportSecurityReport = () => {
    alert('Export functionality not implemented yet.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('security_system')}</h2>
          <p className="text-gray-600 dark:text-gray-400">{t('security_system_subtitle')}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-md ${getThreatLevelColor(metrics.threatLevel)}`}>
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium capitalize">{t('threat_level')}</span>
          </div>
          <button
            onClick={exportSecurityReport}
            className="btn-secondary flex items-center space-x-2"
          >
            <Activity className="w-4 h-4" />
            <span>{t('export_report')}</span>
          </button>
        </div>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('total_events')}</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{metrics.totalEvents}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Activity className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('threats_blocked')}</p>
              <p className="text-2xl font-semibold text-red-600">{metrics.threatsBlocked}</p>
            </div>
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <Shield className="w-4 h-4 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('suspicious_activities')}</p>
              <p className="text-2xl font-semibold text-orange-600">{metrics.suspiciousActivities}</p>
            </div>
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('failed_logins')}</p>
              <p className="text-2xl font-semibold text-purple-600">{metrics.failedLogins}</p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Lock className="w-4 h-4 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Threat Distribution */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('threat_distribution')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={threatData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
              >
                {threatData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Security Timeline */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('security_events_timeline')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="events" stroke="#3B82F6" strokeWidth={2} name={t('events')} />
              <Line type="monotone" dataKey="threats" stroke="#EF4444" strokeWidth={2} name={t('threats')} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Security Events */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('security_events')}</h3>
          <div className="flex items-center space-x-2">
            <select
              value={filter.timeRange}
              onChange={(e) => setFilter({ ...filter, timeRange: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="1h">{t('last_hour')}</option>
              <option value="24h">{t('last_24_hours')}</option>
              <option value="7d">{t('last_7_days')}</option>
              <option value="30d">{t('last_30_days')}</option>
            </select>
            <button className="btn-secondary flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>{t('export')}</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('event')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('user')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('ip_address')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('severity')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('time')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200">
              {filteredEvents.slice(0, 10).map((event) => (
                <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 cursor-pointer" onClick={() => setSelectedEvent(event)}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      {getEventIcon(event.type)}
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">{event.type.replace('_', ' ')}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">{event.action}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {event.user}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                    {event.ip}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(event.severity)}`}>
                      {event.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(event.status)}
                      <span className="text-sm text-gray-900 dark:text-white capitalize">{event.status.replace('_', ' ')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                    {new Date(event.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Threat Intelligence */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('threat_intelligence')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {threatIntel.slice(0, 6).map((threat) => (
            <div key={threat.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getThreatLevelColor(threat.threatLevel)}`}>
                  {threat.threatLevel.toUpperCase()}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{threat.type}</span>
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">{threat.value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{threat.description}</div>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{t('source')}: {threat.source}</span>
                <span>{new Date(threat.lastSeen).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Access Control */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('access_control')}</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('user')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('role')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('mfa')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('last_login')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200">
              {accessControls.map((access) => (
                <tr key={access.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{access.user}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white capitalize">
                    {access.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      access.status === 'active' ? 'bg-green-100 text-green-800' :
                      access.status === 'suspended' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 dark:bg-gray-700 text-gray-800'
                    }`}>
                      {access.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {access.mfaEnabled ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                    {new Date(access.lastLogin).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-700 rounded-lg p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('event_details')}</h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('event_type')}</label>
                  <p className="text-sm text-gray-900 dark:text-white capitalize">{selectedEvent.type.replace('_', ' ')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('severity')}</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(selectedEvent.severity)}`}>
                    {selectedEvent.severity.toUpperCase()}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('user')}</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedEvent.user}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('ip_address')}</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedEvent.ip}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('location')}</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedEvent.location}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('status')}</label>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedEvent.status)}
                    <span className="text-sm text-gray-900 dark:text-white capitalize">{selectedEvent.status.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('action')}</label>
                <p className="text-sm text-gray-900 dark:text-white">{selectedEvent.action}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('resource')}</label>
                <p className="text-sm text-gray-900 dark:text-white">{selectedEvent.resource}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('details')}</label>
                <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs font-mono overflow-x-auto">
                  {JSON.stringify(selectedEvent.details, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 