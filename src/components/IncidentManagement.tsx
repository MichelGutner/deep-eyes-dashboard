import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Users,
  MessageSquare,
  FileText,
  Download,
  Zap,
  Shield,
  Activity,
  Info,
  Edit,
  Slack,
  Phone,
  Mail
} from 'lucide-react';

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'mitigated' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  type: 'performance' | 'security' | 'availability' | 'data' | 'infrastructure';
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  assignee?: string;
  reporter: string;
  affectedServices: string[];
  impact: string;
  rootCause?: string;
  resolution?: string;
  tags: string[];
  attachments: string[];
  timeline: IncidentEvent[];
  runbook?: string;
  automationStatus: 'manual' | 'automated' | 'semi_automated';
}

interface IncidentEvent {
  id: string;
  timestamp: string;
  type: 'created' | 'updated' | 'assigned' | 'status_changed' | 'comment' | 'automation';
  user: string;
  description: string;
  metadata?: Record<string, any>;
}

interface Runbook {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: RunbookStep[];
  estimatedTime: number;
  requiredRoles: string[];
  automationLevel: 'manual' | 'automated' | 'semi_automated';
  lastUpdated: string;
  version: string;
}

interface RunbookStep {
  id: string;
  title: string;
  description: string;
  type: 'manual' | 'automated' | 'decision';
  estimatedTime: number;
  requiredInputs?: string[];
  outputs?: string[];
  automationScript?: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  status: 'online' | 'offline' | 'busy' | 'away';
  skills: string[];
  currentIncidents: string[];
}

