import 'dotenv/config';

export default () => ({
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'postgres',
    sync: process.env.DB_SYNC || false,
    ssl_mode: process.env.NODE_ENV
      ? process.env.NODE_ENV === 'production'
        ? true
        : false
      : false,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'jwtsecret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'jwtsecret',
  },
  app: {
    isProduction: process.env.NODE_ENV
      ? process.env.NODE_ENV === 'production'
        ? true
        : false
      : false,
  },
});
