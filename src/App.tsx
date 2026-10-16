import { useEffect, useState } from "react";
import axios from "axios";
import { useLogMetrics } from "./hooks/useLogs";
import { useHealth } from "./hooks/useHealth";
import { usePerformance } from "./hooks/usePerformance";
import { useTranslation } from "react-i18next";
import {
  useNavigate,
  useLocation,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { LoginPage } from "./components/LoginPage";
import { RegisterPage } from "./components/RegisterPage";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Eye,
  Grid,
  Layers,
  LogOut,
  MessageSquare,
  RefreshCw,
  Settings,
  Shield,
  Target,
  TrendingUp,
  Users,
  X,
  Server,
  ChevronLeft,
  ChevronRight,
  Package,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { AlertSystem } from "./components/AlertSystem";
import { AuthSystem } from "./components/AuthSystem";
import { AdvancedLogs } from "./components/AdvancedLogs";
import { CustomMetrics } from "./components/CustomMetrics";
import { SecuritySystem } from "./components/SecuritySystem";
import { SettingsComponent } from "./components/Settings";
import { IncidentManagement } from "./components/IncidentManagement";
import { DashboardBuilder } from "./components/DashboardBuilder";
import { CommandPalette } from "./components/CommandPalette";
import { ErrorHeatmap } from "./components/ErrorHeatmap";
import { ErrorMonitoring } from "./components/ErrorMonitoring";
import { ServicesMonitoring } from "./components/ServicesMonitoring";
import { Performance } from "./components/Performance";
import { Applications } from "./components/Applications";
import { useSettings } from "./hooks/useSettings";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { CHART_COLORS } from "./constants/colors";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Log {
  _id: string;
  level: string;
  message: string;
  environment?: string;
  appName?: string;
  userId?: string;
  meta?: Record<string, unknown>;
  createdAt: string;
  traceId?: string;
  spanId?: string;
}
interface Metric {
  level: string;
  count: number;
}

// ─── Sidebar config ───────────────────────────────────────────────────────────

interface NavItem {
  id: string;
  path: string;
  label_key: string;
  icon: React.ElementType;
}
interface NavGroup {
  label?: string; // undefined = no label (top group)
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { id: "overview", path: "/", label_key: "dashboard", icon: BarChart3 },
    ],
  },
  {
    label: "Observabilidade",
    items: [
      { id: "logs", path: "/logs", label_key: "logs", icon: Layers },
      {
        id: "errors",
        path: "/errors",
        label_key: "errors",
        icon: AlertTriangle,
      },
      {
        id: "performance",
        path: "/performance",
        label_key: "performance",
        icon: TrendingUp,
      },
    ],
  },
  {
    label: "Serviços",
    items: [
      {
        id: "services",
        path: "/services",
        label_key: "services",
        icon: Server,
      },
    ],
  },
  {
    label: "Alertas",
    items: [
      { id: "alerts", path: "/alerts", label_key: "alerts", icon: Bell },
      {
        id: "incident-management",
        path: "/incident-management",
        label_key: "incident_management",
        icon: MessageSquare,
      },
    ],
  },
  {
    label: "Admin",
    items: [
      {
        id: "applications",
        path: "/applications",
        label_key: "applications",
        icon: Package,
      },
      {
        id: "security",
        path: "/security",
        label_key: "security",
        icon: Shield,
      },
      { id: "users", path: "/users", label_key: "users", icon: Users },
      {
        id: "settings",
        path: "/settings",
        label_key: "settings",
        icon: Settings,
      },
    ],
  },
];

const ALL_NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockErrorData = [
  { time: "00:00", errors: 12 },
  { time: "04:00", errors: 8 },
  { time: "08:00", errors: 15 },
  { time: "12:00", errors: 22 },
  { time: "16:00", errors: 18 },
  { time: "20:00", errors: 11 },
  { time: "24:00", errors: 9 },
];

const API_URL = "http://localhost:3000/logs";

function formatUptime(seconds: number) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  return d > 0 ? `${d}d ${h}h` : `${h}h`;
}

// ─── App ──────────────────────────────────────────────────────────────────────

