import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, XCircle, Clock, Download } from 'lucide-react';
import api from '../services/api';

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  services: { elasticsearch: 'up' | 'down'; database: 'up' | 'down' };
  timestamp: string;
}

function formatUptime(seconds: number) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
}

function StatusDot({ up }: { up: boolean }) {
  return up
    ? <CheckCircle className="w-4 h-4 text-green-500" />
    : <XCircle className="w-4 h-4 text-red-500" />;
}

export const SystemHealth: React.FC = () => {
  const { data, isLoading, error, dataUpdatedAt } = useQuery<HealthResponse>({
    queryKey: ['health'],
    queryFn: () => api.get('/health').then(r => r.data),
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  const exportReport = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: 'health_report.json',
    });
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const overallColor =
    data?.status === 'healthy' ? 'text-green-600 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800' :
    data?.status === 'degraded' ? 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800' :
    'text-red-600 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800';

  if (isLoading && !data) {
    return <div className="flex items-center justify-center py-16 text-gray-400 text-sm">Checking health…</div>;
  }

  if (error && !data) {
    return (
      <div className="card text-center py-10">
        <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
        <p className="text-sm text-red-500">Backend unreachable</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-wide ${overallColor}`}>
            {data?.status ?? '—'}
          </span>
          {dataUpdatedAt > 0 && (
            <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Updated {new Date(dataUpdatedAt).toLocaleTimeString()}
            </span>
          )}
        </div>
        <button onClick={exportReport} className="btn-secondary text-xs flex items-center gap-1.5">
          <Download className="w-3.5 h-3.5" />
          Export
        </button>
      </div>

      {/* Service cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { label: 'Elasticsearch', key: 'elasticsearch' as const },
          { label: 'Database',      key: 'database' as const },
        ].map(({ label, key }) => {
          const up = data?.services[key] === 'up';
          return (
            <div key={key} className="card flex items-center gap-3">
              <StatusDot up={up} />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                <p className={`text-xs ${up ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                  {up ? 'Operational' : 'Down'}
                </p>
              </div>
            </div>
          );
        })}

        <div className="card flex items-center gap-3">
          <CheckCircle className="w-4 h-4 text-blue-500" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Backend API</p>
            <p className="text-xs text-blue-600 dark:text-blue-400">Operational</p>
          </div>
        </div>

        <div className="card flex items-center gap-3">
          <Clock className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Uptime</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {data ? formatUptime(data.uptime) : '—'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
