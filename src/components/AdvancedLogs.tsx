import {
  AlertTriangle,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Circle,
  Clock,
  Download,
  Filter,
  Info,
  Pause,
  Play,
  Search,
  X,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useMatch, useNavigate } from 'react-router-dom';
import { getLevelColors } from '../constants/colors';
import { useDrawer } from '../hooks/useDrawer';
import { useInfiniteLogs } from '../hooks/useLogs';
import { useSavedFilters } from '../hooks/useSavedFilters';
import { LogDrawer } from './LogDrawer';

export type Platform = 'web' | 'ios' | 'android' | 'backend' | 'other';

export interface StackFrame {
  filename: string;
  function: string;
  lineno?: number;
  colno?: number;
  in_app: boolean;
  module?: string;
  context_line?: string;
  pre_context?: string[];
  post_context?: string[];
}

export type BreadcrumbType = 'navigation' | 'http' | 'ui' | 'console' | 'error' | 'query' | 'lifecycle';

export interface Breadcrumb {
  timestamp: string;
  type: BreadcrumbType;
  category: string;
  message: string;
  level?: 'debug' | 'info' | 'warn' | 'error';
  data?: Record<string, string | number | boolean>;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;

  // Origem
  app: string;
  platform: Platform;
  release?: string;
  environment?: string;
  fingerprint?: string;

  // Usuário / sessão
  userId?: string;
  sessionId?: string;
  userEmail?: string;
  userIp?: string;

  // Erro estruturado
  errorType?: string;
  stackTrace?: string;
  stackFrames?: StackFrame[];
  /** Cadeia de componentes React no momento do crash (só presente em erros capturados por DeepEyesErrorBoundary). */
  componentStack?: string;

  // Breadcrumbs — trilha de eventos antes do erro
  breadcrumbs?: Breadcrumb[];

  // Contexto HTTP
  http?: {
    method?: string;
    url?: string;
    statusCode?: number;
    responseTime?: number;
    headers?: Record<string, string>;
    queryString?: string;
    bodySize?: number;
  };

  // Contexto de dispositivo / ambiente
  device?: {
    os?: string;
    osVersion?: string;
    browser?: string;
    browserVersion?: string;
    model?: string;
    manufacturer?: string;
    appVersion?: string;
    screenResolution?: string;
    locale?: string;
    timezone?: string;
    online?: boolean;
    memoryMb?: number;
    freeMemoryMb?: number;
    simulator?: boolean;
    orientation?: 'portrait' | 'landscape';
    battery?: number;
    batteryState?: 'charging' | 'full' | 'unplugged' | 'unknown';
    arch?: string;
    brand?: string;
    screenDensity?: number;
    totalStorageMb?: number;
    freeStorageMb?: number;
    networkType?: 'wifi' | 'cellular' | 'ethernet' | 'vpn' | 'none' | 'unknown';
    carrier?: string;
    ipAddress?: string;
    rooted?: boolean;
    deviceId?: string;
  };

  // SDK que capturou o evento
  sdk?: {
    name: string;
    version: string;
    integrations?: string[];
  };

  // Tags customizadas
  tags?: Record<string, string>;

  // Rastreamento
  traceId?: string;
  spanId?: string;

  duration?: number;
  metadata: Record<string, unknown>;
}

