export const environment = {
  production: true,
  // Use relative URL - nginx will proxy /api/ to backend
  apiUrl: '/api',
  appName: 'Shared Subscription Debt Manager',
  version: '1.0.0',
  // Production-specific configuration
  enableAspNetCoreHttps: true,
  enableDebugMode: false,
  // Logging configuration
  logLevel: 'error',
  // Feature flags
  enableAdvancedFeatures: true,
  // Analytics and monitoring
  enableAnalytics: true,
  // Security settings
  enableStrictMode: true,
  enableContentSecurityPolicy: true
};

