import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, AlertTriangle, CheckCircle, Clock, Mail, MessageSquare, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAlertRules, useAlerts, useUpdateAlert, useUpdateAlertRule } from '../hooks/useAlerts';

const SEV: Record<string, string> = {
  low:      'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  medium:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
  high:     'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
};

const STATUS: Record<string, string> = {
  active:       'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  acknowledged: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
  resolved:     'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
};

function relTime(iso: string) {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return `${Math.floor(d)}s ago`;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  return `${Math.floor(d / 3600)}h ago`;
}

export const AlertSystem: React.FC = () => {
  const { t } = useTranslation();
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSev, setFilterSev] = useState('all');

  const { data: alertsData, isLoading: loadingAlerts } = useAlerts();
  const { data: rulesData } = useAlertRules();
  const updateAlert = useUpdateAlert();
  const updateRule = useUpdateAlertRule();

  const alerts = alertsData?.alerts ?? [];
  const rules = rulesData?.rules ?? [];

  const active   = alerts.filter(a => a.status === 'active').length;
  const acked    = alerts.filter(a => a.status === 'acknowledged').length;
  const resolved = alerts.filter(a => a.status === 'resolved').length;
  const rulesOn  = rules.filter(r => r.enabled).length;

  const acknowledge = (id: string) => {
    updateAlert.mutate({ id, status: 'acknowledged' });
    toast.success(t('alert_acknowledged'));
  };
  const resolve = (id: string) => {
    updateAlert.mutate({ id, status: 'resolved' });
    toast.success(t('alert_resolved'));
  };
  const toggleRule = (id: string) => {
    const rule = rules.find(r => r.id === id);
    if (rule) updateRule.mutate({ id, enabled: !rule.enabled });
  };

  const filtered = alerts.filter(a => {
    if (filterStatus !== 'all' && a.status !== filterStatus) return false;
    if (filterSev !== 'all' && a.severity !== filterSev) return false;
    return true;
  });

  if (loadingAlerts && alerts.length === 0) {
    return <div className="flex items-center justify-center py-16 text-gray-400 text-sm">Loading alerts...</div>;
  }

  return (
    <div className="space-y-5">
      {/* Compact stats */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Active', value: active, icon: <AlertTriangle className="w-3.5 h-3.5" />, color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800' },
          { label: 'Acknowledged', value: acked, icon: <Clock className="w-3.5 h-3.5" />, color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800' },
          { label: 'Resolved', value: resolved, icon: <CheckCircle className="w-3.5 h-3.5" />, color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800' },
          { label: 'Rules active', value: rulesOn, icon: <Bell className="w-3.5 h-3.5" />, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800' },
        ].map(s => (
          <div key={s.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${s.color}`}>
            {s.icon}
            <span className="font-bold text-sm">{s.value}</span>
            <span className="opacity-75">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filters + list */}
      <div className="card space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="form-select text-xs py-1.5 px-2 h-8">
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </select>
          <select value={filterSev} onChange={e => setFilterSev(e.target.value)} className="form-select text-xs py-1.5 px-2 h-8">
            <option value="all">All severity</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">{filtered.length} alerts</span>
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center">No alerts found</p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filtered.map(alert => (
              <div key={alert.id} className="py-3 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${SEV[alert.severity]}`}>{alert.severity}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${STATUS[alert.status]}`}>{alert.status}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">{alert.source}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">{relTime(alert.created_at)}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{alert.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{alert.message}</p>
                  {alert.tags.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {alert.tags.map(t => <span key={t} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-[10px] rounded">{t}</span>)}
                    </div>
                  )}
                </div>
                <div className="flex gap-1.5 flex-shrink-0 mt-0.5">
                  {alert.status === 'active' && <>
                    <button onClick={() => acknowledge(alert.id)} className="btn-secondary text-xs px-2 py-1">Ack</button>
                    <button onClick={() => resolve(alert.id)} className="btn-primary text-xs px-2 py-1">Resolve</button>
                  </>}
                  {alert.status === 'acknowledged' && (
                    <button onClick={() => resolve(alert.id)} className="btn-primary text-xs px-2 py-1">Resolve</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rules table */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Alert Rules</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                {['Rule', 'Condition', 'Severity', 'Notifications', 'Enabled'].map(h => (
                  <th key={h} className="pb-2 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {rules.map(rule => (
                <tr key={rule.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="py-2.5 pr-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{rule.name}</td>
                  <td className="py-2.5 pr-4 text-gray-500 dark:text-gray-400 font-mono text-xs whitespace-nowrap">{rule.condition}</td>
                  <td className="py-2.5 pr-4">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${SEV[rule.severity]}`}>{rule.severity}</span>
                  </td>
                  <td className="py-2.5 pr-4">
                    <div className="flex gap-1.5">
                      {rule.notifications.email && <Mail className="w-3.5 h-3.5 text-gray-400" />}
                      {rule.notifications.slack && <MessageSquare className="w-3.5 h-3.5 text-gray-400" />}
                      {rule.notifications.webhook && <Settings className="w-3.5 h-3.5 text-gray-400" />}
                    </div>
                  </td>
                  <td className="py-2.5">
                    <button
                      onClick={() => toggleRule(rule.id)}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 border-2 border-transparent rounded-full cursor-pointer transition-colors ${rule.enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'}`}
                    >
                      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${rule.enabled ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
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
