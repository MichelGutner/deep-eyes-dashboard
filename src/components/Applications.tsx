import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Copy, Package, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Application {
  id: string;
  name: string;
  apiKey: string;
  environment: string;
  version?: string;
  created_at: string;
}

interface CreateAppDto {
  name: string;
  organization_id: string;
  environment: string;
  version?: string;
}

// DEFAULT_ORG_ID removed — now sourced from auth context inside CreateAppModal

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => toast.success('Copied!'));
}

function CodeBlock({ code, lang: _lang = 'bash' }: { code: string; lang?: string }) {
  return (
    <div className="relative group">
      <pre className="bg-gray-900 text-gray-100 text-xs rounded-lg p-4 overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
      <button
        onClick={() => copyToClipboard(code)}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-gray-700 hover:bg-gray-600 rounded text-gray-300"
      >
        <Copy className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function ApiKeyDisplay({ apiKey }: { apiKey: string }) {
  const [revealed, setRevealed] = useState(false);
  const masked = apiKey.slice(0, 8) + '••••••••••••••••' + apiKey.slice(-4);
  return (
    <div className="flex items-center gap-2">
      <code className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
        {revealed ? apiKey : masked}
      </code>
      <button onClick={() => setRevealed(v => !v)} className="text-xs text-blue-500 hover:underline">
        {revealed ? 'Hide' : 'Show'}
      </button>
      <button onClick={() => copyToClipboard(apiKey)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
        <Copy className="w-3.5 h-3.5 text-gray-400" />
      </button>
    </div>
  );
}

function IntegrationSnippets({ app }: { app: Application }) {
  const [tab, setTab] = useState<'rn' | 'web' | 'node' | 'curl'>('rn');

  const snippets = {
    rn: `// React Native — App.tsx
import { DeepEyesSDK } from '@deep-eyes/react-native';

DeepEyesSDK.init({
  apiKey: '${app.apiKey}',
  environment: '${app.environment}',
  release: '1.0.0',
});`,
    web: `// Web — index.ts
import { DeepEyes } from '@deep-eyes/web';

DeepEyes.init({
  apiKey: '${app.apiKey}',
  environment: '${app.environment}',
});`,
    node: `// Node.js
import { DeepEyes } from '@deep-eyes/node';

DeepEyes.init({
  apiKey: '${app.apiKey}',
  environment: '${app.environment}',
});`,
    curl: `curl -X POST http://localhost:3000/logs/batch \\
  -H "Content-Type: application/json" \\
  -d '{
    "apiKey": "${app.apiKey}",
    "batch": [{
      "message": "Test log",
      "level": "info",
      "platform": "other",
      "app": "${app.name}",
      "environment": "${app.environment}",
      "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
    }]
  }'`,
  };

  const tabs: { key: typeof tab; label: string }[] = [
    { key: 'rn', label: 'React Native' },
    { key: 'web', label: 'Web' },
    { key: 'node', label: 'Node.js' },
    { key: 'curl', label: 'cURL' },
  ];

  return (
    <div className="space-y-2">
      <div className="flex gap-1 flex-wrap">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
              tab === t.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <CodeBlock code={snippets[tab]} />
    </div>
  );
}

function CreateAppModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [env, setEnv] = useState('production');

  const mutation = useMutation({
    mutationFn: (dto: CreateAppDto) => api.post('/applications', dto).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Application created!');
      onClose();
    },
    onError: () => toast.error('Failed to create application'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">New Application</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="my-mobile-app"
              className="w-full form-input text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Environment</label>
            <select value={env} onChange={e => setEnv(e.target.value)} className="w-full form-select text-sm">
              <option value="production">production</option>
              <option value="staging">staging</option>
              <option value="development">development</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <button onClick={onClose} className="btn-secondary text-sm">Cancel</button>
          <button
            onClick={() => mutation.mutate({ name, organization_id: user?.organizationId ?? '', environment: env })}
            disabled={!name.trim() || mutation.isPending}
            className="btn-primary text-sm"
          >
            {mutation.isPending ? 'Creating…' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}

export const Applications: React.FC = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, isLoading } = useQuery<Application[]>({
    queryKey: ['applications'],
    queryFn: () => api.get('/applications').then(r => r.data),
    staleTime: 60_000,
  });

  const apps = data ?? [];

  return (
    <div className="space-y-5">
      {showCreate && <CreateAppModal onClose={() => setShowCreate(false)} />}

      {/* Actions row */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
            <span className="font-bold text-sm">{apps.length}</span>
            <span className="opacity-75">Applications</span>
          </div>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary text-xs flex items-center gap-1.5 py-1.5 px-3">
          <Plus className="w-3.5 h-3.5" />
          New app
        </button>
      </div>

      {/* Empty state */}
      {!isLoading && apps.length === 0 && (
        <div className="card text-center py-12 space-y-3">
          <Package className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No applications yet.</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary text-sm mx-auto">
            Create your first app
          </button>
        </div>
      )}

      {/* App list */}
      <div className="space-y-3">
        {isLoading && apps.length === 0 && (
          <div className="text-sm text-gray-400 py-8 text-center">Loading…</div>
        )}
        {apps.map(app => (
          <div key={app.id} className="card space-y-3">
            {/* App header */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-gray-900 dark:text-white">{app.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded font-medium text-gray-500 dark:text-gray-400 uppercase">
                    {app.environment}
                  </span>
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" aria-label="Active" />
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  Created {new Date(app.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setExpanded(expanded === app.id ? null : app.id)}
                className="btn-secondary text-xs flex-shrink-0"
              >
                {expanded === app.id ? 'Hide setup' : 'Setup'}
              </button>
            </div>

            {/* API Key */}
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">API Key</p>
              <ApiKeyDisplay apiKey={app.apiKey} />
            </div>

            {/* Integration snippets */}
            {expanded === app.id && (
              <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Integration</p>
                <IntegrationSnippets app={app} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
