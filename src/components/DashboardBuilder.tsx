import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Save,
  Share,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  Grid,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Gauge,
  Table,
  CheckCircle,
  Brain
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';

interface Widget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'text' | 'image' | 'gauge' | 'status';
  title: string;
  position: { x: number; y: number; w: number; h: number };
  config: any;
  data?: any;
  visible: boolean;
  locked: boolean;
}

interface Dashboard {
  id: string;
  name: string;
  description: string;
  widgets: Widget[];
  layout: 'grid' | 'freeform';
  theme: 'light' | 'dark' | 'auto';
  refreshInterval: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface WidgetTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  icon: any;
  defaultConfig: any;
  category: string;
}

interface PieDataItem {
  name: string;
  value: number;
  color: string;
}

export const DashboardBuilder: React.FC = () => {
  const { t } = useTranslation();
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [currentDashboard, setCurrentDashboard] = useState<Dashboard | null>(null);
  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Widget templates
  const widgetTemplates: WidgetTemplate[] = [
    {
      id: 'line-chart',
      name: 'Line Chart',
      description: 'Display time-series data',
      type: 'chart',
      icon: LineChart,
      category: 'charts',
      defaultConfig: {
        chartType: 'line',
        dataSource: 'metrics',
        timeRange: '24h',
        metrics: ['cpu', 'memory'],
        colors: ['#3b82f6', '#10b981']
      }
    },
    {
      id: 'bar-chart',
      name: 'Bar Chart',
      description: 'Compare values across categories',
      type: 'chart',
      icon: BarChart3,
      category: 'charts',
      defaultConfig: {
        chartType: 'bar',
        dataSource: 'logs',
        timeRange: '24h',
        groupBy: 'level',
        colors: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981']
      }
    },
    {
      id: 'pie-chart',
      name: 'Pie Chart',
      description: 'Show data distribution',
      type: 'chart',
      icon: PieChart,
      category: 'charts',
      defaultConfig: {
        chartType: 'pie',
        dataSource: 'errors',
        timeRange: '24h',
        groupBy: 'type',
        colors: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6']
      }
    },
    {
      id: 'metric-card',
      name: 'Metric Card',
      description: 'Display a single metric value',
      type: 'metric',
      icon: Activity,
      category: 'metrics',
      defaultConfig: {
        metric: 'response_time',
        format: 'ms',
        threshold: { warning: 200, critical: 500 },
        trend: true
      }
    },
    {
      id: 'gauge',
      name: 'Gauge',
      description: 'Show percentage or ratio',
      type: 'gauge',
      icon: Gauge,
      category: 'metrics',
      defaultConfig: {
        metric: 'cpu_usage',
        min: 0,
        max: 100,
        format: '%',
        thresholds: { warning: 80, critical: 95 }
      }
    },
    {
      id: 'status-board',
      name: 'Status Board',
      description: 'Show service health status',
      type: 'status',
      icon: CheckCircle,
      category: 'monitoring',
      defaultConfig: {
        services: ['user-service', 'auth-service', 'payment-service'],
        showUptime: true,
        showLatency: true
      }
    },
    {
      id: 'data-table',
      name: 'Data Table',
      description: 'Display tabular data',
      type: 'table',
      icon: Table,
      category: 'data',
      defaultConfig: {
        dataSource: 'logs',
        columns: ['timestamp', 'level', 'message', 'service'],
        pageSize: 10,
        sortable: true
      }
    },
    {
      id: 'text-widget',
      name: 'Text Widget',
      description: 'Add notes or instructions',
      type: 'text',
      icon: Brain,
      category: 'content',
      defaultConfig: {
        content: 'Add your notes here...',
        fontSize: 14,
        textAlign: 'left'
      }
    }
  ];

  // Mock data for charts
  const mockChartData = [
    { time: '00:00', cpu: 45, memory: 68, errors: 2, requests: 1200 },
    { time: '04:00', cpu: 42, memory: 65, errors: 1, requests: 800 },
    { time: '08:00', cpu: 55, memory: 72, errors: 3, requests: 1500 },
    { time: '12:00', cpu: 65, memory: 78, errors: 5, requests: 2200 },
    { time: '16:00', cpu: 58, memory: 75, errors: 4, requests: 1800 },
    { time: '20:00', cpu: 48, memory: 70, errors: 2, requests: 1400 },
    { time: '24:00', cpu: 45, memory: 68, errors: 2, requests: 1200 }
  ];

  const mockPieData = [
    { name: 'Error', value: 15, color: '#ef4444' },
    { name: 'Warning', value: 25, color: '#f59e0b' },
    { name: 'Info', value: 45, color: '#3b82f6' },
    { name: 'Debug', value: 15, color: '#10b981' }
  ];

  // Mock dashboards
  const mockDashboards: Dashboard[] = [
    {
      id: '1',
      name: 'System Overview',
      description: 'Main system monitoring dashboard',
      layout: 'grid',
      theme: 'auto',
      refreshInterval: 30,
      isPublic: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      createdBy: 'admin@company.com',
      widgets: [
        {
          id: '1',
          type: 'metric',
          title: 'CPU Usage',
          position: { x: 0, y: 0, w: 3, h: 2 },
          config: { metric: 'cpu_usage', format: '%', threshold: { warning: 80, critical: 95 } },
          data: { value: 65, trend: 5 },
          visible: true,
          locked: false
        },
        {
          id: '2',
          type: 'chart',
          title: 'System Metrics',
          position: { x: 3, y: 0, w: 6, h: 4 },
          config: { chartType: 'line', metrics: ['cpu', 'memory'] },
          data: mockChartData,
          visible: true,
          locked: false
        }
      ]
    }
  ];

  useEffect(() => {
    setDashboards(mockDashboards);
    setCurrentDashboard(mockDashboards[0]);
  }, []);

  const createWidget = (template: WidgetTemplate) => {
    if (!currentDashboard) return;

    const newWidget: Widget = {
      id: Date.now().toString(),
      type: template.type as any,
      title: template.name,
      position: { x: 0, y: 0, w: 4, h: 3 },
      config: { ...template.defaultConfig },
      visible: true,
      locked: false
    };

    setCurrentDashboard({
      ...currentDashboard,
      widgets: [...currentDashboard.widgets, newWidget]
    });
  };

  const updateWidget = (widgetId: string, updates: Partial<Widget>) => {
    if (!currentDashboard) return;

    setCurrentDashboard({
      ...currentDashboard,
      widgets: currentDashboard.widgets.map(widget =>
        widget.id === widgetId ? { ...widget, ...updates } : widget
      )
    });
  };

  const deleteWidget = (widgetId: string) => {
    if (!currentDashboard) return;

    setCurrentDashboard({
      ...currentDashboard,
      widgets: currentDashboard.widgets.filter(widget => widget.id !== widgetId)
    });
    setSelectedWidget(null);
  };

  const renderWidget = (widget: Widget) => {
    const commonClasses = "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4";
    const selectedClasses = selectedWidget?.id === widget.id ? "ring-2 ring-blue-500" : "";

    switch (widget.type) {
      case 'metric':
        return (
          <div className={`${commonClasses} ${selectedClasses} cursor-pointer`} onClick={() => setSelectedWidget(widget)}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900 dark:text-white">{widget.title}</h3>
              {isEditing && (
                <div className="flex items-center space-x-1">
                  <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    <Edit className="w-3 h-3" />
                  </button>
                  <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {widget.data?.value || 0}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {widget.data?.trend > 0 ? '+' : ''}{widget.data?.trend || 0}% from last hour
            </div>
          </div>
        );

      case 'chart':
        return (
          <div className={`${commonClasses} ${selectedClasses} cursor-pointer`} onClick={() => setSelectedWidget(widget)}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900 dark:text-white">{widget.title}</h3>
              {isEditing && (
                <div className="flex items-center space-x-1">
                  <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    <Edit className="w-3 h-3" />
                  </button>
                  <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
            <ResponsiveContainer width="100%" height={200}>
              {widget.config.chartType === 'line' ? (
                <RechartsLineChart data={widget.data || mockChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="memory" stroke="#10b981" strokeWidth={2} />
                </RechartsLineChart>
              ) : widget.config.chartType === 'bar' ? (
                <BarChart data={widget.data || mockChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="requests" fill="#3b82f6" />
                </BarChart>
              ) : (
                <RechartsPieChart>
                  <Pie
                    data={widget.data || mockPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {(widget.data || mockPieData).map((entry: PieDataItem, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              )}
            </ResponsiveContainer>
          </div>
        );

      case 'status':
        return (
          <div className={`${commonClasses} ${selectedClasses} cursor-pointer`} onClick={() => setSelectedWidget(widget)}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900 dark:text-white">{widget.title}</h3>
              {isEditing && (
                <div className="flex items-center space-x-1">
                  <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    <Edit className="w-3 h-3" />
                  </button>
                  <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-2">
              {['user-service', 'auth-service', 'payment-service'].map((service) => (
                <div key={service} className="flex items-center justify-between">
                  <span className="text-sm text-gray-900 dark:text-white">{service}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Healthy</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'text':
        return (
          <div className={`${commonClasses} ${selectedClasses} cursor-pointer`} onClick={() => setSelectedWidget(widget)}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900 dark:text-white">{widget.title}</h3>
              {isEditing && (
                <div className="flex items-center space-x-1">
                  <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    <Edit className="w-3 h-3" />
                  </button>
                  <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400">{widget.config.content}</p>
          </div>
        );

      default:
        return (
          <div className={`${commonClasses} ${selectedClasses} cursor-pointer`} onClick={() => setSelectedWidget(widget)}>
            <h3 className="font-medium text-gray-900 dark:text-white">{widget.title}</h3>
            <p className="text-gray-500 dark:text-gray-400">Widget type: {widget.type}</p>
          </div>
        );
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('dashboard_builder')}
            </h1>
            {currentDashboard && (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={currentDashboard.name}
                  onChange={(e) => setCurrentDashboard({ ...currentDashboard, name: e.target.value })}
                  className="text-lg font-medium text-gray-900 dark:text-white bg-transparent border-none focus:outline-none"
                />
                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              className={`btn-secondary ${isEditing ? 'bg-blue-100 text-blue-700' : ''}`}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? <Eye className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
              {isEditing ? t('preview') : t('edit')}
            </button>
            <button className="btn-secondary">
              <Save className="w-4 h-4" />
              {t('save')}
            </button>
            <button className="btn-secondary">
              <Share className="w-4 h-4" />
              {t('share')}
            </button>
            <button className="btn-primary">
              <Plus className="w-4 h-4" />
              {t('add_widget')}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar */}
        {isEditing && (
          <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  {t('widgets')}
                </h3>
                <div className="space-y-2">
                  {widgetTemplates.map((template) => (
                    <button
                      key={template.id}
                      className="w-full flex items-center space-x-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                      onClick={() => createWidget(template)}
                    >
                      <template.icon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-900 dark:text-white">{template.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  {t('dashboards')}
                </h3>
                <div className="space-y-2">
                  {dashboards.map((dashboard) => (
                    <button
                      key={dashboard.id}
                      className={`w-full text-left p-2 rounded text-sm ${
                        currentDashboard?.id === dashboard.id
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                      onClick={() => setCurrentDashboard(dashboard)}
                    >
                      {dashboard.name}
                    </button>
                  ))}
                </div>
              </div>

              {selectedWidget && (
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    {t('widget_settings')}
                  </h3>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={selectedWidget.title}
                      onChange={(e) => updateWidget(selectedWidget.id, { title: e.target.value })}
                      className="w-full form-input"
                      placeholder={t('widget_title')}
                    />
                    <button
                      className="w-full btn-secondary"
                      onClick={() => updateWidget(selectedWidget.id, { visible: !selectedWidget.visible })}
                    >
                      {selectedWidget.visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {selectedWidget.visible ? t('hide') : t('show')}
                    </button>
                    <button
                      className="w-full btn-secondary"
                      onClick={() => updateWidget(selectedWidget.id, { locked: !selectedWidget.locked })}
                    >
                      {selectedWidget.locked ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {selectedWidget.locked ? t('unlock') : t('lock')}
                    </button>
                    <button
                      className="w-full btn-secondary text-red-600"
                      onClick={() => deleteWidget(selectedWidget.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                      {t('delete')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-6 overflow-auto">
          {currentDashboard ? (
            <div className="grid grid-cols-12 gap-4 auto-rows-min">
              {currentDashboard.widgets.map((widget) => (
                <div
                  key={widget.id}
                  className={`col-span-${widget.position.w} row-span-${widget.position.h}`}
                  style={{
                    gridColumn: `span ${widget.position.w}`,
                    gridRow: `span ${widget.position.h}`
                  }}
                >
                  {renderWidget(widget)}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Grid className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {t('no_dashboard_selected')}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {t('select_or_create_dashboard')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 