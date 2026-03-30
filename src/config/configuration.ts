// src/config/configuration.ts
export default () => ({
  // App port
  port: parseInt(process.env.PORT || '', 10) || 3000,

  // CORS origins
  cors: {
    origins: (
      process.env.CORS_ORIGINS ??
      process.env.CORS_ORIGIN ??
      'http://localhost:3000,https://voucher-ui-layout.onrender.com'
    )
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  },

  // Database configuration
  database: {
    url: process.env.DATABASE_URL,
  },

  // Elasticsearch (optional)
  elasticsearch: {
    node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
    auth: {
      username: process.env.ELASTICSEARCH_USERNAME,
      password: process.env.ELASTICSEARCH_PASSWORD,
    },
    index: process.env.ELASTICSEARCH_INDEX || 'app_logs',
  },

  // Axiom (optional, only if token & dataset exist)
  axiom: {
    dataset: process.env.AXIOM_DATASET || null,
    token: process.env.AXIOM_TOKEN || null,
  },
});
