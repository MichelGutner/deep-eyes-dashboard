import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle,
  ShieldAlert,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';

interface SecurityEvent {
  id: string;
  timestamp: string;
  type: 'login' | 'logout' | 'access_denied' | 'suspicious_activity' | 'threat_detected' | 'config_change' | 'vulnerability' | 'compliance_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  user: string;
  ip: string;
  location: string;
  userAgent: string;
  action: string;
  resource: string;
  details: Record<string, string | number>;
  status: 'investigating' | 'resolved' | 'false_positive' | 'escalated';
  threatIntelligence?: ThreatIntel;
}

interface ThreatIntel {
  id: string;
  type: 'ip' | 'domain' | 'hash' | 'url' | 'email';
  value: string;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  category: string[];
  firstSeen: string;
  lastSeen: string;
  description: string;
  source: string;
  confidence: number;
  tags: string[];
}

interface ComplianceReport {
  id: string;
  framework: 'SOC2' | 'GDPR' | 'HIPAA' | 'PCI-DSS' | 'ISO27001';
  status: 'compliant' | 'non-compliant' | 'partial';
  score: number;
  lastAssessment: string;
  nextAssessment: string;
  violations: ComplianceViolation[];
  recommendations: string[];
}

interface ComplianceViolation {
  id: string;
  control: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved';
  dueDate: string;
  assignedTo: string;
}

interface Vulnerability {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  cvssScore: number;
  affectedSystems: string[];
  cveId?: string;
  publishedDate: string;
  status: 'open' | 'in_progress' | 'resolved' | 'false_positive';
  remediation: string;
  assignedTo: string;
}

interface SecurityMetrics {
  totalEvents: number;
  threatsBlocked: number;
  suspiciousActivities: number;
  failedLogins: number;
  successfulLogins: number;
  avgResponseTime: number;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  complianceScore: number;
  vulnerabilityCount: number;
  activeThreats: number;
}

