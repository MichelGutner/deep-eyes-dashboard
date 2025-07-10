import axios from 'axios';

const ML_API_URL = 'http://localhost:3001';

// Create axios instance for ML API
const mlApi = axios.create({
  baseURL: ML_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ML API Service
export const mlService = {
  // Health check
  async getHealth() {
    const response = await mlApi.get('/ml/health');
    return response.data;
  },

  // Anomaly detection
  async detectAnomalies(data: Array<{timestamp: number, value: number}>) {
    const response = await mlApi.post('/ml/anomaly/detect', {
      data,
      algorithm: 'isolation-forest',
      threshold: 2.5
    });
    return response.data;
  },

  // Generate predictions
  async generatePredictions(data: Array<{timestamp: number, value: number}>, horizon: number = 5) {
    const response = await mlApi.post('/ml/prediction/forecast', {
      historicalData: data,
      horizon
    });
    return response.data;
  },

  // Perform clustering
  async performClustering(data: Array<{timestamp: number, value: number}>, k: number = 3) {
    const response = await mlApi.post('/ml/clustering/analyze', {
      data,
      k,
      algorithm: 'k-means'
    });
    return response.data;
  },

  // Perform regression
  async performRegression(x: number[], y: number[]) {
    const response = await mlApi.post('/ml/regression/analyze', {
      x,
      y,
      algorithm: 'linear-regression'
    });
    return response.data;
  },

  // Perform classification
  async performClassification(data: Array<{timestamp: number, value: number}>, labels: number[]) {
    const response = await mlApi.post('/ml/classification/analyze', {
      data,
      labels,
      algorithm: 'nearest-neighbor'
    });
    return response.data;
  },

  // Analyze patterns
  async analyzePatterns(data: Array<{timestamp: number, value: number}>) {
    const response = await mlApi.post('/ml/patterns/analyze', {
      data,
      method: 'correlation-analysis'
    });
    return response.data;
  },

  // Train model
  async trainModel(modelType: string, data: number[][], parameters?: Record<string, unknown>) {
    const response = await mlApi.post('/ml/models/train', {
      modelType,
      data,
      parameters
    });
    return response.data;
  },

  // Get model status
  async getModelStatus(modelId: string) {
    const response = await mlApi.get(`/ml/models/${modelId}/status`);
    return response.data;
  },

  // Evaluate model
  async evaluateModel(modelId: string) {
    const response = await mlApi.get(`/ml/models/${modelId}/evaluate`);
    return response.data;
  },

  // Get insights summary
  async getInsightsSummary(timeRange?: string) {
    const response = await mlApi.get('/ml/insights/summary', {
      params: { timeRange }
    });
    return response.data;
  },

  // Get performance metrics
  async getPerformanceMetrics() {
    const response = await mlApi.get('/ml/metrics/performance');
    return response.data;
  },

  // Preprocess data
  async preprocessData(data: Record<string, unknown>) {
    const response = await mlApi.post('/ml/data/preprocess', data);
    return response.data;
  },

  // Get feature importance
  async getFeatureImportance() {
    const response = await mlApi.get('/ml/features/importance');
    return response.data;
  },

  // Authentication
  async login(username: string, password: string) {
    const response = await mlApi.post('/auth/login', {
      username,
      password
    });
    return response.data;
  },

  async verifyToken(token: string) {
    const response = await mlApi.post('/auth/verify', { token });
    return response.data;
  }
};

// Error handler
mlApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('ML API Error:', error);
    throw error;
  }
); 