export function App() {
  const { t } = useTranslation();
  const { general } = useSettings();
  const { user, logout, loginWithToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [authPage, setAuthPage] = useState<"login" | "register">("login");

  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [commandOpen, setCommandOpen] = useState(false);
  const [alertDismissed, setAlertDismissed] = useState(false);

  const { data: rawMetrics } = useLogMetrics(undefined, { enabled: !!user });
  const metrics: Metric[] = rawMetrics
    ? rawMetrics.map((m) => ({ level: m.level, count: m.sum }))
    : [];

  const health = useHealth({ enabled: !!user });
  const perf = usePerformance("1h", { enabled: !!user });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const r = await axios.get<Log[]>(API_URL);
      setLogs(r.data);
    } catch {
      toast.error(t("failed_to_fetch_logs"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchLogs();
  }, [user]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  if (!user) {
    if (authPage === "register") {
      return (
        <RegisterPage
          onLoginClick={() => setAuthPage("login")}
          onSuccess={(token, u) => loginWithToken(token, u)}
        />
      );
    }
    return <LoginPage onRegisterClick={() => setAuthPage("register")} />;
  }

  const systemHealth = { cpu: 45, memory: 72, disk: 23, network: 85 };

  const refreshData = () => {
    fetchLogs();
    toast.success(t("data_refreshed_successfully"));
  };
  const navigateTo = (tabId: string) => {
    const item = ALL_NAV_ITEMS.find((i) => i.id === tabId);
    if (item) navigate(item.path);
  };
  const getLevelColor = (level: string) =>
    CHART_COLORS[level as keyof typeof CHART_COLORS] || CHART_COLORS.info;
  const hasRecentErrors =
    !alertDismissed && metrics.some((m) => m.level === "error" && m.count > 0);

  const isActive = (item: NavItem) =>
    item.path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(item.path);

  const totalErrors = metrics.find((m) => m.level === "error")?.count ?? 0;
  const uptimeValue = health.data ? formatUptime(health.data.uptime) : "–";
  const responseTimeValue = perf.data?.responseTime
    ? `${perf.data.responseTime}ms`
    : "–";

  const metricCards = [
    {
      label: t("total_errors"),
      value: String(totalErrors),
      sub: t("from_yesterday"),
      subColor: "text-red-600",
      trend: "",
      trendUp: false,
      icon: (
        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
      ),
      iconBg: "bg-red-100 dark:bg-red-900/40",
      sparkData: [],
      sparkColor: "#ef4444",
    },
    {
      label: t("uptime"),
      value: uptimeValue,
      sub: t("last_30_days"),
      subColor: "text-green-600",
      trend: "",
      trendUp: true,
      icon: <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />,
      iconBg: "bg-green-100 dark:bg-green-900/40",
      sparkData: [],
      sparkColor: "#10b981",
    },
    {
      label: t("response_time"),
      value: responseTimeValue,
      sub: t("avg_last_hour"),
      subColor: "text-blue-600",
      trend: "",
      trendUp: true,
      icon: <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      iconBg: "bg-blue-100 dark:bg-blue-900/40",
      sparkData: [],
      sparkColor: "#3b82f6",
    },
    {
      label: t("active_users"),
      value: "–",
      sub: t("from_yesterday"),
      subColor: "text-purple-600",
      trend: "",
      trendUp: true,
      icon: <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      iconBg: "bg-purple-100 dark:bg-purple-900/40",
      sparkData: [],
      sparkColor: "#8b5cf6",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Toaster position="top-right" />

      <CommandPalette
        isOpen={commandOpen}
        onClose={() => setCommandOpen(false)}
        onNavigate={navigateTo}
        onRefresh={refreshData}
      />

      {/* Alert Banner */}
      {hasRecentErrors && (
        <div className="bg-red-600 text-white px-4 py-2 flex items-center justify-between text-sm flex-shrink-0">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>
              <strong>Atenção:</strong>{" "}
              {metrics.find((m) => m.level === "error")?.count ?? 0} erros
              detectados recentemente.
            </span>
            <button
              onClick={() => navigate("/errors")}
              className="underline hover:no-underline font-semibold ml-1"
            >
              Ver Erros →
            </button>
          </div>
          <button
            onClick={() => setAlertDismissed(true)}
            className="p-1 hover:bg-red-700 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="px-4 sm:px-6">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <Eye className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">
                {general.dashboardName}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCommandOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
              >
                <span className="text-xs">Buscar / navegar</span>
                <kbd className="font-mono text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded px-1.5 py-0.5">
                  ⌘K
                </kbd>
              </button>
              <button
                onClick={refreshData}
                className="btn-secondary flex items-center gap-1.5 text-xs"
                disabled={loading}
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
                />
                <span>{t("refresh")}</span>
              </button>
              <button
                onClick={() => navigate("/settings")}
                className="btn-secondary flex items-center gap-1.5 text-xs"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>{t("settings")}</span>
              </button>
              <button
                onClick={logout}
                className="btn-secondary flex items-center gap-1.5 text-xs"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Body: sidebar + main */}
      <div className="flex flex-1 min-h-0">
        {/* ── Sidebar ── */}
        <nav
          className={`
          sticky top-0 h-screen overflow-y-auto flex-shrink-0
          bg-white dark:bg-gray-800
          border-r border-gray-200 dark:border-gray-700
          transition-all duration-300
          ${sidebarCollapsed ? "w-14" : "w-56"}
        `}
        >
          {/* Collapse toggle */}
          <div
            className={`flex ${sidebarCollapsed ? "justify-center" : "justify-end"} p-2 border-b border-gray-100 dark:border-gray-700`}
          >
            <button
              onClick={() => setSidebarCollapsed((v) => !v)}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={
                sidebarCollapsed ? t("expand_sidebar") : t("collapse_sidebar")
              }
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              )}
            </button>
          </div>

          {/* Nav groups */}
          <div className="py-2">
            {NAV_GROUPS.map((group, gi) => (
              <div key={gi} className={gi > 0 ? "mt-1" : ""}>
                {/* Group label — only when expanded */}
                {group.label && !sidebarCollapsed && (
                  <p className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                    {group.label}
                  </p>
                )}
                {/* Divider when collapsed + has label */}
                {group.label && sidebarCollapsed && gi > 0 && (
                  <div className="mx-2 my-1.5 border-t border-gray-100 dark:border-gray-700" />
                )}

                {group.items.map((item) => {
                  const active = isActive(item);
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate(item.path)}
                      title={sidebarCollapsed ? t(item.label_key) : undefined}
                      className={`
                        w-full flex items-center py-2 text-sm font-medium transition-colors rounded-md mx-auto
                        ${sidebarCollapsed ? "justify-center w-10 px-0" : "px-3 gap-2.5"}
                        ${
                          active
                            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60 hover:text-gray-900 dark:hover:text-white"
                        }
                      `}
                      style={sidebarCollapsed ? {} : undefined}
                    >
                      <item.icon
                        className={`w-4 h-4 flex-shrink-0 ${active ? "text-blue-600 dark:text-blue-400" : ""}`}
                      />
                      {!sidebarCollapsed && (
                        <span className="truncate text-xs">
                          {t(item.label_key)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </nav>

        {/* ── Main content ── */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Routes>
              {/* Overview */}
              <Route
                path="/"
                element={
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {metricCards.map((card, idx) => (
                        <div key={idx} className="card overflow-hidden">
                          <div className="flex items-start justify-between mb-3">
                            <div
                              className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${card.iconBg}`}
                            >
                              {card.icon}
                            </div>
                            {card.trend && (
                              <span
                                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${card.trendUp ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400" : "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400"}`}
                              >
                                {card.trendUp ? "↑" : "↓"} {card.trend}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            {card.label}
                          </p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
                            {card.value}
                          </p>
                          <p className={`text-xs mt-0.5 ${card.subColor}`}>
                            {card.sub}
                          </p>
                          <div className="mt-3 -mx-1">
                            <ResponsiveContainer width="100%" height={40}>
                              <LineChart data={card.sparkData}>
                                <Line
                                  type="monotone"
                                  dataKey="v"
                                  stroke={card.sparkColor}
                                  strokeWidth={1.5}
                                  dot={false}
                                  isAnimationActive={false}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      <div className="card">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                          {t("error_trends")}
                        </h3>
                        <ResponsiveContainer width="100%" height={240}>
                          <AreaChart data={mockErrorData}>
                            <defs>
                              <linearGradient
                                id="errorGradient"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="5%"
                                  stopColor="#ef4444"
                                  stopOpacity={0.15}
                                />
                                <stop
                                  offset="95%"
                                  stopColor="#ef4444"
                                  stopOpacity={0}
                                />
                              </linearGradient>
                            </defs>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#e5e7eb"
                              className="dark:stroke-gray-700"
                            />
                            <XAxis
                              dataKey="time"
                              stroke="#9ca3af"
                              tick={{ fontSize: 11 }}
                            />
                            <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} />
                            <Tooltip
                              contentStyle={{
                                borderRadius: "0.5rem",
                                border: "1px solid #e5e7eb",
                                fontSize: 12,
                              }}
                            />
                            <Area
                              type="monotone"
                              dataKey="errors"
                              stroke="#ef4444"
                              strokeWidth={2}
                              fill="url(#errorGradient)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="card">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                          {t("log_distribution")}
                        </h3>
                        <ResponsiveContainer width="100%" height={240}>
                          <PieChart>
                            <Pie
                              data={metrics}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ level, percent }) =>
                                `${level} ${((percent || 0) * 100).toFixed(0)}%`
                              }
                              outerRadius={85}
                              innerRadius={40}
                              dataKey="count"
                              paddingAngle={2}
                            >
                              {metrics.map((e, i) => (
                                <Cell key={i} fill={getLevelColor(e.level)} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                borderRadius: "0.5rem",
                                border: "1px solid #e5e7eb",
                                fontSize: 12,
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <ErrorHeatmap logs={logs} />

                    <div className="card">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                        {t("system_health")}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                        {[
                          {
                            label: t("cpu_usage"),
                            value: systemHealth.cpu,
                            color: "bg-blue-500",
                          },
                          {
                            label: t("memory_usage"),
                            value: systemHealth.memory,
                            color: "bg-green-500",
                          },
                          {
                            label: t("disk_usage"),
                            value: systemHealth.disk,
                            color: "bg-yellow-500",
                          },
                          {
                            label: t("network"),
                            value: systemHealth.network,
                            color: "bg-purple-500",
                          },
                        ].map(({ label, value, color }) => (
                          <div key={label} className="text-center">
                            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                              {value}%
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                              {label}
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                              <div
                                className={`${color} h-1.5 rounded-full`}
                                style={{ width: `${value}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                }
              />

              {/* Logs */}
              <Route
                path="/logs"
                element={
                  <AdvancedLogs
                    onNavigateToTrace={() => {
                      navigate("/services/backend");
                      toast.success("Navegando para APM");
                    }}
                  />
                }
              />
              <Route
                path="/logs/:logId"
                element={
                  <AdvancedLogs
                    onNavigateToTrace={() => {
                      navigate("/services/backend");
                      toast.success("Navegando para APM");
                    }}
                  />
                }
              />

              {/* Errors */}
              <Route path="/errors" element={<ErrorMonitoring />} />
              <Route path="/errors/:logId" element={<ErrorMonitoring />} />

              {/* Performance */}
              <Route path="/performance" element={<Performance />} />

              {/* Services (unified) */}
              <Route path="/services" element={<ServicesMonitoring />} />
              <Route
                path="/services/:context"
                element={<ServicesMonitoring />}
              />

              {/* Legacy redirects → services */}
              <Route
                path="/apm"
                element={<Navigate to="/services/backend" replace />}
              />
              <Route
                path="/system"
                element={<Navigate to="/services/backend" replace />}
              />
              <Route
                path="/service-mesh"
                element={<Navigate to="/services/backend" replace />}
              />
              <Route
                path="/realtime"
                element={<Navigate to="/services/backend" replace />}
              />

              {/* Alerts */}
              <Route path="/alerts" element={<AlertSystem />} />
              <Route
                path="/incident-management"
                element={<IncidentManagement />}
              />

              {/* Tools */}
              <Route path="/custom-metrics" element={<CustomMetrics />} />
              <Route path="/dashboard-builder" element={<DashboardBuilder />} />

              {/* Admin */}
              <Route path="/applications" element={<Applications />} />
              <Route path="/security" element={<SecuritySystem />} />
              <Route path="/users" element={<AuthSystem />} />
              <Route path="/settings" element={<SettingsComponent />} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
