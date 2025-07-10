import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Activity } from 'lucide-react';

interface HealthData {
  uptime: string;
  memoryUsage: string;
  cpuUsage: string;
  diskUsage: string;
  databaseConnected: boolean;
  databaseLatency: number;
  apiUp: boolean;
  apiLatency: number;
  dependencies: Record<string, { message: string }>;
}

export const SystemHealth: React.FC = () => {
  const { t } = useTranslation();
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/health');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setHealthData(data);
             } catch (err) {
         setError(err instanceof Error ? err.message : 'Unknown error');
       } finally {
        setLoading(false);
      }
    };

    fetchHealthData();
    const interval = setInterval(fetchHealthData, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const exportHealthReport = () => {
    if (healthData) {
      const dataStr = JSON.stringify(healthData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'system_health_report.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (loading && !healthData) {
    return <div className="text-center py-8">{t('loading_health_data')}</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{t('error_loading_health_data')}: {error}</div>;
  }

  if (!healthData) {
    return <div className="text-center py-8">{t('no_health_data_available')}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('system_health')}</h2>
          <p className="text-gray-600 dark:text-gray-400">{t('system_health_subtitle')}</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={exportHealthReport}
            className="btn-secondary flex items-center space-x-2"
          >
            <Activity className="w-4 h-4" />
            <span>{t('export_report')}</span>
          </button>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('system_status')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('uptime')}</h4>
            <p className="text-gray-600 dark:text-gray-400">{healthData.uptime}</p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('memory_usage')}</h4>
            <p className="text-gray-600 dark:text-gray-400">{healthData.memoryUsage}</p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('cpu_usage')}</h4>
            <p className="text-gray-600 dark:text-gray-400">{healthData.cpuUsage}</p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('disk_usage')}</h4>
            <p className="text-gray-600 dark:text-gray-400">{healthData.diskUsage}</p>
          </div>
        </div>
      </div>

      {/* Database Status */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('database_status')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('database_connected')}</h4>
            <p className="text-gray-600 dark:text-gray-400">{healthData.databaseConnected ? t('yes') : t('no')}</p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('database_latency')}</h4>
            <p className="text-gray-600 dark:text-gray-400">{healthData.databaseLatency}ms</p>
          </div>
        </div>
      </div>

      {/* API Status */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('api_status')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('api_up')}</h4>
            <p className="text-gray-600 dark:text-gray-400">{healthData.apiUp ? t('yes') : t('no')}</p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('api_latency')}</h4>
            <p className="text-gray-600 dark:text-gray-400">{healthData.apiLatency}ms</p>
          </div>
        </div>
      </div>

      {/* Dependencies Status */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('dependencies_status')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {healthData.dependencies && Object.entries(healthData.dependencies).map(([name, status]) => (
            <div key={name} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{name}</h4>
              <p className="text-gray-600 dark:text-gray-400">{status.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 