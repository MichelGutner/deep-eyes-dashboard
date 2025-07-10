const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Mock logs data
const mockLogs = [
  {
    _id: '1',
    level: 'error',
    message: 'Database connection failed',
    environment: 'production',
    appName: 'user-service',
    userId: 'user123',
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    traceId: 'trace-001',
    spanId: 'span-001'
  },
  {
    _id: '2',
    level: 'warning',
    message: 'High memory usage detected',
    environment: 'production',
    appName: 'api-gateway',
    userId: 'user456',
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    traceId: 'trace-002',
    spanId: 'span-002'
  },
  {
    _id: '3',
    level: 'info',
    message: 'User login successful',
    environment: 'production',
    appName: 'auth-service',
    userId: 'user789',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    traceId: 'trace-003',
    spanId: 'span-003'
  },
  {
    _id: '4',
    level: 'debug',
    message: 'Processing request',
    environment: 'development',
    appName: 'payment-service',
    userId: 'user101',
    createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    traceId: 'trace-004',
    spanId: 'span-004'
  },
  {
    _id: '5',
    level: 'error',
    message: 'Payment processing failed',
    environment: 'production',
    appName: 'payment-service',
    userId: 'user202',
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    traceId: 'trace-005',
    spanId: 'span-005'
  },
  {
    _id: '6',
    level: 'info',
    message: 'Order created successfully',
    environment: 'production',
    appName: 'order-service',
    userId: 'user303',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    traceId: 'trace-006',
    spanId: 'span-006'
  },
  {
    _id: '7',
    level: 'warning',
    message: 'Slow query detected',
    environment: 'production',
    appName: 'user-service',
    userId: 'user404',
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    traceId: 'trace-007',
    spanId: 'span-007'
  },
  {
    _id: '8',
    level: 'debug',
    message: 'Cache miss for user data',
    environment: 'development',
    appName: 'cache-service',
    userId: 'user505',
    createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    traceId: 'trace-008',
    spanId: 'span-008'
  }
];

// GET /logs - Return all logs
app.get('/logs', (req, res) => {
  res.json(mockLogs);
});

// GET /logs/metrics - Return log metrics by level
app.get('/logs/metrics', (req, res) => {
  const metrics = mockLogs.reduce((acc, log) => {
    acc[log.level] = (acc[log.level] || 0) + 1;
    return acc;
  }, {});

  const result = Object.entries(metrics).map(([level, sum]) => ({
    level,
    sum
  }));

  res.json(result);
});

// GET /health - Return system health data
app.get('/health', (req, res) => {
  res.json({
    cpu: Math.floor(Math.random() * 30) + 30, // 30-60%
    memory: Math.floor(Math.random() * 40) + 50, // 50-90%
    disk: Math.floor(Math.random() * 20) + 20, // 20-40%
    network: Math.floor(Math.random() * 30) + 60, // 60-90%
    uptime: 99.9
  });
});

// GET /performance - Return performance metrics
app.get('/performance', (req, res) => {
  res.json({
    responseTime: Math.floor(Math.random() * 100) + 100, // 100-200ms
    throughput: Math.floor(Math.random() * 1000) + 1500, // 1500-2500 RPS
    successRate: 99.8
  });
});

// GET /realtime - Return real-time metrics
app.get('/realtime', (req, res) => {
  res.json({
    metrics: [
      {
        id: '1',
        name: 'CPU Usage',
        value: Math.floor(Math.random() * 30) + 40,
        unit: '%',
        timestamp: new Date().toISOString(),
        trend: Math.random() > 0.5 ? 'up' : 'down'
      },
      {
        id: '2',
        name: 'Memory Usage',
        value: Math.floor(Math.random() * 20) + 60,
        unit: '%',
        timestamp: new Date().toISOString(),
        trend: Math.random() > 0.5 ? 'up' : 'down'
      },
      {
        id: '3',
        name: 'Response Time',
        value: Math.floor(Math.random() * 100) + 100,
        unit: 'ms',
        timestamp: new Date().toISOString(),
        trend: Math.random() > 0.5 ? 'up' : 'down'
      },
      {
        id: '4',
        name: 'Error Rate',
        value: Math.random() * 2,
        unit: '%',
        timestamp: new Date().toISOString(),
        trend: Math.random() > 0.5 ? 'up' : 'down'
      }
    ],
    events: [
      {
        id: Date.now().toString(),
        type: Math.random() > 0.5 ? 'log' : 'error',
        message: `Real-time event: ${Math.random() > 0.5 ? 'User login' : 'Database query'}`,
        timestamp: new Date().toISOString(),
        severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
        source: 'user-service'
      }
    ]
  });
});

