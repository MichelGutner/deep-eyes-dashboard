import React, { useState } from 'react';
import { useSettings } from '../hooks/useSettings';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Bell, 
  Eye, 
  Shield, 
  Database, 
  Download,
  Upload,
  Trash2,
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface NotificationSettings {
  email: boolean;
  slack: boolean;
  webhook: boolean;
  criticalAlerts: boolean;
  warningAlerts: boolean;
  infoAlerts: boolean;
}

interface SecuritySettings {
  mfaEnabled: boolean;
  sessionTimeout: number;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
  ipWhitelist: string[];
}



export const SettingsComponent: React.FC = () => {
  const { display, general, updateDisplay, updateGeneral } = useSettings();
  const { i18n, t } = useTranslation();
  const [activeTab, setActiveTab] = useState('general');
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    slack: false,
    webhook: false,
    criticalAlerts: true,
    warningAlerts: true,
    infoAlerts: false
  });
  
  const [security, setSecurity] = useState<SecuritySettings>({
    mfaEnabled: true,
    sessionTimeout: 30,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true
    },
    ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8']
  });

  const [dashboardName, setDashboardName] = useState(general.dashboardName);
  const [newIpAddress, setNewIpAddress] = useState('');

  const saveSettings = () => {
    updateGeneral({ dashboardName });
    toast.success('Settings saved successfully!');
  };

  const resetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      toast.success('Settings reset to default!');
    }
  };

  const addIpAddress = () => {
    if (newIpAddress.trim()) {
      setSecurity(prev => ({
        ...prev,
        ipWhitelist: [...prev.ipWhitelist, newIpAddress.trim()]
      }));
      setNewIpAddress('');
      toast.success('IP address added to whitelist!');
    }
  };

  const removeIpAddress = (ip: string) => {
    setSecurity(prev => ({
      ...prev,
      ipWhitelist: prev.ipWhitelist.filter(addr => addr !== ip)
    }));
    toast.success('IP address removed from whitelist!');
  };

  const exportSettings = () => {
    const settings = { notifications, security, display };
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'deep-eyes-settings.json';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Settings exported successfully!');
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string);
          // Apply imported settings
          if (importedSettings.display) {
            updateDisplay(importedSettings.display);
          }
          if (importedSettings.general) {
            updateGeneral(importedSettings.general);
            setDashboardName(importedSettings.general.dashboardName);
          }
          toast.success('Settings imported successfully!');
        } catch {
          toast.error('Invalid settings file!');
        }
      };
      reader.readAsText(file);
    }
  };

  const settingsTabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'display', label: 'Display', icon: Eye },
    { id: 'data', label: 'Data & Export', icon: Database }
  ];

  const languageOptions = [
    { code: 'en', label: 'English' },
    { code: 'pt', label: 'Português' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' },
    { code: 'de', label: 'Deutsch' },
    { code: 'it', label: 'Italiano' },
    { code: 'ja', label: '日本語' },
    { code: 'ko', label: '한국어' },
    { code: 'zh', label: '中文' },
    { code: 'ru', label: 'Русский' },
    { code: 'ar', label: 'العربية' },
    { code: 'hi', label: 'हिन्दी' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white dark:text-white dark:text-white">Settings</h2>
          <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">Configure your DeepEyes Dashboard preferences</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={resetSettings}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset</span>
          </button>
          <button
            onClick={saveSettings}
            className="btn-primary flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Settings Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 dark:bg-gray-700 p-1 rounded-lg">
        {settingsTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white dark:text-white dark:hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Settings Content */}
      <div className="card">
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('settings')} - {t('general')}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dashboard Name
                </label>
                <input
                  type="text"
                  value={dashboardName}
                  onChange={(e) => setDashboardName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 dark:bg-gray-700 text-gray-900 dark:text-white dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Timezone
                </label>
                <select
                  value={display.timezone}
                  onChange={(e) => updateDisplay({ timezone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 dark:bg-gray-700 text-gray-900 dark:text-white dark:text-white"
                >
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('language')}
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={i18n.language}
                  onChange={e => i18n.changeLanguage(e.target.value)}
                >
                  {languageOptions.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date Format
                </label>
                <select
                  value={display.dateFormat}
                  onChange={(e) => updateDisplay({ dateFormat: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 dark:bg-gray-700 text-gray-900 dark:text-white dark:text-white"
                >
                  <option value="MMM dd, yyyy HH:mm:ss">Dec 25, 2023 14:30:45</option>
                  <option value="dd/MM/yyyy HH:mm:ss">25/12/2023 14:30:45</option>
                  <option value="yyyy-MM-dd HH:mm:ss">2023-12-25 14:30:45</option>
                  <option value="MM/dd/yyyy h:mm a">12/25/2023 2:30 PM</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white dark:text-white dark:text-white">Notification Settings</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-3">Notification Channels</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notifications.email}
                      onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                      className="rounded border-gray-300 dark:border-gray-600 dark:border-gray-600 text-primary-600 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:bg-gray-700"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 dark:text-gray-300">Email Notifications</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notifications.slack}
                      onChange={(e) => setNotifications({ ...notifications, slack: e.target.checked })}
                      className="rounded border-gray-300 dark:border-gray-600 dark:border-gray-600 text-primary-600 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:bg-gray-700"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 dark:text-gray-300">Slack Notifications</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notifications.webhook}
                      onChange={(e) => setNotifications({ ...notifications, webhook: e.target.checked })}
                      className="rounded border-gray-300 dark:border-gray-600 dark:border-gray-600 text-primary-600 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:bg-gray-700"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 dark:text-gray-300">Webhook Notifications</span>
                  </label>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Alert Types</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notifications.criticalAlerts}
                      onChange={(e) => setNotifications({ ...notifications, criticalAlerts: e.target.checked })}
                      className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Critical Alerts</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notifications.warningAlerts}
                      onChange={(e) => setNotifications({ ...notifications, warningAlerts: e.target.checked })}
                      className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Warning Alerts</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notifications.infoAlerts}
                      onChange={(e) => setNotifications({ ...notifications, infoAlerts: e.target.checked })}
                      className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Info Alerts</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white dark:text-white">Security Settings</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Authentication</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={security.mfaEnabled}
                      onChange={(e) => setSecurity({ ...security, mfaEnabled: e.target.checked })}
                      className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Enable Multi-Factor Authentication</span>
                  </label>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      value={security.sessionTimeout}
                      onChange={(e) => setSecurity({ ...security, sessionTimeout: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      min="5"
                      max="480"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Password Policy</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Minimum Length
                    </label>
                    <input
                      type="number"
                      value={security.passwordPolicy.minLength}
                      onChange={(e) => setSecurity({
                        ...security,
                        passwordPolicy: { ...security.passwordPolicy, minLength: Number(e.target.value) }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      min="6"
                      max="20"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={security.passwordPolicy.requireUppercase}
                        onChange={(e) => setSecurity({
                          ...security,
                          passwordPolicy: { ...security.passwordPolicy, requireUppercase: e.target.checked }
                        })}
                        className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Require Uppercase</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={security.passwordPolicy.requireLowercase}
                        onChange={(e) => setSecurity({
                          ...security,
                          passwordPolicy: { ...security.passwordPolicy, requireLowercase: e.target.checked }
                        })}
                        className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Require Lowercase</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={security.passwordPolicy.requireNumbers}
                        onChange={(e) => setSecurity({
                          ...security,
                          passwordPolicy: { ...security.passwordPolicy, requireNumbers: e.target.checked }
                        })}
                        className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Require Numbers</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={security.passwordPolicy.requireSpecialChars}
                        onChange={(e) => setSecurity({
                          ...security,
                          passwordPolicy: { ...security.passwordPolicy, requireSpecialChars: e.target.checked }
                        })}
                        className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Require Special Characters</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">IP Whitelist</h4>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newIpAddress}
                      onChange={(e) => setNewIpAddress(e.target.value)}
                      placeholder="Enter IP address or CIDR (e.g., 192.168.1.0/24)"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <button
                      onClick={addIpAddress}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {security.ipWhitelist.map((ip, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{ip}</span>
                        <button
                          onClick={() => removeIpAddress(ip)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'display' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white dark:text-white">Display Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-2">
                  Theme
                </label>
                <select
                  value={display.theme}
                  onChange={(e) => updateDisplay({ theme: e.target.value as 'light' | 'dark' | 'auto' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 dark:bg-gray-700 text-gray-900 dark:text-white dark:text-white"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto (System)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-2">
                  Auto Refresh Interval (seconds)
                </label>
                <select
                  value={display.refreshInterval}
                  onChange={(e) => updateDisplay({ refreshInterval: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 dark:bg-gray-700 text-gray-900 dark:text-white dark:text-white"
                >
                  <option value={5}>5 seconds</option>
                  <option value={15}>15 seconds</option>
                  <option value={30}>30 seconds</option>
                  <option value={60}>1 minute</option>
                  <option value={300}>5 minutes</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white dark:text-white">Data & Export</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Export Settings</h4>
                <div className="flex space-x-4">
                  <button
                    onClick={exportSettings}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Settings</span>
                  </button>
                  
                  <label className="btn-secondary flex items-center space-x-2 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>Import Settings</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={importSettings}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Data Retention</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Log Retention (days)
                    </label>
                    <input
                      type="number"
                      defaultValue="30"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      min="1"
                      max="365"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Metrics Retention (days)
                    </label>
                    <input
                      type="number"
                      defaultValue="90"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      min="1"
                      max="365"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Data Cleanup</h4>
                <div className="space-y-3">
                  <button className="btn-secondary flex items-center space-x-2">
                    <Trash2 className="w-4 h-4" />
                    <span>Clean Old Logs</span>
                  </button>
                  
                  <button className="btn-secondary flex items-center space-x-2">
                    <Trash2 className="w-4 h-4" />
                    <span>Clean Old Metrics</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 