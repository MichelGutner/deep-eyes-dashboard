import api from './api';

export interface OrgSettings {
  notifications: {
    email: boolean;
    slack: boolean;
    webhook: boolean;
    slackWebhook?: string;
    webhookUrl?: string;
  };
  security: {
    mfa: boolean;
    sessionTimeout: number;
    passwordPolicy: string;
    ipWhitelist: string[];
  };
  display: {
    theme: string;
    timezone: string;
    refreshInterval: number;
    dateFormat: string;
  };
}

export const fetchSettings = (): Promise<OrgSettings> => api.get('/settings').then(r => r.data);
export const updateSettings = (body: Partial<OrgSettings>): Promise<OrgSettings> => api.put('/settings', body).then(r => r.data);
