import {
  Activity,
  AlertTriangle,
  BarChart3,
  Edit,
  Plus,
  Save,
  Settings,
  Target,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import toast from "react-hot-toast";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface CustomMetric {
  id: string;
  name: string;
  description: string;
  type: "counter" | "gauge" | "histogram" | "summary";
  unit: string;
  tags: string[];
  query: string;
  alertThreshold?: number;
  alertCondition: "above" | "below" | "equals";
  chartType: "line" | "bar" | "pie";
  data: Array<{
    timestamp: string;
    value: number;
    tags?: Record<string, string>;
  }>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MetricTemplate {
  id: string;
  name: string;
  description: string;
  type: CustomMetric["type"];
  query: string;
  unit: string;
  tags: string[];
}

export const CustomMetrics: React.FC = () => {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState<CustomMetric[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMetric, setEditingMetric] = useState<Partial<CustomMetric>>({});
  const [timeRange, setTimeRange] = useState("1h");
  const [refreshInterval, setRefreshInterval] = useState(30000);

  const metricTemplates: MetricTemplate[] = [
    {
      id: "cpu-usage",
      name: "CPU Usage",
      description: "Average CPU usage across all instances",
      type: "gauge",
      query: "avg(cpu_usage) by (instance)",
      unit: "%",
      tags: ["instance", "environment"],
    },
    {
      id: "memory-usage",
      name: "Memory Usage",
      description: "Memory utilization percentage",
      type: "gauge",
      query: "avg(memory_usage) by (instance)",
      unit: "%",
      tags: ["instance", "environment"],
    },
    {
      id: "request-rate",
      name: "Request Rate",
      description: "HTTP requests per second",
      type: "counter",
      query: "rate(http_requests_total[5m])",
      unit: "req/s",
      tags: ["method", "endpoint", "status"],
    },
    {
      id: "response-time",
      name: "Response Time",
      description: "Average response time for HTTP requests",
      type: "histogram",
      query:
        "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
      unit: "ms",
      tags: ["method", "endpoint"],
    },
    {
      id: "error-rate",
      name: "Error Rate",
      description: "Percentage of requests that result in errors",
      type: "gauge",
      query:
        'rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) * 100',
      unit: "%",
      tags: ["endpoint", "error_type"],
    },
  ];

  // Generate mock metrics data
  useEffect(() => {
    const generateMockMetrics = () => {
      const mockMetrics: CustomMetric[] = metricTemplates.map(
        (template, index) => {
          const data = Array.from({ length: 24 }, (_, i) => ({
            timestamp: new Date(
              Date.now() - (23 - i) * 60 * 60 * 1000
            ).toISOString(),
            value: Math.random() * 100 + index * 20,
            tags: {
              instance: `instance-${Math.floor(Math.random() * 3) + 1}`,
              environment: "production",
            },
          }));

          return {
            id: template.id,
            name: template.name,
            description: template.description,
            type: template.type,
            unit: template.unit,
            tags: template.tags,
            query: template.query,
            alertThreshold: 80,
            alertCondition: "above" as const,
            chartType: "line" as const,
            data,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }
      );

      setMetrics(mockMetrics);
    };

    generateMockMetrics();
  }, []);

  // Auto-refresh data
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prevMetrics) =>
        prevMetrics.map((metric) => ({
          ...metric,
          data: [
            ...metric.data.slice(1),
            {
              timestamp: new Date().toISOString(),
              value: Math.random() * 100 + Math.random() * 50,
              tags: {
                instance: `instance-${Math.floor(Math.random() * 3) + 1}`,
                environment: "production",
              },
            },
          ],
        }))
      );
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const createMetric = () => {
    if (!editingMetric.name || !editingMetric.query) {
      toast.error("Name and query are required");
      return;
    }

    const newMetric: CustomMetric = {
      id: `metric-${Date.now()}`,
      name: editingMetric.name!,
      description: editingMetric.description || "",
      type: editingMetric.type || "counter",
      unit: editingMetric.unit || "",
      tags: editingMetric.tags || [],
      query: editingMetric.query!,
      alertThreshold: editingMetric.alertThreshold,
      alertCondition: editingMetric.alertCondition || "above",
      chartType: editingMetric.chartType || "line",
      data: [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setMetrics((prev) => [...prev, newMetric]);
    setShowCreateModal(false);
    setEditingMetric({});
    toast.success("Metric created successfully!");
  };

  const updateMetric = () => {
    if (!editingMetric.id) return;

    setMetrics((prev) =>
      prev.map((metric) =>
        metric.id === editingMetric.id
          ? { ...metric, ...editingMetric, updatedAt: new Date().toISOString() }
          : metric
      )
    );
    setShowEditModal(false);
    setEditingMetric({});
    toast.success("Metric updated successfully!");
  };

  const deleteMetric = (id: string) => {
    setMetrics((prev) => prev.filter((metric) => metric.id !== id));
    toast.success("Metric deleted successfully!");
  };

  const toggleMetricStatus = (id: string) => {
    setMetrics((prev) =>
      prev.map((metric) =>
        metric.id === id ? { ...metric, isActive: !metric.isActive } : metric
      )
    );
  };

  const getChartComponent = (metric: CustomMetric) => {
    const data = metric.data.map((d) => ({
      ...d,
      time: new Date(d.timestamp).toLocaleTimeString(),
    }));

    const colors = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6"];

    switch (metric.chartType) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        );

      case "pie": {
        const pieData = data.slice(-5).map((d, i) => ({
          name: d.time,
          value: d.value,
          color: colors[i % colors.length],
        }));

        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        );
      }

      default:
        return null;
    }
  };

  const getMetricIcon = (type: string) => {
    switch (type) {
      case "counter":
        return <TrendingUp className="w-4 h-4" />;
      case "gauge":
        return <Target className="w-4 h-4" />;
      case "histogram":
        return <BarChart3 className="w-4 h-4" />;
      case "summary":
        return <Activity className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getAlertStatus = (metric: CustomMetric) => {
    if (!metric.alertThreshold) return null;

    const latestValue = metric.data[metric.data.length - 1]?.value || 0;

    if (
      metric.alertCondition === "above" &&
      latestValue > metric.alertThreshold
    ) {
      return {
        status: "alert",
        icon: <AlertTriangle className="w-4 h-4 text-red-600" />,
      };
    }

    if (
      metric.alertCondition === "below" &&
      latestValue < metric.alertThreshold
    ) {
      return {
        status: "alert",
        icon: <AlertTriangle className="w-4 h-4 text-red-600" />,
      };
    }

    return {
      status: "normal",
      icon: <Activity className="w-4 h-4 text-green-600" />,
    };
  };

  console.log("CustomMetrics render - metrics:", metrics.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white dark:text-white">{t('custom_metrics')}</h2>
          <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">
            {t('custom_metrics_subtitle')}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="1h">{t('last_hour')}</option>
            <option value="6h">{t('last_6_hours')}</option>
            <option value="24h">{t('last_24_hours')}</option>
            <option value="7d">{t('last_7_days')}</option>
          </select>

          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value={5000}>{t('interval_5s')}</option>
            <option value={15000}>{t('interval_15s')}</option>
            <option value={30000}>{t('interval_30s')}</option>
            <option value={60000}>{t('interval_1m')}</option>
          </select>

          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>{t('create_metric')}</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {metrics.length === 0 ? (
          <div className="col-span-2 text-center py-12">
            <div className="text-gray-500 dark:text-gray-400 dark:text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white dark:text-white mb-2">
                {t('no_custom_metrics')}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-4">
                {t('create_first_metric_message')}
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary flex items-center space-x-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>{t('create_first_metric')}</span>
              </button>
            </div>
          </div>
        ) : (
          metrics.map((metric) => {
            const alertStatus = getAlertStatus(metric);
            const latestValue = metric.data[metric.data.length - 1]?.value || 0;

            return (
              <div key={metric.id} className="card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getMetricIcon(metric.type)}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white dark:text-white">
                        {metric.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                        {metric.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {alertStatus?.icon}
                    <div className="flex items-center space-x-1">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white dark:text-white">
                        {latestValue.toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                        {metric.unit}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-4">{getChartComponent(metric)}</div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        metric.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-800"
                      }`}
                    >
                      {metric.isActive ? "Active" : "Inactive"}
                    </span>

                    {metric.alertThreshold && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                        {t('alert_threshold_message')}: {metric.alertCondition} {metric.alertThreshold}
                        {metric.unit}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleMetricStatus(metric.id)}
                      className="text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white dark:text-white"
                    >
                      <Settings className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setEditingMetric(metric);
                        setShowEditModal(true);
                      }}
                      className="text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white dark:text-white"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => deleteMetric(metric.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Metric Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-700 rounded-lg p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white dark:text-white">
                {t('create_custom_metric')}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('name')}
                </label>
                <input
                  type="text"
                  value={editingMetric.name || ""}
                  onChange={(e) =>
                    setEditingMetric({ ...editingMetric, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={t('metric_name_placeholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('description')}
                </label>
                <textarea
                  value={editingMetric.description || ""}
                  onChange={(e) =>
                    setEditingMetric({
                      ...editingMetric,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                  placeholder={t('metric_description_placeholder')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('type')}
                  </label>
                  <select
                    value={editingMetric.type || "counter"}
                    onChange={(e) =>
                      setEditingMetric({
                        ...editingMetric,
                        type: e.target.value as CustomMetric["type"],
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="counter">{t('counter')}</option>
                    <option value="gauge">{t('gauge')}</option>
                    <option value="histogram">{t('histogram')}</option>
                    <option value="summary">{t('summary')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('unit')}
                  </label>
                  <input
                    type="text"
                    value={editingMetric.unit || ""}
                    onChange={(e) =>
                      setEditingMetric({
                        ...editingMetric,
                        unit: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder={t('unit_placeholder')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('query')}
                </label>
                <textarea
                  value={editingMetric.query || ""}
                  onChange={(e) =>
                    setEditingMetric({
                      ...editingMetric,
                      query: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                  rows={3}
                  placeholder={t('promql_query_placeholder')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('alert_threshold')}
                  </label>
                  <input
                    type="number"
                    value={editingMetric.alertThreshold || ""}
                    onChange={(e) =>
                      setEditingMetric({
                        ...editingMetric,
                        alertThreshold: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder={t('optional_placeholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('alert_condition')}
                  </label>
                  <select
                    value={editingMetric.alertCondition || "above"}
                    onChange={(e) =>
                      setEditingMetric({
                        ...editingMetric,
                        alertCondition: e.target.value as
                          | "above"
                          | "below"
                          | "equals",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="above">{t('above')}</option>
                    <option value="below">{t('below')}</option>
                    <option value="equals">{t('equals')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('chart_type')}
                </label>
                <select
                  value={editingMetric.chartType || "line"}
                  onChange={(e) =>
                    setEditingMetric({
                      ...editingMetric,
                      chartType: e.target.value as "line" | "bar" | "pie",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="line">{t('line_chart')}</option>
                  <option value="bar">{t('bar_chart')}</option>
                  <option value="pie">{t('pie_chart')}</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn-secondary"
              >
                {t('cancel')}
              </button>
              <button
                onClick={createMetric}
                className="btn-primary flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{t('create_metric')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Metric Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-700 rounded-lg p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white dark:text-white">
                {t('edit_metric')}
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('name')}
                </label>
                <input
                  type="text"
                  value={editingMetric.name || ""}
                  onChange={(e) =>
                    setEditingMetric({ ...editingMetric, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('description')}
                </label>
                <textarea
                  value={editingMetric.description || ""}
                  onChange={(e) =>
                    setEditingMetric({
                      ...editingMetric,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('query')}
                </label>
                <textarea
                  value={editingMetric.query || ""}
                  onChange={(e) =>
                    setEditingMetric({
                      ...editingMetric,
                      query: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('alert_threshold')}
                  </label>
                  <input
                    type="number"
                    value={editingMetric.alertThreshold || ""}
                    onChange={(e) =>
                      setEditingMetric({
                        ...editingMetric,
                        alertThreshold: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('alert_condition')}
                  </label>
                  <select
                    value={editingMetric.alertCondition || "above"}
                    onChange={(e) =>
                      setEditingMetric({
                        ...editingMetric,
                        alertCondition: e.target.value as
                          | "above"
                          | "below"
                          | "equals",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="above">{t('above')}</option>
                    <option value="below">{t('below')}</option>
                    <option value="equals">{t('equals')}</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="btn-secondary"
              >
                {t('cancel')}
              </button>
              <button
                onClick={updateMetric}
                className="btn-primary flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{t('update_metric')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