export const IncidentManagement: React.FC = () => {
  const { t } = useTranslation();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [runbooks, setRunbooks] = useState<Runbook[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    severity: 'all',
    type: 'all',
    assignee: 'all'
  });

  // Mock data for demonstration
  const mockIncidents: Incident[] = [
    {
      id: 'INC-001',
      title: 'High CPU usage causing service degradation',
      description: 'User service experiencing high CPU usage leading to increased response times and timeouts',
      severity: 'high',
      status: 'investigating',
      priority: 'high',
      type: 'performance',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T11:45:00Z',
      reporter: 'john.doe@company.com',
      assignee: 'sarah.smith@company.com',
      affectedServices: ['user-service', 'auth-service'],
      impact: 'Users experiencing 5-10 second response times',
      tags: ['performance', 'cpu', 'response-time'],
      attachments: ['cpu-metrics.png', 'error-logs.txt'],
      automationStatus: 'semi_automated',
      timeline: [
        {
          id: '1',
          timestamp: '2024-01-15T10:30:00Z',
          type: 'created',
          user: 'john.doe@company.com',
          description: 'Incident created'
        },
        {
          id: '2',
          timestamp: '2024-01-15T10:35:00Z',
          type: 'assigned',
          user: 'sarah.smith@company.com',
          description: 'Assigned to Sarah Smith'
        },
        {
          id: '3',
          timestamp: '2024-01-15T11:00:00Z',
          type: 'status_changed',
          user: 'sarah.smith@company.com',
          description: 'Status changed to investigating'
        },
        {
          id: '4',
          timestamp: '2024-01-15T11:45:00Z',
          type: 'comment',
          user: 'sarah.smith@company.com',
          description: 'Identified memory leak in user service. Restarting pods to mitigate.'
        }
      ]
    },
    {
      id: 'INC-002',
      title: 'Database connection pool exhaustion',
      description: 'Payment service unable to process transactions due to database connection pool exhaustion',
      severity: 'critical',
      status: 'mitigated',
      priority: 'urgent',
      type: 'availability',
      createdAt: '2024-01-15T09:15:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      resolvedAt: '2024-01-15T10:00:00Z',
      reporter: 'system@company.com',
      assignee: 'mike.johnson@company.com',
      affectedServices: ['payment-service', 'database'],
      impact: 'Payment processing completely down',
      rootCause: 'Connection pool not properly configured for high load',
      resolution: 'Increased connection pool size and added connection monitoring',
      tags: ['database', 'connection-pool', 'payment'],
      attachments: ['db-metrics.png', 'config-changes.txt'],
      automationStatus: 'automated',
      timeline: [
        {
          id: '1',
          timestamp: '2024-01-15T09:15:00Z',
          type: 'created',
          user: 'system@company.com',
          description: 'Automated incident created'
        },
        {
          id: '2',
          timestamp: '2024-01-15T09:20:00Z',
          type: 'automation',
          user: 'system@company.com',
          description: 'Automated mitigation: Increased connection pool size'
        },
        {
          id: '3',
          timestamp: '2024-01-15T09:25:00Z',
          type: 'assigned',
          user: 'mike.johnson@company.com',
          description: 'Assigned to Mike Johnson'
        },
        {
          id: '4',
          timestamp: '2024-01-15T10:00:00Z',
          type: 'status_changed',
          user: 'mike.johnson@company.com',
          description: 'Status changed to resolved'
        }
      ]
    }
  ];

  const mockRunbooks: Runbook[] = [
    {
      id: 'RB-001',
      name: 'High CPU Usage Response',
      description: 'Standard response procedure for high CPU usage incidents',
      category: 'performance',
      estimatedTime: 30,
      requiredRoles: ['sre', 'devops'],
      automationLevel: 'semi_automated',
      lastUpdated: '2024-01-10T15:30:00Z',
      version: '2.1',
      steps: [
        {
          id: '1',
          title: 'Assess CPU usage',
          description: 'Check CPU usage across all pods and nodes',
          type: 'automated',
          estimatedTime: 2,
          outputs: ['cpu-metrics-report']
        },
        {
          id: '2',
          title: 'Identify resource-intensive processes',
          description: 'Analyze which processes are consuming the most CPU',
          type: 'manual',
          estimatedTime: 5,
          requiredInputs: ['cpu-metrics-report']
        },
        {
          id: '3',
          title: 'Scale resources if needed',
          description: 'Scale up CPU resources or add more replicas',
          type: 'automated',
          estimatedTime: 3,
          requiredInputs: ['scale-factor']
        }
      ]
    }
  ];

  const mockTeamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Sarah Smith',
      role: 'Senior SRE',
      email: 'sarah.smith@company.com',
      phone: '+1-555-0123',
      status: 'online',
      skills: ['kubernetes', 'docker', 'monitoring', 'incident-response'],
      currentIncidents: ['INC-001']
    },
    {
      id: '2',
      name: 'Mike Johnson',
      role: 'DevOps Engineer',
      email: 'mike.johnson@company.com',
      phone: '+1-555-0124',
      status: 'busy',
      skills: ['database', 'automation', 'security'],
      currentIncidents: ['INC-002']
    }
  ];

  useEffect(() => {
    setIncidents(mockIncidents);
    setRunbooks(mockRunbooks);
    setTeamMembers(mockTeamMembers);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400';
      case 'investigating': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400';
      case 'mitigated': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-400';
      case 'resolved': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400';
      case 'closed': return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertTriangle className="w-4 h-4" />;
      case 'investigating': return <Clock className="w-4 h-4" />;
      case 'mitigated': return <Shield className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <XCircle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getAutomationIcon = (status: string) => {
    switch (status) {
      case 'automated': return <Zap className="w-4 h-4 text-green-600" />;
      case 'semi_automated': return <Activity className="w-4 h-4 text-yellow-600" />;
      case 'manual': return <User className="w-4 h-4 text-blue-600" />;
      default: return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    if (filters.status !== 'all' && incident.status !== filters.status) return false;
    if (filters.severity !== 'all' && incident.severity !== filters.severity) return false;
    if (filters.type !== 'all' && incident.type !== filters.type) return false;
    if (filters.assignee !== 'all' && incident.assignee !== filters.assignee) return false;
    return true;
  });

  const getIncidentDuration = (incident: Incident) => {
    const start = new Date(incident.createdAt);
    const end = incident.resolvedAt ? new Date(incident.resolvedAt) : new Date();
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('incident_management')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('incident_management_subtitle')}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="btn-secondary">
            <Download className="w-4 h-4" />
            {t('export_report')}
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
                {t('active_incidents')}
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {incidents.filter(i => ['open', 'investigating', 'mitigated'].includes(i.status)).length}
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
                {incidents.filter(i => i.status === 'resolved' && new Date(i.resolvedAt!).toDateString() === new Date().toDateString()).length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('avg_resolution_time')}
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                2.5h
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('team_online')}
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {teamMembers.filter(m => m.status === 'online').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="form-select"
          >
            <option value="all">{t('all_status')}</option>
            <option value="open">{t('open')}</option>
            <option value="investigating">{t('investigating')}</option>
            <option value="mitigated">{t('mitigated')}</option>
            <option value="resolved">{t('resolved')}</option>
            <option value="closed">{t('closed')}</option>
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
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="form-select"
          >
            <option value="all">{t('all_types')}</option>
            <option value="performance">{t('performance')}</option>
            <option value="security">{t('security')}</option>
            <option value="availability">{t('availability')}</option>
            <option value="data">{t('data')}</option>
            <option value="infrastructure">{t('infrastructure')}</option>
          </select>

          <select
            value={filters.assignee}
            onChange={(e) => setFilters({ ...filters, assignee: e.target.value })}
            className="form-select"
          >
            <option value="all">{t('all_assignees')}</option>
            {teamMembers.map(member => (
              <option key={member.id} value={member.email}>{member.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Incident List */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {t('incidents')}
        </h3>
        <div className="space-y-4">
          {filteredIncidents.map((incident) => (
            <div
              key={incident.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedIncident?.id === incident.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => setSelectedIncident(incident)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {incident.id} - {incident.title}
                    </h4>
                    {getAutomationIcon(incident.automationStatus)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {incident.description}
                  </p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      {t('reporter')}: {incident.reporter}
                    </span>
                    {incident.assignee && (
                      <span className="text-gray-500 dark:text-gray-400">
                        {t('assignee')}: {incident.assignee}
                      </span>
                    )}
                    <span className="text-gray-500 dark:text-gray-400">
                      {t('created')}: {new Date(incident.createdAt).toLocaleString()}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {t('duration')}: {getIncidentDuration(incident)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                    {incident.severity.toUpperCase()}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                    {getStatusIcon(incident.status)}
                    <span className="ml-1 capitalize">{incident.status}</span>
                  </span>
                </div>
              </div>
              
              <div className="mt-3 flex flex-wrap gap-2">
                {incident.tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Incident Details */}
      {selectedIncident && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t('incident_details')}
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    {t('description')}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">{selectedIncident.description}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    {t('impact')}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">{selectedIncident.impact}</p>
                </div>

                {selectedIncident.rootCause && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      {t('root_cause')}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedIncident.rootCause}</p>
                  </div>
                )}

                {selectedIncident.resolution && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      {t('resolution')}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedIncident.resolution}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    {t('affected_services')}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedIncident.affectedServices.map((service) => (
                      <span key={service} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded text-sm">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t('timeline')}
              </h3>
              <div className="space-y-4">
                {selectedIncident.timeline.map((event) => (
                  <div key={event.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {event.user}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {event.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t('quick_actions')}
              </h3>
              <div className="space-y-2">
                <button className="w-full btn-secondary text-left">
                  <Edit className="w-4 h-4 mr-2" />
                  {t('update_status')}
                </button>
                <button className="w-full btn-secondary text-left">
                  <User className="w-4 h-4 mr-2" />
                  {t('reassign')}
                </button>
                <button className="w-full btn-secondary text-left">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {t('add_comment')}
                </button>
                <button className="w-full btn-secondary text-left">
                  <FileText className="w-4 h-4 mr-2" />
                  {t('attach_file')}
                </button>
              </div>
            </div>

            {/* Team Status */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t('team_status')}
              </h3>
              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        member.status === 'online' ? 'bg-green-500' :
                        member.status === 'busy' ? 'bg-yellow-500' :
                        member.status === 'away' ? 'bg-orange-500' : 'bg-gray-500'
                      }`}></div>
                      <span className="text-sm text-gray-900 dark:text-white">{member.name}</span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {member.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Runbooks */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t('available_runbooks')}
              </h3>
              <div className="space-y-2">
                {runbooks.map((runbook) => (
                  <button key={runbook.id} className="w-full text-left p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="font-medium text-gray-900 dark:text-white">{runbook.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{runbook.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Collaboration */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {t('team_collaboration')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Slack className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-gray-900 dark:text-white">Slack</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('slack_integration_active')}
            </p>
          </div>
          
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Phone className="w-5 h-5 text-green-600" />
              <span className="font-medium text-gray-900 dark:text-white">Phone</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('emergency_contacts_ready')}
            </p>
          </div>
          
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Mail className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900 dark:text-white">Email</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('notifications_enabled')}
            </p>
          </div>
          
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              <span className="font-medium text-gray-900 dark:text-white">Automation</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('automation_active')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 