import {
  Activity,
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Bell,
  Brain,
  Grid,
  Layers,
  MessageSquare,
  Moon,
  Network,
  RefreshCw,
  Search,
  Server,
  Settings,
  Shield,
  Sun,
  Target,
  TrendingUp,
  User,
  Users,
  Zap
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useSettings } from '../hooks/useSettings';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  category: 'navigation' | 'action';
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onRefresh: () => void;
}

function fuzzyMatch(text: string, query: string): boolean {
  if (!query) return true;
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  let qi = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) qi++;
  }
  return qi === q.length;
}

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  const idx = lower.indexOf(q);
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <span className="text-blue-600 dark:text-blue-400 font-semibold">{text.slice(idx, idx + q.length)}</span>
      {text.slice(idx + q.length)}
    </>
  );
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onRefresh,
}) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const { display, updateDisplay } = useSettings();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const allItems: CommandItem[] = [
    // Navigation
    { id: 'overview', label: 'Dashboard', description: 'Visão geral do sistema', icon: <BarChart3 className="w-4 h-4" />, category: 'navigation', action: () => { onNavigate('overview'); onClose(); } },
    { id: 'logs', label: 'Logs', description: 'Visualizar e filtrar logs', icon: <Layers className="w-4 h-4" />, category: 'navigation', action: () => { onNavigate('logs'); onClose(); } },
    { id: 'errors', label: 'Erros', description: 'Distribuição e tendências de erros', icon: <AlertTriangle className="w-4 h-4" />, category: 'navigation', action: () => { onNavigate('errors'); onClose(); } },
    { id: 'performance', label: 'Performance', description: 'Métricas de performance e APDEX', icon: <TrendingUp className="w-4 h-4" />, category: 'navigation', action: () => { onNavigate('performance'); onClose(); } },
    { id: 'apm', label: 'APM', description: 'Application Performance Monitoring', icon: <Zap className="w-4 h-4" />, category: 'navigation', action: () => { onNavigate('apm'); onClose(); } },
    { id: 'alerts', label: 'Alertas', description: 'Alertas ativos e regras', icon: <Bell className="w-4 h-4" />, category: 'navigation', action: () => { onNavigate('alerts'); onClose(); } },
    { id: 'users', label: 'Usuários', description: 'Gerenciamento de usuários e permissões', icon: <User className="w-4 h-4" />, category: 'navigation', action: () => { onNavigate('users'); onClose(); } },
    { id: 'system', label: 'Saúde do Sistema', description: 'CPU, memória, disco e rede', icon: <Server className="w-4 h-4" />, category: 'navigation', action: () => { onNavigate('system'); onClose(); } },
    { id: 'realtime', label: 'Tempo Real', description: 'Métricas e eventos ao vivo', icon: <Activity className="w-4 h-4" />, category: 'navigation', action: () => { onNavigate('realtime'); onClose(); } },
    { id: 'custom-metrics', label: 'Métricas Customizadas', description: 'Criar e gerenciar métricas', icon: <Target className="w-4 h-4" />, category: 'navigation', action: () => { onNavigate('custom-metrics'); onClose(); } },
    { id: 'security', label: 'Segurança', description: 'Eventos de segurança e ameaças', icon: <Shield className="w-4 h-4" />, category: 'navigation', action: () => { onNavigate('security'); onClose(); } },
    { id: 'ml', label: 'Machine Learning', description: 'Modelos e previsões de ML', icon: <Brain className="w-4 h-4" />, category: 'navigation', action: () => { onNavigate('ml'); onClose(); } },
    { id: 'advanced-analytics', label: 'Analytics Avançado', description: 'Análises avançadas e previsões', icon: <BarChart3 className="w-4 h-4" />, category: 'navigation', action: () => { onNavigate('advanced-analytics'); onClose(); } },
    { id: 'service-mesh', label: 'Service Mesh', description: 'Monitoramento de serviços Kubernetes', icon: <Network className="w-4 h-4" />, category: 'navigation', action: () => { onNavigate('service-mesh'); onClose(); } },
    { id: 'anomaly-detection', label: 'Detecção de Anomalias', description: 'Anomalias detectadas e padrões', icon: <AlertCircle className="w-4 h-4" />, category: 'navigation', action: () => { onNavigate('anomaly-detection'); onClose(); } },
    { id: 'incident-management', label: 'Gestão de Incidentes', description: 'Incidentes, runbooks e timeline', icon: <MessageSquare className="w-4 h-4" />, category: 'navigation', action: () => { onNavigate('incident-management'); onClose(); } },
    { id: 'dashboard-builder', label: 'Dashboard Builder', description: 'Construtor de dashboards customizados', icon: <Grid className="w-4 h-4" />, category: 'navigation', action: () => { onNavigate('dashboard-builder'); onClose(); } },
    { id: 'settings', label: 'Configurações', description: 'Preferências e configurações do sistema', icon: <Settings className="w-4 h-4" />, category: 'navigation', action: () => { onNavigate('settings'); onClose(); } },
    // Actions
    { id: 'refresh', label: 'Atualizar Dados', description: 'Buscar logs e métricas mais recentes', icon: <RefreshCw className="w-4 h-4" />, category: 'action', action: () => { onRefresh(); onClose(); } },
    {
      id: 'toggle-theme',
      label: display.theme === 'dark' ? 'Alternar para Tema Claro' : 'Alternar para Tema Escuro',
      description: 'Mudar entre modo claro e escuro',
      icon: display.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />,
      category: 'action',
      action: () => {
        updateDisplay({ theme: display.theme === 'dark' ? 'light' : 'dark' });
        onClose();
      },
    },
    { id: 'view-users', label: 'Ver Equipe', description: 'Abrir gestão de usuários', icon: <Users className="w-4 h-4" />, category: 'action', action: () => { onNavigate('users'); onClose(); } },
  ];

  const filtered = allItems.filter(item =>
    fuzzyMatch(item.label, query) || fuzzyMatch(item.description || '', query)
  );

  const navItems = filtered.filter(i => i.category === 'navigation');
  const actionItems = filtered.filter(i => i.category === 'action');

  const flatItems = [...navItems, ...actionItems];

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, flatItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      flatItems[activeIndex]?.action();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  if (!isOpen) return null;

  const renderGroup = (items: CommandItem[], title: string, offset: number) => {
    if (items.length === 0) return null;
    return (
      <div>
        <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          {title}
        </div>
        {items.map((item, i) => {
          const globalIdx = offset + i;
          const isActive = globalIdx === activeIndex;
          return (
            <button
              key={item.id}
              data-index={globalIdx}
              onClick={item.action}
              onMouseEnter={() => setActiveIndex(globalIdx)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <span className={`flex-shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>
                {item.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  <HighlightMatch text={item.label} query={query} />
                </div>
                {item.description && (
                  <div className="text-xs text-gray-400 dark:text-gray-500 truncate">{item.description}</div>
                )}
              </div>
              {isActive && (
                <span className="flex-shrink-0 text-xs text-gray-400 dark:text-gray-500 font-mono border border-gray-200 dark:border-gray-600 rounded px-1.5 py-0.5">
                  ↵
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Palette */}
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar navegação, ações..."
            className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none text-sm"
          />
          <kbd className="hidden sm:flex text-xs text-gray-400 border border-gray-200 dark:border-gray-600 rounded px-1.5 py-0.5 font-mono">
            esc
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-80 overflow-y-auto py-1">
          {flatItems.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-400 dark:text-gray-500 text-sm">
              Nenhum resultado para "{query}"
            </div>
          ) : (
            <>
              {renderGroup(navItems, 'Navegação', 0)}
              {renderGroup(actionItems, 'Ações', navItems.length)}
            </>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
          <span><kbd className="font-mono">↑↓</kbd> navegar</span>
          <span><kbd className="font-mono">↵</kbd> selecionar</span>
          <span><kbd className="font-mono">esc</kbd> fechar</span>
        </div>
      </div>
    </div>
  );
};
