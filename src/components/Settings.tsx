import React, { useState } from 'react';
import { useSettings, useUpdateOrgSettings } from '../hooks/useSettings';
import { Settings, Save, RefreshCw, Bell, Eye, Shield, Database, Download, Upload, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface NotificationSettings {
  email: boolean; slack: boolean; webhook: boolean;
  criticalAlerts: boolean; warningAlerts: boolean; infoAlerts: boolean;
}

interface SecuritySettings {
  mfaEnabled: boolean; sessionTimeout: number;
  passwordPolicy: { minLength: number; requireUppercase: boolean; requireLowercase: boolean; requireNumbers: boolean; requireSpecialChars: boolean };
  ipWhitelist: string[];
}

const TABS = [
  { id: 'general',       label: 'General',       icon: Settings  },
  { id: 'notifications', label: 'Notifications',  icon: Bell      },
  { id: 'security',      label: 'Security',       icon: Shield    },
  { id: 'display',       label: 'Display',        icon: Eye       },
  { id: 'data',          label: 'Data & Export',  icon: Database  },
];

const LANGUAGES = [
  { code: 'en', label: 'English'    },
  { code: 'pt', label: 'Português'  },
  { code: 'es', label: 'Español'    },
  { code: 'fr', label: 'Français'   },
  { code: 'de', label: 'Deutsch'    },
  { code: 'it', label: 'Italiano'   },
  { code: 'ja', label: '日本語'       },
  { code: 'zh', label: '中文'         },
  { code: 'ru', label: 'Русский'    },
  { code: 'ar', label: 'العربية'   },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ${
        checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-1'}`} />
    </button>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-gray-700/60 last:border-0">
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      <div className="ml-4 flex-shrink-0">{children}</div>
    </div>
  );
}

export const SettingsComponent: React.FC = () => {
  const { display, general, updateDisplay, updateGeneral } = useSettings();
  const updateOrgSettings = useUpdateOrgSettings();
  const { i18n, t } = useTranslation();
  const [activeTab, setActiveTab] = useState('general');

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true, slack: false, webhook: false,
    criticalAlerts: true, warningAlerts: true, infoAlerts: false,
  });

  const [security, setSecurity] = useState<SecuritySettings>({
    mfaEnabled: true, sessionTimeout: 30,
    passwordPolicy: { minLength: 8, requireUppercase: true, requireLowercase: true, requireNumbers: true, requireSpecialChars: true },
    ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8'],
  });

  const [dashboardName, setDashboardName] = useState(general.dashboardName);
  const [newIp, setNewIp] = useState('');

  const saveSettings = () => {
    updateGeneral({ dashboardName });
    updateOrgSettings.mutate(
      {
        notifications: { email: notifications.email, slack: notifications.slack, webhook: notifications.webhook },
        security: {
          mfa: security.mfaEnabled,
          sessionTimeout: security.sessionTimeout,
          passwordPolicy: security.passwordPolicy.minLength >= 12 ? 'strong' : 'standard',
          ipWhitelist: security.ipWhitelist,
        },
      },
      {
        onSuccess: () => toast.success('Settings saved!'),
        onError:   () => toast.error('Failed to save settings'),
      },
    );
  };

  const resetSettings = () => {
    if (confirm('Reset all settings to default?')) toast.success('Settings reset to default!');
  };

  const exportSettings = () => {
    const blob = new Blob([JSON.stringify({ notifications, security, display }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'deep-eyes-settings.json'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Settings exported!');
  };

  const importSettings = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const s = JSON.parse(ev.target?.result as string);
        if (s.display) updateDisplay(s.display);
        if (s.general) { updateGeneral(s.general); setDashboardName(s.general.dashboardName); }
        toast.success('Settings imported!');
      } catch { toast.error('Invalid settings file!'); }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-5">
      {/* Tab bar + actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg flex-wrap">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 ml-auto">
          <button onClick={resetSettings} className="btn-secondary flex items-center gap-1.5 text-xs py-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            Reset
          </button>
          <button onClick={saveSettings} className="btn-primary flex items-center gap-1.5 text-xs py-1.5">
            <Save className="w-3.5 h-3.5" />
            Save
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="card space-y-4">
        {activeTab === 'general' && (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">General</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Dashboard Name</label>
                <input
                  type="text" value={dashboardName} onChange={e => setDashboardName(e.target.value)}
                  className="w-full form-input text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Timezone</label>
                <select value={display.timezone} onChange={e => updateDisplay({ timezone: e.target.value })} className="w-full form-select text-sm">
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{t('language')}</label>
                <select value={i18n.language} onChange={e => i18n.changeLanguage(e.target.value)} className="w-full form-select text-sm">
                  {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Date Format</label>
                <select value={display.dateFormat} onChange={e => updateDisplay({ dateFormat: e.target.value })} className="w-full form-select text-sm">
                  <option value="MMM dd, yyyy HH:mm:ss">Dec 25, 2023 14:30:45</option>
                  <option value="dd/MM/yyyy HH:mm:ss">25/12/2023 14:30:45</option>
                  <option value="yyyy-MM-dd HH:mm:ss">2023-12-25 14:30:45</option>
                  <option value="MM/dd/yyyy h:mm a">12/25/2023 2:30 PM</option>
                </select>
              </div>
            </div>
          </>
        )}

        {activeTab === 'notifications' && (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Notification Channels</p>
            <Row label="Email"><Toggle checked={notifications.email} onChange={v => setNotifications(n => ({ ...n, email: v }))} /></Row>
            <Row label="Slack"><Toggle checked={notifications.slack} onChange={v => setNotifications(n => ({ ...n, slack: v }))} /></Row>
            <Row label="Webhook"><Toggle checked={notifications.webhook} onChange={v => setNotifications(n => ({ ...n, webhook: v }))} /></Row>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 pt-2">Alert Types</p>
            <Row label="Critical Alerts"><Toggle checked={notifications.criticalAlerts} onChange={v => setNotifications(n => ({ ...n, criticalAlerts: v }))} /></Row>
            <Row label="Warning Alerts"><Toggle checked={notifications.warningAlerts} onChange={v => setNotifications(n => ({ ...n, warningAlerts: v }))} /></Row>
            <Row label="Info Alerts"><Toggle checked={notifications.infoAlerts} onChange={v => setNotifications(n => ({ ...n, infoAlerts: v }))} /></Row>
          </>
        )}

        {activeTab === 'security' && (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Authentication</p>
            <Row label="Multi-Factor Authentication">
              <Toggle checked={security.mfaEnabled} onChange={v => setSecurity(s => ({ ...s, mfaEnabled: v }))} />
            </Row>
            <Row label="Session Timeout (minutes)">
              <input
                type="number" value={security.sessionTimeout} min={5} max={480}
                onChange={e => setSecurity(s => ({ ...s, sessionTimeout: +e.target.value }))}
                className="form-input text-sm w-20 text-right"
              />
            </Row>

            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 pt-2">Password Policy</p>
            <Row label="Minimum Length">
              <input
                type="number" value={security.passwordPolicy.minLength} min={6} max={20}
                onChange={e => setSecurity(s => ({ ...s, passwordPolicy: { ...s.passwordPolicy, minLength: +e.target.value } }))}
                className="form-input text-sm w-20 text-right"
              />
            </Row>
            {[
              { key: 'requireUppercase', label: 'Require Uppercase' },
              { key: 'requireLowercase', label: 'Require Lowercase' },
              { key: 'requireNumbers',   label: 'Require Numbers'   },
              { key: 'requireSpecialChars', label: 'Require Special Characters' },
            ].map(({ key, label }) => (
              <Row key={key} label={label}>
                <Toggle
                  checked={security.passwordPolicy[key as keyof typeof security.passwordPolicy] as boolean}
                  onChange={v => setSecurity(s => ({ ...s, passwordPolicy: { ...s.passwordPolicy, [key]: v } }))}
                />
              </Row>
            ))}

            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 pt-2">IP Whitelist</p>
            <div className="flex gap-2">
              <input
                type="text" value={newIp} onChange={e => setNewIp(e.target.value)}
                placeholder="192.168.1.0/24"
                className="flex-1 form-input text-sm"
                onKeyDown={e => { if (e.key === 'Enter') { setSecurity(s => ({ ...s, ipWhitelist: [...s.ipWhitelist, newIp.trim()] })); setNewIp(''); } }}
              />
              <button onClick={() => { if (newIp.trim()) { setSecurity(s => ({ ...s, ipWhitelist: [...s.ipWhitelist, newIp.trim()] })); setNewIp(''); } }} className="btn-primary text-xs flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" />Add
              </button>
            </div>
            <div className="space-y-1.5">
              {security.ipWhitelist.map(ip => (
                <div key={ip} className="flex items-center justify-between px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <code className="text-xs text-gray-700 dark:text-gray-300 font-mono">{ip}</code>
                  <button onClick={() => setSecurity(s => ({ ...s, ipWhitelist: s.ipWhitelist.filter(a => a !== ip) }))} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'display' && (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Display</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Theme</label>
                <select value={display.theme} onChange={e => updateDisplay({ theme: e.target.value as 'light' | 'dark' | 'auto' })} className="w-full form-select text-sm">
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto (System)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Auto Refresh Interval</label>
                <select value={display.refreshInterval} onChange={e => updateDisplay({ refreshInterval: +e.target.value })} className="w-full form-select text-sm">
                  <option value={5}>5 seconds</option>
                  <option value={15}>15 seconds</option>
                  <option value={30}>30 seconds</option>
                  <option value={60}>1 minute</option>
                  <option value={300}>5 minutes</option>
                </select>
              </div>
            </div>
          </>
        )}

        {activeTab === 'data' && (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Export / Import</p>
            <div className="flex gap-2 flex-wrap">
              <button onClick={exportSettings} className="btn-secondary flex items-center gap-1.5 text-xs">
                <Download className="w-3.5 h-3.5" />Export Settings
              </button>
              <label className="btn-secondary flex items-center gap-1.5 text-xs cursor-pointer">
                <Upload className="w-3.5 h-3.5" />Import Settings
                <input type="file" accept=".json" onChange={importSettings} className="hidden" />
              </label>
            </div>

            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 pt-2">Data Retention</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Log Retention (days)</label>
                <input type="number" defaultValue="30" min={1} max={365} className="w-full form-input text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Metrics Retention (days)</label>
                <input type="number" defaultValue="90" min={1} max={365} className="w-full form-input text-sm" />
              </div>
            </div>

            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 pt-2">Cleanup</p>
            <div className="flex gap-2 flex-wrap">
              <button className="btn-secondary flex items-center gap-1.5 text-xs">
                <Trash2 className="w-3.5 h-3.5" />Clean Old Logs
              </button>
              <button className="btn-secondary flex items-center gap-1.5 text-xs">
                <Trash2 className="w-3.5 h-3.5" />Clean Old Metrics
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