export const EnhancedSecurity: React.FC = () => {
  const { t } = useTranslation();
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [threatIntel, setThreatIntel] = useState<ThreatIntel[]>([]);
  const [complianceReports, setComplianceReports] = useState<ComplianceReport[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalEvents: 0,
    threatsBlocked: 0,
    suspiciousActivities: 0,
    failedLogins: 0,
    successfulLogins: 0,
    avgResponseTime: 0,
    threatLevel: 'low',
    complianceScore: 0,
    vulnerabilityCount: 0,
    activeThreats: 0
  });
  const [selectedView, setSelectedView] = useState('overview');
  const [filter, setFilter] = useState({
    severity: 'all',
    type: 'all',
    status: 'all',
    timeRange: '24h'
  });

  // Generate mock security data
  useEffect(() => {
    const generateSecurityData = () => {
      // Generate security events
      const events: SecurityEvent[] = Array.from({ length: 100 }, (_, i) => {
        const types: SecurityEvent['type'][] = ['login', 'logout', 'access_denied', 'suspicious_activity', 'threat_detected', 'config_change', 'vulnerability', 'compliance_violation'];
        const severities: SecurityEvent['severity'][] = ['low', 'medium', 'high', 'critical'];
        const statuses: SecurityEvent['status'][] = ['investigating', 'resolved', 'false_positive', 'escalated'];
        
        const event: SecurityEvent = {
          id: `event-${i}`,
          timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
          type: types[Math.floor(Math.random() * types.length)],
          severity: severities[Math.floor(Math.random() * severities.length)],
          user: `user-${Math.floor(Math.random() * 100)}`,
          ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          location: ['New York', 'London', 'Tokyo', 'Sydney', 'Berlin', 'Moscow', 'Beijing'][Math.floor(Math.random() * 7)],
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
      const threats: ThreatIntel[] = Array.from({ length: 30 }, (_, i) => ({
        id: `threat-${i}`,
        type: ['ip', 'domain', 'hash', 'url', 'email'][Math.floor(Math.random() * 5)] as ThreatIntel['type'],
        value: `threat-${Math.random().toString(36).substr(2, 9)}`,
        threatLevel: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as ThreatIntel['threatLevel'],
        category: [
          ['malware', 'phishing', 'botnet', 'spam', 'apt', 'ransomware'][Math.floor(Math.random() * 6)]
        ],
        firstSeen: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        lastSeen: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Suspicious activity detected',
        source: ['CrowdStrike', 'FireEye', 'AlienVault', 'VirusTotal', 'AbuseIPDB'][Math.floor(Math.random() * 5)],
        confidence: Math.floor(Math.random() * 40) + 60,
        tags: [
          ['malware', 'suspicious', 'blocked'][Math.floor(Math.random() * 3)]
        ]
      }));

      // Generate compliance reports
      const compliance: ComplianceReport[] = [
        {
          id: 'soc2-1',
          framework: 'SOC2',
          status: 'compliant',
          score: 95,
          lastAssessment: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          nextAssessment: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000).toISOString(),
          violations: [],
          recommendations: ['Continue monitoring access controls', 'Regular security training']
        },
        {
          id: 'gdpr-1',
          framework: 'GDPR',
          status: 'partial',
          score: 78,
          lastAssessment: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          nextAssessment: new Date(Date.now() + 350 * 24 * 60 * 60 * 1000).toISOString(),
          violations: [
            {
              id: 'gdpr-violation-1',
              control: 'Data Retention Policy',
              description: 'Personal data retention exceeds required limits',
              severity: 'medium',
              status: 'in_progress',
              dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              assignedTo: 'security-team'
            }
          ],
          recommendations: ['Implement data retention automation', 'Review data processing agreements']
        },
        {
          id: 'hipaa-1',
          framework: 'HIPAA',
          status: 'compliant',
          score: 92,
          lastAssessment: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          nextAssessment: new Date(Date.now() + 320 * 24 * 60 * 60 * 1000).toISOString(),
          violations: [],
          recommendations: ['Maintain encryption standards', 'Regular audit logging']
        }
      ];

      // Generate vulnerabilities
      const vulns: Vulnerability[] = Array.from({ length: 20 }, (_, i) => ({
        id: `vuln-${i}`,
        title: `Vulnerability ${i + 1}`,
        description: `Security vulnerability in system component ${i + 1}`,
        severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as Vulnerability['severity'],
        cvssScore: Math.floor(Math.random() * 10) + 1,
        affectedSystems: ['web-server', 'database', 'api-gateway', 'load-balancer'].slice(0, Math.floor(Math.random() * 3) + 1),
        cveId: `CVE-2024-${Math.floor(Math.random() * 9999)}`,
        publishedDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        status: ['open', 'in_progress', 'resolved', 'false_positive'][Math.floor(Math.random() * 4)] as Vulnerability['status'],
        remediation: 'Apply security patch or update affected component',
        assignedTo: ['security-team', 'dev-team', 'ops-team'][Math.floor(Math.random() * 3)]
      }));

      setSecurityEvents(events);
      setThreatIntel(threats);
      setComplianceReports(compliance);
      setVulnerabilities(vulns);

      // Calculate metrics
      const totalEvents = events.length;
      const threatsBlocked = events.filter(e => e.type === 'threat_detected').length;
      const suspiciousActivities = events.filter(e => e.type === 'suspicious_activity').length;
      const failedLogins = events.filter(e => e.type === 'access_denied').length;
      const successfulLogins = events.filter(e => e.type === 'login').length;
      const avgResponseTime = events.reduce((sum, e) => sum + (typeof e.details.responseTime === 'number' ? e.details.responseTime : 0), 0) / events.length;
      const complianceScore = compliance.reduce((sum, c) => sum + c.score, 0) / compliance.length;
      const vulnerabilityCount = vulns.filter(v => v.status === 'open').length;
      const activeThreats = threats.filter(t => t.threatLevel === 'high' || t.threatLevel === 'critical').length;
      
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
        threatLevel,
        complianceScore,
        vulnerabilityCount,
        activeThreats
      });
    };

    generateSecurityData();
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
      investigating: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      false_positive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      escalated: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[status as keyof typeof colors] || colors.investigating;
  };

  const getComplianceColor = (status: string) => {
    const colors = {
      compliant: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      partial: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'non-compliant': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[status as keyof typeof colors] || colors.partial;
  };

  const getVulnerabilityColor = (severity: string) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[severity as keyof typeof colors] || colors.low;
  };

  const filteredEvents = securityEvents.filter(event => {
    if (filter.severity !== 'all' && event.severity !== filter.severity) return false;
    if (filter.type !== 'all' && event.type !== filter.type) return false;
    if (filter.status !== 'all' && event.status !== filter.status) return false;
    return true;
  });

  const exportSecurityReport = () => {
    const report = {
      metrics,
      events: filteredEvents,
      threats: threatIntel,
      compliance: complianceReports,
      vulnerabilities,
      generatedAt: new Date().toISOString()
    };
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'security-report.json';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Security report exported successfully!');
  };

  const tabs = [
    { id: 'overview', label: t('overview'), icon: BarChart3 },
    { id: 'siem', label: t('siem_events'), icon: Activity },
    { id: 'threats', label: t('threat_intelligence'), icon: ShieldAlert },
    { id: 'compliance', label: t('compliance'), icon: BarChart3 },
    { id: 'vulnerabilities', label: t('vulnerabilities'), icon: AlertTriangle }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('enhanced_security')}</h2>
          <p className="text-gray-600 dark:text-gray-400">{t('enhanced_security_subtitle')}</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={exportSecurityReport}
            className="btn-secondary flex items-center space-x-2"
          >
            <Activity className="w-4 h-4" />
            <span>{t('export_report')}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
        {tabs.map((tab) => (
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

      {/* Overview */}
      {selectedView === 'overview' && (
        <div className="space-y-6">
          {/* Security Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('total_events')}</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{metrics.totalEvents}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('threats_blocked')}</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{metrics.threatsBlocked}</p>
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
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('compliance_score')}</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{Math.round(metrics.complianceScore)}%</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('vulnerabilities')}</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{metrics.vulnerabilityCount}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('active_threats')}</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{metrics.activeThreats}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('security_events_timeline')}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={Array.from({ length: 24 }, (_, i) => ({
                  hour: i,
                  events: Math.floor(Math.random() * 50) + 10,
                  threats: Math.floor(Math.random() * 10) + 1
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="events" stroke="#3B82F6" strokeWidth={2} name={t('events')} />
                  <Line type="monotone" dataKey="threats" stroke="#EF4444" strokeWidth={2} name={t('threats')} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('threat_distribution')}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: t('malware'), value: 35 },
                      { name: t('phishing'), value: 25 },
                      { name: t('ddos'), value: 20 },
                      { name: t('apt'), value: 15 },
                      { name: t('other'), value: 5 }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#3B82F6" />
                    <Cell fill="#EF4444" />
                    <Cell fill="#F59E0B" />
                    <Cell fill="#10B981" />
                    <Cell fill="#8B5CF6" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* SIEM Events */}
      {selectedView === 'siem' && (
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('siem_events')}</h3>
              <div className="flex items-center space-x-2">
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
                
                <select
                  value={filter.type}
                  onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">{t('all_types')}</option>
                  <option value="login">{t('login')}</option>
                  <option value="access_denied">{t('access_denied')}</option>
                  <option value="suspicious_activity">{t('suspicious_activity')}</option>
                  <option value="threat_detected">{t('threat_detected')}</option>
                </select>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
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
                <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredEvents.slice(0, 20).map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <Activity className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">{event.type.replace('_', ' ')}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{event.action}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {event.user}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {event.ip}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(event.severity)}`}>
                          {event.severity.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                          {event.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(event.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Threat Intelligence */}
      {selectedView === 'threats' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('threat_intelligence')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {threatIntel.slice(0, 12).map((threat) => (
                <div key={threat.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(threat.threatLevel)}`}>
                      {threat.threatLevel.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{threat.type}</span>
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">{threat.value}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{threat.description}</div>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{t('source')}: {threat.source}</span>
                    <span>{t('confidence')}: {threat.confidence}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>{t('first_seen')}: {new Date(threat.firstSeen).toLocaleDateString()}</span>
                    <span>{t('last_seen')}: {new Date(threat.lastSeen).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Compliance */}
      {selectedView === 'compliance' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('compliance_reports')}</h3>
            <div className="space-y-4">
              {complianceReports.map((report) => (
                <div key={report.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getComplianceColor(report.status)}`}>
                        {report.status.toUpperCase()}
                      </span>
                      <h4 className="font-medium text-gray-900 dark:text-white">{report.framework}</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{report.score}%</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('compliance_score')}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('last_assessment')}</p>
                      <p className="text-sm text-gray-900 dark:text-white">{new Date(report.lastAssessment).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('next_assessment')}</p>
                      <p className="text-sm text-gray-900 dark:text-white">{new Date(report.nextAssessment).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  {report.violations.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{t('violations')}:</p>
                      <div className="space-y-2">
                        {report.violations.map((violation) => (
                          <div key={violation.id} className="border border-gray-200 dark:border-gray-600 rounded p-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{violation.control}</span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(violation.severity)}`}>
                                {violation.severity}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{violation.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{t('recommendations')}:</p>
                    <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      {report.recommendations.map((rec, index) => (
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

      {/* Vulnerabilities */}
      {selectedView === 'vulnerabilities' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('vulnerability_management')}</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('vulnerability')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('severity')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('cvss_score')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('affected_systems')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('assigned_to')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                  {vulnerabilities.map((vuln) => (
                    <tr key={vuln.id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{vuln.title}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{vuln.description}</div>
                          {vuln.cveId && (
                            <div className="text-xs text-gray-400 dark:text-gray-500">{vuln.cveId}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getVulnerabilityColor(vuln.severity)}`}>
                          {vuln.severity.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {vuln.cvssScore}/10
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(vuln.status)}`}>
                          {vuln.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {vuln.affectedSystems.join(', ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {vuln.assignedTo}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 