interface LogFilter {
  level: string[];
  platform: Platform[];
  timeRange: { start: string; end: string };
  search: string;
  hasError: boolean;
  hasTraceId: boolean;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const PLATFORM_SOURCES: {
  platform: Platform;
  app: string;
  errorTypes: string[];
  stackTemplate: (err: string) => string;
  device?: () => LogEntry['device'];
  messages: string[];
}[] = [
  {
    platform: 'web',
    app: 'my-app-web',
    errorTypes: ['TypeError', 'ReferenceError', 'SyntaxError', 'NetworkError', 'ChunkLoadError'],
    stackTemplate: (err) =>
      `${err}: Cannot read properties of undefined (reading 'id')\n    at UserProfile (src/components/UserProfile.tsx:42:18)\n    at renderWithHooks (react-dom.development.js:14985:18)\n    at mountIndeterminateComponent (react-dom.development.js:17811:13)`,
    device: () => ({
      browser: ['Chrome', 'Safari', 'Firefox', 'Edge'][Math.floor(Math.random() * 4)],
      browserVersion: `${Math.floor(Math.random() * 20) + 110}.0`,
      os: ['Windows 11', 'macOS 14', 'Ubuntu 22.04'][Math.floor(Math.random() * 3)],
    }),
    messages: [
      'Unhandled promise rejection in checkout flow',
      'Component unmounted before fetch completed',
      'Failed to load chunk: vendor.js',
      'ResizeObserver loop limit exceeded',
      'Network request failed: /api/products',
      'Hydration mismatch in SSR render',
      'Cannot read properties of null (reading "addEventListener")',
    ],
  },
  {
    platform: 'ios',
    app: 'my-app-ios',
    errorTypes: ['NullPointerException', 'EXC_BAD_ACCESS', 'NSInternalInconsistencyException', 'Signal SIGSEGV', 'Swift.DecodingError'],
    stackTemplate: (err) =>
      `Fatal error: ${err}\n    0 MyApp             0x00000001004e2a5c UserProfileViewController.viewDidLoad() + 124\n    1 UIKitCore         0x000000018c3d4210 UIViewController.loadViewIfRequired() + 172\n    2 UIKitCore         0x000000018c3d41cc UIViewController.view.getter + 76`,
    device: () => ({
      os: 'iOS',
      osVersion: ['16.6', '17.0', '17.2', '17.4'][Math.floor(Math.random() * 4)],
      model: ['iPhone 13', 'iPhone 14 Pro', 'iPhone 15', 'iPhone 15 Pro Max', 'iPad Air'][Math.floor(Math.random() * 5)],
      appVersion: `2.${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 10)}`,
    }),
    messages: [
      'App crashed: unexpected nil while unwrapping optional',
      'Memory warning received — level 2',
      'URLSession task failed with error: NSURLErrorTimedOut',
      'Decoding error: key "userId" not found in JSON response',
      'CoreData save failed: constraint violation',
      'Push notification token registration failed',
      'Background task expired before completion',
    ],
  },
  {
    platform: 'android',
    app: 'my-app-android',
    errorTypes: ['NullPointerException', 'IllegalStateException', 'OutOfMemoryError', 'NetworkOnMainThreadException', 'JsonParseException'],
    stackTemplate: (err) =>
      `${err}\n    at com.myapp.ui.UserFragment.onViewCreated(UserFragment.kt:87)\n    at androidx.fragment.app.FragmentManager.dispatchViewCreated(FragmentManager.java:2795)\n    at androidx.fragment.app.Fragment.performViewCreated(Fragment.java:3128)`,
    device: () => ({
      os: 'Android',
      osVersion: ['12', '13', '14'][Math.floor(Math.random() * 3)],
      model: ['Samsung Galaxy S24', 'Pixel 8', 'Xiaomi 13', 'OnePlus 11', 'Motorola Edge'][Math.floor(Math.random() * 5)],
      appVersion: `3.${Math.floor(Math.random() * 4)}.${Math.floor(Math.random() * 15)}`,
    }),
    messages: [
      'NullPointerException in UserRepository.fetchProfile()',
      'ANR detected: main thread blocked for 5200ms',
      'OOM — heap size exceeded on image loading',
      'Retrofit call failed: SocketTimeoutException',
      'Firebase Crashlytics: unhandled exception in background thread',
      'RecyclerView: inconsistency detected — invalid view holder adapter',
      'Activity leaked: WindowManager$BadTokenException',
    ],
  },
  {
    platform: 'backend',
    app: 'api-gateway',
    errorTypes: ['DatabaseError', 'TimeoutError', 'AuthenticationError', 'RateLimitError', 'ValidationError'],
    stackTemplate: (err) =>
      `${err}: Connection pool exhausted\n    at Pool.connect (node_modules/pg-pool/index.js:54:22)\n    at UserRepository.findById (src/repositories/UserRepository.ts:31:18)\n    at UserService.getProfile (src/services/UserService.ts:67:30)`,
    device: undefined,
    messages: [
      'Database connection pool exhausted',
      'Redis cache miss — fallback to DB query',
      'JWT token expired for userId: usr_4829',
      'Rate limit exceeded: 429 Too Many Requests',
      'Unhandled rejection in message queue consumer',
      'gRPC stream closed unexpectedly by peer',
      'S3 upload failed: AccessDenied on bucket media-assets',
    ],
  },
];

const TRACE_POOL = Array.from({ length: 15 }, () => `trace-${Math.random().toString(36).substr(2, 9)}`);
const RELEASES = Array.from({ length: 6 }, (_, i) => `v2.${i + 1}.${Math.floor(Math.random() * 20)}`);

function generateDevice(platform: Platform): LogEntry['device'] {
  const r = () => Math.floor(Math.random() * 10);
  switch (platform) {
    case 'web': {
      const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge'];
      const oses = ['Windows 11', 'macOS 14', 'Ubuntu 22.04'];
      return {
        browser: browsers[r() % 4], browserVersion: `${110 + r() * 2}.0.${r()}`,
        os: oses[r() % 3],
        screenResolution: ['1920x1080', '2560x1440', '1440x900', '1280x800'][r() % 4],
        locale: ['pt-BR', 'en-US', 'es-ES'][r() % 3],
        timezone: ['America/Sao_Paulo', 'America/New_York', 'Europe/London'][r() % 3],
        online: true, memoryMb: [4096, 8192, 16384][r() % 3], arch: 'x86_64',
      };
    }
    case 'ios': {
      const models = ['iPhone 13', 'iPhone 14 Pro', 'iPhone 15', 'iPhone 15 Pro Max', 'iPad Air'];
      return {
        os: 'iOS', manufacturer: 'Apple',
        osVersion: ['16.6', '17.0', '17.2', '17.4'][r() % 4],
        model: models[r() % 5],
        appVersion: `2.${r() % 5}.${r()}`,
        screenResolution: ['390x844', '393x852', '430x932', '768x1024'][r() % 4],
        locale: 'pt-BR', timezone: 'America/Sao_Paulo',
        online: true, battery: 20 + r() * 8,
        orientation: r() > 7 ? 'landscape' : 'portrait',
        simulator: false, arch: 'arm64',
      };
    }
    case 'android': {
      const models = ['Samsung Galaxy S24', 'Pixel 8', 'Xiaomi 13', 'OnePlus 11', 'Motorola Edge'];
      const manufacturers = ['Samsung', 'Google', 'Xiaomi', 'OnePlus', 'Motorola'];
      const idx = r() % 5;
      return {
        os: 'Android', manufacturer: manufacturers[idx],
        osVersion: ['12', '13', '14'][r() % 3],
        model: models[idx],
        appVersion: `3.${r() % 4}.${r()}`,
        screenResolution: ['1080x2340', '1080x2400', '1440x3088'][r() % 3],
        locale: 'pt-BR', timezone: 'America/Sao_Paulo',
        online: true, memoryMb: [4096, 6144, 8192][r() % 3],
        battery: 10 + r() * 9, orientation: 'portrait', arch: 'arm64-v8a',
      };
    }
    default:
      return undefined;
  }
}

function generateStackFrames(platform: Platform): StackFrame[] {
  switch (platform) {
    case 'web':
      return [
        { filename: 'src/pages/CheckoutPage.tsx', function: 'handleSubmit', lineno: 87, colno: 12, in_app: true,
          pre_context: ['  async function handleSubmit(e: FormEvent) {', '    e.preventDefault();', '    setLoading(true);'],
          context_line: '    const order = await orderService.create(cartItems);',
          post_context: ['    navigate(`/confirmation/${order.id}`);', '  } catch (err) {', '    setError(err.message);'] },
        { filename: 'src/services/OrderService.ts', function: 'OrderService.create', lineno: 134, colno: 22, in_app: true,
          pre_context: ['  async create(items: CartItem[]): Promise<Order> {', '    const payload = { items, userId: this.auth.userId };', ''],
          context_line: '    const { data } = await this.http.post<Order>(\'/api/orders\', payload);',
          post_context: ['    return data;', '  }', ''] },
        { filename: 'src/utils/httpClient.ts', function: 'HttpClient.post', lineno: 56, colno: 10, in_app: true,
          context_line: '    return this.instance.post(url, body, { headers: this.defaultHeaders });' },
        { filename: 'node_modules/axios/lib/core/Axios.js', function: 'Axios.request', lineno: 130, colno: 18, in_app: false, module: 'axios' },
        { filename: 'node_modules/axios/lib/adapters/xhr.js', function: 'xhrAdapter', lineno: 251, in_app: false, module: 'axios' },
      ];
    case 'ios':
      return [
        { filename: 'MyApp/Checkout/CheckoutViewController.swift', function: 'placeOrderTapped(_:)', lineno: 124, in_app: true,
          pre_context: ['    @IBAction func placeOrderTapped(_ sender: UIButton) {', '        guard let cart = currentCart else { return }', '        OrderService.shared.submit(cart: cart) { [weak self] result in'],
          context_line: '            let order = try result.get()',
          post_context: ['            self?.navigateToConfirmation(order)', '        }', '    }'] },
        { filename: 'MyApp/Services/OrderService.swift', function: 'submit(cart:completion:)', lineno: 67, in_app: true,
          context_line: '        APIClient.shared.post("/api/orders", body: cart.asJSON(), completion: completion)' },
        { filename: 'MyApp/Network/APIClient.swift', function: 'post(_:body:completion:)', lineno: 89, in_app: true,
          context_line: '        let decoded = try JSONDecoder().decode(T.self, from: data)' },
        { filename: 'Alamofire/Session.swift', function: 'Session.perform(_:)', lineno: 456, in_app: false, module: 'Alamofire' },
        { filename: 'Foundation/NSURLSession', function: 'URLSession.dataTask(with:completionHandler:)', in_app: false, module: 'Foundation' },
      ];
    case 'android':
      return [
        { filename: 'com/myapp/ui/checkout/CheckoutFragment.kt', function: 'onPlaceOrderClicked', lineno: 156, in_app: true,
          pre_context: ['    private fun onPlaceOrderClicked() {', '        lifecycleScope.launch {', '            showLoading(true)'],
          context_line: '            val order = orderRepository.createOrder(cart).getOrThrow()',
          post_context: ['            navigateToConfirmation(order)', '        }', '    }'] },
        { filename: 'com/myapp/repository/OrderRepository.kt', function: 'createOrder', lineno: 78, in_app: true,
          context_line: '        return apiService.createOrder(cart.toRequest()).map { it.toDomain() }' },
        { filename: 'com/myapp/network/OrderApiService.kt', function: 'createOrder', lineno: 234, in_app: true,
          context_line: '    @POST("/api/orders") suspend fun createOrder(@Body req: CreateOrderRequest): Response<OrderDto>' },
        { filename: 'retrofit2/OkHttpCall.java', function: 'OkHttpCall.execute', lineno: 128, in_app: false, module: 'retrofit2' },
        { filename: 'okhttp3/internal/connection/RealCall.kt', function: 'RealCall.execute', lineno: 167, in_app: false, module: 'okhttp3' },
      ];
    case 'backend':
      return [
        { filename: 'src/handlers/orders.ts', function: 'createOrderHandler', lineno: 45, colno: 20, in_app: true,
          pre_context: ['export async function createOrderHandler(req: Request, res: Response, next: NextFunction) {', '  const { userId, items } = req.body;', '  try {'],
          context_line: '    const order = await orderService.create(userId, items);',
          post_context: ['    res.status(201).json(order);', '  } catch (err) {', '    next(err);'] },
        { filename: 'src/services/OrderService.ts', function: 'OrderService.create', lineno: 134, colno: 24, in_app: true,
          context_line: '    const conn = await this.pool.connect();' },
        { filename: 'src/database/Pool.ts', function: 'Pool.connect', lineno: 67, colno: 14, in_app: true,
          context_line: "    if (this._connections >= this._max) throw new PoolError('exhausted');" },
        { filename: 'node_modules/pg-pool/index.js', function: 'Pool.connect', lineno: 54, colno: 22, in_app: false, module: 'pg-pool' },
        { filename: 'node_modules/pg/lib/client.js', function: 'Client.connect', lineno: 89, colno: 10, in_app: false, module: 'pg' },
      ];
    default:
      return [];
  }
}

function generateBreadcrumbs(platform: Platform, errorTime: Date): Breadcrumb[] {
  const ts = (ms: number): string => new Date(errorTime.getTime() - ms).toISOString();
  switch (platform) {
    case 'web':
      return [
        { timestamp: ts(28000), type: 'navigation', category: 'navigation', message: '/ → /products', level: 'info' },
        { timestamp: ts(24000), type: 'http', category: 'xhr', message: 'GET /api/products', level: 'info', data: { status_code: 200, duration_ms: 67 } },
        { timestamp: ts(20000), type: 'ui', category: 'ui.click', message: 'a.product-card[data-id="42"]', level: 'info' },
        { timestamp: ts(18000), type: 'navigation', category: 'navigation', message: '/products → /products/42', level: 'info' },
        { timestamp: ts(14000), type: 'http', category: 'xhr', message: 'GET /api/products/42', level: 'info', data: { status_code: 200, duration_ms: 34 } },
        { timestamp: ts(12000), type: 'ui', category: 'ui.click', message: 'button#add-to-cart', level: 'info' },
        { timestamp: ts(10000), type: 'http', category: 'xhr', message: 'POST /api/cart', level: 'info', data: { status_code: 200, duration_ms: 123 } },
        { timestamp: ts(9000), type: 'console', category: 'console.info', message: 'Item added to cart', level: 'info' },
        { timestamp: ts(7000), type: 'navigation', category: 'navigation', message: '/products/42 → /checkout', level: 'info' },
        { timestamp: ts(4000), type: 'http', category: 'xhr', message: 'GET /api/cart/validate', level: 'info', data: { status_code: 200, duration_ms: 89 } },
        { timestamp: ts(2000), type: 'ui', category: 'ui.click', message: 'button#place-order', level: 'info' },
        { timestamp: ts(800), type: 'http', category: 'xhr', message: 'POST /api/orders', level: 'error', data: { status_code: 500, duration_ms: 1890 } },
        { timestamp: ts(100), type: 'console', category: 'console.error', message: 'Request failed with status 500', level: 'error' },
        { timestamp: ts(0), type: 'error', category: 'exception', message: 'Unhandled exception captured', level: 'error' },
      ];
    case 'ios':
      return [
        { timestamp: ts(30000), type: 'lifecycle', category: 'app.lifecycle', message: 'applicationDidBecomeActive', level: 'info' },
        { timestamp: ts(26000), type: 'lifecycle', category: 'ui.lifecycle', message: 'viewDidLoad — HomeViewController', level: 'info' },
        { timestamp: ts(22000), type: 'navigation', category: 'navigation', message: 'HomeViewController → ProductListViewController', level: 'info' },
        { timestamp: ts(18000), type: 'http', category: 'url_session', message: 'GET /api/products', level: 'info', data: { status_code: 200, duration_ms: 234 } },
        { timestamp: ts(14000), type: 'ui', category: 'user.interaction', message: 'tap — UITableViewCell index:3', level: 'info' },
        { timestamp: ts(12000), type: 'navigation', category: 'navigation', message: 'ProductListViewController → ProductDetailViewController', level: 'info' },
        { timestamp: ts(9000), type: 'http', category: 'url_session', message: 'GET /api/products/3', level: 'info', data: { status_code: 200, duration_ms: 78 } },
        { timestamp: ts(7000), type: 'ui', category: 'user.interaction', message: 'tap — UIButton "Add to Cart"', level: 'info' },
        { timestamp: ts(5000), type: 'http', category: 'url_session', message: 'POST /api/cart', level: 'info', data: { status_code: 200, duration_ms: 145 } },
        { timestamp: ts(2500), type: 'ui', category: 'user.interaction', message: 'tap — UIButton "Checkout"', level: 'info' },
        { timestamp: ts(1200), type: 'lifecycle', category: 'ui.lifecycle', message: 'viewDidLoad — CheckoutViewController', level: 'info' },
        { timestamp: ts(400), type: 'http', category: 'url_session', message: 'POST /api/checkout', level: 'error', data: { status_code: 500, duration_ms: 3400 } },
        { timestamp: ts(0), type: 'error', category: 'exception', message: 'Unhandled exception captured', level: 'error' },
      ];
    case 'android':
      return [
        { timestamp: ts(30000), type: 'lifecycle', category: 'app.lifecycle', message: 'Application.onCreate', level: 'info' },
        { timestamp: ts(27000), type: 'lifecycle', category: 'activity.lifecycle', message: 'MainActivity.onResume', level: 'info' },
        { timestamp: ts(23000), type: 'navigation', category: 'navigation', message: 'MainActivity → ProductListActivity', level: 'info' },
        { timestamp: ts(19000), type: 'http', category: 'okhttp', message: 'GET /api/products', level: 'info', data: { status_code: 200, duration_ms: 312 } },
        { timestamp: ts(15000), type: 'ui', category: 'user.interaction', message: 'tap — RecyclerView item:2', level: 'info' },
        { timestamp: ts(13000), type: 'navigation', category: 'navigation', message: 'ProductListActivity → ProductDetailActivity', level: 'info' },
        { timestamp: ts(10000), type: 'http', category: 'okhttp', message: 'GET /api/products/2', level: 'info', data: { status_code: 200, duration_ms: 89 } },
        { timestamp: ts(8000), type: 'ui', category: 'user.interaction', message: 'tap — addToCartButton', level: 'info' },
        { timestamp: ts(5000), type: 'http', category: 'okhttp', message: 'POST /api/cart', level: 'info', data: { status_code: 200, duration_ms: 167 } },
        { timestamp: ts(3000), type: 'ui', category: 'user.interaction', message: 'tap — checkoutButton', level: 'info' },
        { timestamp: ts(1500), type: 'navigation', category: 'navigation', message: 'ProductDetailActivity → CheckoutActivity', level: 'info' },
        { timestamp: ts(500), type: 'http', category: 'okhttp', message: 'POST /api/checkout/validate', level: 'warn', data: { status_code: 422, duration_ms: 450 } },
        { timestamp: ts(0), type: 'error', category: 'exception', message: 'Unhandled exception captured', level: 'error' },
      ];
    case 'backend':
      return [
        { timestamp: ts(25000), type: 'http', category: 'http.server', message: 'POST /api/orders', level: 'info' },
        { timestamp: ts(22000), type: 'query', category: 'db.query', message: 'SELECT * FROM users WHERE id = $1', level: 'info', data: { duration_ms: 4 } },
        { timestamp: ts(20000), type: 'query', category: 'cache', message: 'GET user:preferences:4829', level: 'info', data: { duration_ms: 1 } },
        { timestamp: ts(18000), type: 'query', category: 'db.query', message: 'SELECT * FROM cart_items WHERE user_id = $1', level: 'info', data: { duration_ms: 12 } },
        { timestamp: ts(15000), type: 'query', category: 'db.query', message: 'BEGIN TRANSACTION', level: 'info', data: { duration_ms: 0 } },
        { timestamp: ts(12000), type: 'http', category: 'http.client', message: 'POST https://payment-gw.internal/charge', level: 'warn', data: { status_code: 200, duration_ms: 1234 } },
        { timestamp: ts(8000), type: 'query', category: 'db.query', message: 'INSERT INTO orders (user_id, total, status) VALUES ($1, $2, $3)', level: 'info', data: { duration_ms: 3 } },
        { timestamp: ts(5000), type: 'query', category: 'cache', message: 'SET order:latest:4829 EX 300', level: 'info', data: { duration_ms: 1 } },
        { timestamp: ts(3000), type: 'http', category: 'http.client', message: 'POST https://notifications.internal/send', level: 'info', data: { status_code: 200, duration_ms: 45 } },
        { timestamp: ts(1000), type: 'query', category: 'db.query', message: 'ROLLBACK TRANSACTION', level: 'warn', data: { duration_ms: 1 } },
        { timestamp: ts(0), type: 'error', category: 'exception', message: 'Unhandled exception captured', level: 'error' },
      ];
    default:
      return [];
  }
}

export function generateMockLogs(count = 100): LogEntry[] {
  const levels: LogEntry['level'][] = ['debug', 'info', 'warn', 'error', 'fatal'];
  const levelWeights = [0.1, 0.25, 0.25, 0.3, 0.1];
  const weightedLevel = () => {
    const r = Math.random();
    let acc = 0;
    for (let i = 0; i < levelWeights.length; i++) {
      acc += levelWeights[i];
      if (r < acc) return levels[i];
    }
    return 'info';
  };

  return Array.from({ length: count }, (_, i) => {
    const src = PLATFORM_SOURCES[Math.floor(Math.random() * PLATFORM_SOURCES.length)];
    const level = weightedLevel();
    const timestamp = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000);
    const isError = level === 'error' || level === 'fatal';
    const errorType = isError ? src.errorTypes[Math.floor(Math.random() * src.errorTypes.length)] : undefined;
    const traceId = Math.random() > 0.35 ? TRACE_POOL[Math.floor(Math.random() * TRACE_POOL.length)] : undefined;
    const hasHttp = src.platform === 'backend' || (src.platform === 'web' && Math.random() > 0.4);
    const release = RELEASES[Math.floor(Math.random() * RELEASES.length)];
    const environment = Math.random() > 0.2 ? 'production' : 'staging';
    const userId = Math.random() > 0.25 ? `usr_${Math.floor(Math.random() * 9000) + 1000}` : undefined;

    return {
      id: `log-${i}-${Date.now()}`,
      timestamp: timestamp.toISOString(),
      level,
      message: src.messages[Math.floor(Math.random() * src.messages.length)],
      app: src.app,
      platform: src.platform,
      release,
      environment,
      fingerprint: isError && errorType ? `${src.platform}:${errorType}` : undefined,

      userId,
      userEmail: userId ? `user${userId.slice(4)}@example.com` : undefined,
      userIp: userId ? `${100 + Math.floor(Math.random() * 155)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.1` : undefined,
      sessionId: Math.random() > 0.4 ? `sess_${Math.random().toString(36).substr(2, 8)}` : undefined,

      errorType,
      stackTrace: isError ? src.stackTemplate(errorType!) : undefined,
      stackFrames: isError ? generateStackFrames(src.platform) : undefined,
      breadcrumbs: isError ? generateBreadcrumbs(src.platform, timestamp) : undefined,

      http: hasHttp ? {
        method: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'][Math.floor(Math.random() * 5)],
        url: ['/api/users', '/api/feed', '/api/checkout', '/api/auth/refresh', '/api/media/upload'][Math.floor(Math.random() * 5)],
        statusCode: isError ? [400, 401, 403, 404, 429, 500, 503][Math.floor(Math.random() * 7)] : 200,
        responseTime: Math.floor(Math.random() * 2000) + 30,
        queryString: Math.random() > 0.6 ? 'page=1&limit=20' : undefined,
        bodySize: Math.floor(Math.random() * 8000) + 100,
        headers: { 'content-type': 'application/json', 'x-request-id': Math.random().toString(36).substr(2, 12) },
      } : undefined,

      device: generateDevice(src.platform),

      sdk: {
        name: `deep-eyes-sdk-${src.platform}`,
        version: `0.2.${Math.floor(Math.random() * 9)}`,
        integrations: src.platform === 'web'
          ? ['React', 'Router', 'Axios']
          : src.platform === 'backend'
          ? ['Express', 'pg', 'Redis']
          : ['Http', 'Crash', 'Performance'],
      },

      tags: {
        environment,
        release,
        platform: src.platform,
        ...(isError && errorType ? { error_type: errorType } : {}),
      },

      traceId,
      spanId: traceId ? `span_${Math.random().toString(36).substr(2, 6)}` : undefined,
      duration: Math.floor(Math.random() * 1500) + 10,
      metadata: { sdkVersion: `deep-eyes-sdk@0.2.${Math.floor(Math.random() * 9)}`, environment, release },
    };
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const PLATFORM_META: Record<Platform, { label: string; color: string }> = {
  web:      { label: 'Web',     color: '#3b82f6' },
  ios:      { label: 'iOS',     color: '#6b7280' },
  android:  { label: 'Android', color: '#10b981' },
  backend:  { label: 'Backend', color: '#8b5cf6' },
  other:    { label: 'Other',   color: '#f59e0b' },
};

function PlatformBadge({ platform }: { platform: Platform }) {
  const meta = PLATFORM_META[platform];
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium"
      style={{ background: meta.color + '18', color: meta.color }}
    >
      {meta.label}
    </span>
  );
}

function highlightMatch(text: string, search: string) {
  if (!search) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(search.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 dark:bg-yellow-700 text-inherit rounded-sm px-0.5">
        {text.slice(idx, idx + search.length)}
      </mark>
      {text.slice(idx + search.length)}
    </>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export const AdvancedLogs: React.FC<{ onNavigateToTrace?: (traceId: string) => void }> = ({
  onNavigateToTrace,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const match = useMatch('/logs/:logId');
  const logId = match?.params.logId;

  const { saved: savedFilters, save: saveFilter, remove: removeSavedFilter } = useSavedFilters();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveFilterName, setSaveFilterName] = useState('');

  const { data: logsPages, isLoading: logsLoading, refetch: refetchLogs, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteLogs({});
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<LogFilter>({
    level: [],
    platform: [],
    timeRange: {
      start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString(),
    },
    search: '',
    hasError: false,
    hasTraceId: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState<Set<string>>(new Set());
  const [logStats, setLogStats] = useState({ total: 0, errors: 0, warnings: 0, avgDuration: 0 });
  const [newLogIds, setNewLogIds] = useState<Set<string>>(new Set());

  const [isLiveTail, setIsLiveTail] = useState(false);
  const [newLogCount, setNewLogCount] = useState(0);
  const liveTailRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync API data into local state
  useEffect(() => {
    if (logsPages?.pages) setLogs(logsPages.pages.flatMap(p => p.logs));
  }, [logsPages]);

  const drawer = useDrawer<LogEntry>();
  const relatedLogs = drawer.data?.traceId
    ? logs.filter(l => l.traceId === drawer.data!.traceId && l.id !== drawer.data!.id)
    : [];

  // Sync URL param → drawer
  useEffect(() => {
    if (logId) {
      const log = logs.find(l => l.id === logId);
      if (log) drawer.open(log);
      else navigate('/logs', { replace: true });
    } else {
      drawer.close();
    }
  }, [logId, logs]);

  // Filter
  useEffect(() => {
    let filtered = logs;
    if (filter.level.length > 0) filtered = filtered.filter(l => filter.level.includes(l.level));
    if (filter.platform.length > 0) filtered = filtered.filter(l => filter.platform.includes(l.platform));
    if (!isLiveTail) {
      filtered = filtered.filter(l => {
        const ts = new Date(l.timestamp).getTime();
        return ts >= new Date(filter.timeRange.start).getTime() && ts <= new Date(filter.timeRange.end).getTime();
      });
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      filtered = filtered.filter(l =>
        l.message.toLowerCase().includes(q) ||
        l.app.toLowerCase().includes(q) ||
        l.errorType?.toLowerCase().includes(q) ||
        l.traceId?.toLowerCase().includes(q) ||
        l.userId?.toLowerCase().includes(q)
      );
    }
    if (filter.hasError) filtered = filtered.filter(l => l.level === 'error' || l.level === 'fatal');
    if (filter.hasTraceId) filtered = filtered.filter(l => !!l.traceId);

    setFilteredLogs(filtered);
    setLogStats({
      total: filtered.length,
      errors: filtered.filter(l => l.level === 'error' || l.level === 'fatal').length,
      warnings: filtered.filter(l => l.level === 'warn').length,
      avgDuration: filtered.length > 0 ? filtered.reduce((s, l) => s + (l.duration || 0), 0) / filtered.length : 0,
    });
  }, [logs, filter, isLiveTail]);

  // Live tail
  const startLiveTail = useCallback(() => {
    setNewLogCount(0);
    liveTailRef.current = setInterval(async () => {
      const result = await refetchLogs();
      const fresh = result.data?.pages.flatMap(p => p.logs) ?? [];
      setLogs(prev => {
        const existingIds = new Set(prev.map(l => l.id));
        const incoming = fresh.filter(l => !existingIds.has(l.id));
        if (incoming.length > 0) {
          const ids = new Set(incoming.map(l => l.id));
          setNewLogIds(ids);
          setNewLogCount(c => c + incoming.length);
          setTimeout(() => setNewLogIds(new Set()), 1500);
          return [...incoming, ...prev].slice(0, 500);
        }
        return prev;
      });
    }, 5000);
  }, [refetchLogs]);

  const stopLiveTail = useCallback(() => {
    if (liveTailRef.current) { clearInterval(liveTailRef.current); liveTailRef.current = null; }
  }, []);

  useEffect(() => {
    if (isLiveTail) startLiveTail(); else { stopLiveTail(); setNewLogCount(0); }
    return stopLiveTail;
  }, [isLiveTail, startLiveTail, stopLiveTail]);

  const toggleLogSelection = (logId: string) => {
    setSelectedLogs(prev => {
      const next = new Set(prev);
      next.has(logId) ? next.delete(logId) : next.add(logId);
      return next;
    });
  };

  const exportLogs = () => {
    const toExport = selectedLogs.size > 0
      ? filteredLogs.filter(l => selectedLogs.has(l.id))
      : filteredLogs;
    const csv = [
      'timestamp,level,platform,app,message,errorType,userId,traceId,duration',
      ...toExport.map(l =>
        `${l.timestamp},${l.level},${l.platform},${l.app},"${l.message}",${l.errorType || ''},${l.userId || ''},${l.traceId || ''},${l.duration || ''}`
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t('logs_exported_successfully'));
  };

  const activeFilterCount =
    filter.level.length + filter.platform.length + (filter.hasError ? 1 : 0) + (filter.hasTraceId ? 1 : 0);

  if (logsLoading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Carregando logs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white whitespace-nowrap">{t('advanced_logs')}</h2>

        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
          <input
            type="text"
            placeholder="Buscar por mensagem, app, trace ID, usuário..."
            value={filter.search}
            onChange={e => setFilter({ ...filter, search: e.target.value })}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          <button
            onClick={() => setIsLiveTail(v => !v)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              isLiveTail
                ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                : 'btn-secondary'
            }`}
          >
            {isLiveTail ? (
              <>
                <Circle className="w-2.5 h-2.5 fill-red-500 text-red-500 animate-pulse" />
                <Pause className="w-3 h-3" />
                <span>Live</span>
                {newLogCount > 0 && (
                  <span className="px-1 py-0.5 text-xs bg-red-500 text-white rounded-full leading-none">+{newLogCount}</span>
                )}
              </>
            ) : (
              <><Play className="w-3 h-3" /><span>Live Tail</span></>
            )}
          </button>

          <button
            onClick={() => setShowFilters(v => !v)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              showFilters
                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800'
                : 'btn-secondary'
            }`}
          >
            <Filter className="w-3 h-3" />
            <span>{t('filters')}</span>
            {activeFilterCount > 0 && (
              <span className="px-1 bg-primary-500 text-white rounded-full text-xs leading-none">{activeFilterCount}</span>
            )}
            {showFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <button
            onClick={() => { setShowSaveDialog(v => !v); setSaveFilterName(''); }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium btn-secondary"
            title="Save current filters"
          >
            <Bookmark className="w-3 h-3" />
            <span>Save</span>
          </button>

          <button onClick={exportLogs} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium btn-primary">
            <Download className="w-3 h-3" />
            <span>{t('export')}</span>
          </button>
        </div>
      </div>

      {/* Save filter dialog */}
      {showSaveDialog && (
        <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <Bookmark className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          <input
            autoFocus
            value={saveFilterName}
            onChange={e => setSaveFilterName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && saveFilterName.trim()) {
                saveFilter(saveFilterName.trim(), {
                  level: filter.level.join(','),
                  platform: filter.platform.join(','),
                  search: filter.search,
                  hasError: filter.hasError ? '1' : '',
                  hasTraceId: filter.hasTraceId ? '1' : '',
                });
                setShowSaveDialog(false);
                setSaveFilterName('');
              }
              if (e.key === 'Escape') setShowSaveDialog(false);
            }}
            placeholder="Filter name… (Enter to save)"
            className="flex-1 text-xs bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400"
          />
          <button onClick={() => setShowSaveDialog(false)}><X className="w-3.5 h-3.5 text-gray-400" /></button>
        </div>
      )}

      {/* Saved filter chips */}
      {savedFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">Saved:</span>
          {savedFilters.map(sf => (
            <span
              key={sf.id}
              className="group inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-full text-xs text-blue-700 dark:text-blue-300 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/50"
              onClick={() => setFilter({
                ...filter,
                level: sf.filters.level ? sf.filters.level.split(',') : [],
                platform: (sf.filters.platform ? sf.filters.platform.split(',') : []) as any,
                search: sf.filters.search ?? '',
                hasError: sf.filters.hasError === '1',
                hasTraceId: sf.filters.hasTraceId === '1',
              })}
            >
              {sf.name}
              <button
                onClick={e => { e.stopPropagation(); removeSavedFilter(sf.id); }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Stats bar */}
      <div className="flex items-center gap-3 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs flex-wrap">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-gray-500 dark:text-gray-400">{t('total_logs')}</span>
          <span className="font-semibold text-gray-900 dark:text-white">{logStats.total}</span>
        </div>
        <div className="w-px h-3.5 bg-gray-200 dark:bg-gray-600" />
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
          <span className="text-gray-500 dark:text-gray-400">{t('errors')}</span>
          <span className="font-semibold text-red-600">{logStats.errors}</span>
        </div>
        <div className="w-px h-3.5 bg-gray-200 dark:bg-gray-600" />
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />
          <span className="text-gray-500 dark:text-gray-400">{t('warnings')}</span>
          <span className="font-semibold text-yellow-600">{logStats.warnings}</span>
        </div>
        <div className="w-px h-3.5 bg-gray-200 dark:bg-gray-600" />
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-green-500" />
          <span className="text-gray-500 dark:text-gray-400">{t('avg_response')}</span>
          <span className="font-semibold text-gray-900 dark:text-white">{Math.round(logStats.avgDuration)}ms</span>
        </div>
        <div className="w-px h-3.5 bg-gray-200 dark:bg-gray-600" />
        {/* Level legend */}
        <div className="flex items-center gap-2">
          {(['debug', 'info', 'warn', 'error', 'fatal'] as const).map(lvl => (
            <span key={lvl} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ background: getLevelColors(lvl).bar }} />
              <span className="text-gray-400 dark:text-gray-500 capitalize">{lvl}</span>
            </span>
          ))}
        </div>
        {selectedLogs.size > 0 && (
          <>
            <div className="w-px h-3.5 bg-gray-200 dark:bg-gray-600" />
            <span className="text-primary-600 dark:text-primary-400 font-medium">{selectedLogs.size} selecionados</span>
          </>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Level */}
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Nível</p>
              <div className="flex flex-wrap gap-1.5">
                {(['debug', 'info', 'warn', 'error', 'fatal'] as const).map(level => {
                  const active = filter.level.includes(level);
                  const c = getLevelColors(level);
                  return (
                    <button
                      key={level}
                      onClick={() => {
                        const next = active ? filter.level.filter(l => l !== level) : [...filter.level, level];
                        setFilter({ ...filter, level: next });
                      }}
                      className="text-xs px-2 py-0.5 rounded-full font-medium capitalize border transition-colors"
                      style={active
                        ? { background: c.bar, color: '#fff', borderColor: c.bar }
                        : { background: c.bar + '15', color: c.bar, borderColor: c.bar + '40' }
                      }
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Platform */}
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Plataforma</p>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(PLATFORM_META) as Platform[]).map(p => {
                  const active = filter.platform.includes(p);
                  const meta = PLATFORM_META[p];
                  return (
                    <button
                      key={p}
                      onClick={() => {
                        const next = active ? filter.platform.filter(x => x !== p) : [...filter.platform, p];
                        setFilter({ ...filter, platform: next });
                      }}
                      className="text-xs px-2 py-0.5 rounded-full font-medium border transition-colors"
                      style={active
                        ? { background: meta.color, color: '#fff', borderColor: meta.color }
                        : { background: meta.color + '15', color: meta.color, borderColor: meta.color + '40' }
                      }
                    >
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time range */}
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t('time_range')}</p>
              <div className="space-y-1.5">
                <input type="datetime-local" value={filter.timeRange.start.slice(0, 16)} disabled={isLiveTail}
                  onChange={e => setFilter({ ...filter, timeRange: { ...filter.timeRange, start: e.target.value } })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                />
                <input type="datetime-local" value={filter.timeRange.end.slice(0, 16)} disabled={isLiveTail}
                  onChange={e => setFilter({ ...filter, timeRange: { ...filter.timeRange, end: e.target.value } })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                />
              </div>
            </div>

            {/* Extras */}
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Outros</p>
              <div className="space-y-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={filter.hasError} onChange={e => setFilter({ ...filter, hasError: e.target.checked })} className="rounded border-gray-300 dark:border-gray-600 text-primary-600 w-3 h-3" />
                  <span className="text-xs text-gray-700 dark:text-gray-300">{t('has_errors')}</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={filter.hasTraceId} onChange={e => setFilter({ ...filter, hasTraceId: e.target.checked })} className="rounded border-gray-300 dark:border-gray-600 text-primary-600 w-3 h-3" />
                  <span className="text-xs text-gray-700 dark:text-gray-300">{t('has_trace_id')}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800/80">
              <tr>
                <th className="pl-3 pr-2 py-2 w-7">
                  <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600 text-primary-600 w-3 h-3"
                    checked={selectedLogs.size === filteredLogs.length && filteredLogs.length > 0}
                    onChange={e => setSelectedLogs(e.target.checked ? new Set(filteredLogs.map(l => l.id)) : new Set())}
                  />
                </th>
                <th className="w-1" />
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('timestamp')}</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Plataforma</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">App</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('message')}</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Tipo de Erro</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Trace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/60">
              {filteredLogs.map((log, idx) => {
                const colors = getLevelColors(log.level);
                const isNew = newLogIds.has(log.id);
                const isSelected = drawer.data?.id === log.id;
                return (
                  <tr
                    key={log.id}
                    onClick={() => navigate('/logs/' + log.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : idx % 2 === 0
                        ? 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/40'
                        : 'bg-gray-50/40 dark:bg-gray-800/40 hover:bg-gray-100/60 dark:hover:bg-gray-700/40'
                    } ${isNew ? 'animate-pulse' : ''}`}
                  >
                    <td className="pl-3 pr-2 py-1.5 w-7" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600 text-primary-600 w-3 h-3"
                        checked={selectedLogs.has(log.id)} onChange={() => toggleLogSelection(log.id)} />
                    </td>
                    <td className="py-1.5 w-1 pr-0">
                      <div className="w-[3px] h-5 rounded-full" style={{ background: colors.bar }} />
                    </td>
                    <td className="px-3 py-1.5 whitespace-nowrap text-xs text-gray-400 dark:text-gray-500 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="px-3 py-1.5 whitespace-nowrap">
                      <PlatformBadge platform={log.platform} />
                    </td>
                    <td className="px-3 py-1.5 whitespace-nowrap">
                      <span className="font-mono text-xs text-gray-600 dark:text-gray-400">{log.app}</span>
                    </td>
                    <td className="px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 max-w-xs truncate">
                      {filter.search ? highlightMatch(log.message, filter.search) : log.message}
                    </td>
                    <td className="px-3 py-1.5 whitespace-nowrap">
                      {log.errorType ? (
                        <span className="text-xs font-mono text-red-600 dark:text-red-400">{log.errorType}</span>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-3 py-1.5 whitespace-nowrap text-xs font-mono">
                      {log.traceId
                        ? <span className="text-blue-500 dark:text-blue-400">{log.traceId.slice(0, 10)}…</span>
                        : <span className="text-gray-300 dark:text-gray-600">—</span>
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-10">
            <Search className="w-7 h-7 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('no_logs_found_matching_filters')}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Tente ajustar os filtros ou termos de busca</p>
          </div>
        )}

        {hasNextPage && (
          <div className="flex justify-center py-4">
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="btn-secondary flex items-center gap-2 text-xs px-4 py-2"
            >
              {isFetchingNextPage ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Loading…</span>
                </>
              ) : (
                <span>Load more</span>
              )}
            </button>
          </div>
        )}
      </div>

      <LogDrawer
        log={drawer.data}
        isOpen={drawer.isOpen}
        onClose={() => navigate('/logs', { replace: true })}
        relatedLogs={relatedLogs}
        onNavigateToTrace={onNavigateToTrace}
      />
    </div>
  );
};