// GET /security - Return security events
app.get('/security', (req, res) => {
  const events = Array.from({ length: 20 }, (_, i) => ({
    id: `event-${i}`,
    timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
    type: ['login', 'logout', 'access_denied', 'suspicious_activity', 'threat_detected'][Math.floor(Math.random() * 5)],
    severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
    user: `user-${Math.floor(Math.random() * 100)}`,
    ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    location: ['New York', 'London', 'Tokyo', 'Sydney', 'Berlin'][Math.floor(Math.random() * 5)],
    action: 'API request',
    resource: '/api/users',
    status: ['investigating', 'resolved', 'false_positive'][Math.floor(Math.random() * 3)]
  }));

  res.json({ events });
});

// GET /ml - Return ML insights
app.get('/ml', (req, res) => {
  res.json({
    anomalies: Array.from({ length: 10 }, (_, i) => ({
      id: `anomaly-${i}`,
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      metric: ['CPU Usage', 'Memory Usage', 'Response Time', 'Error Rate'][Math.floor(Math.random() * 4)],
      value: Math.random() * 100 + 50,
      expectedValue: Math.random() * 80 + 20,
      deviation: Math.random() * 50 + 10,
      severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
      confidence: Math.random() * 0.4 + 0.6
    })),
    predictions: Array.from({ length: 5 }, (_, i) => ({
      id: `prediction-${i}`,
      metric: ['CPU Usage', 'Memory Usage', 'Response Time', 'Error Rate'][Math.floor(Math.random() * 4)],
      currentValue: Math.random() * 100 + 20,
      predictedValue: Math.random() * 100 + 20,
      confidence: Math.random() * 0.3 + 0.7,
      timeframe: ['1h', '6h', '24h', '7d'][Math.floor(Math.random() * 4)],
      trend: ['increasing', 'decreasing', 'stable'][Math.floor(Math.random() * 3)]
    }))
  });
});

// GET /custom-metrics - Return custom metrics
app.get('/custom-metrics', (req, res) => {
  res.json({
    metrics: [
      {
        id: 'cpu-usage',
        name: 'CPU Usage',
        description: 'Average CPU usage across all instances',
        type: 'gauge',
        unit: '%',
        value: Math.floor(Math.random() * 30) + 40,
        alertThreshold: 80,
        chartType: 'line'
      },
      {
        id: 'memory-usage',
        name: 'Memory Usage',
        description: 'Memory utilization percentage',
        type: 'gauge',
        unit: '%',
        value: Math.floor(Math.random() * 20) + 60,
        alertThreshold: 85,
        chartType: 'line'
      },
      {
        id: 'request-rate',
        name: 'Request Rate',
        description: 'HTTP requests per second',
        type: 'counter',
        unit: 'req/s',
        value: Math.floor(Math.random() * 500) + 1000,
        alertThreshold: 2000,
        chartType: 'bar'
      }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Mock API server running on http://localhost:${PORT}`);
  console.log(`📊 Available endpoints:`);
  console.log(`   GET /logs - Fetch all logs`);
  console.log(`   GET /logs/metrics - Fetch log metrics`);
  console.log(`   GET /health - System health data`);
  console.log(`   GET /performance - Performance metrics`);
  console.log(`   GET /realtime - Real-time metrics`);
  console.log(`   GET /security - Security events`);
  console.log(`   GET /ml - ML insights`);
  console.log(`   GET /custom-metrics - Custom metrics`);
}); 