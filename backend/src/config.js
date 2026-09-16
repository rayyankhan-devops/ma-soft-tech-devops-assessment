import dotenv from 'dotenv';

dotenv.config();

const config = {
  PORT: parseInt(process.env.PORT, 10) || 8080,
  NODE_ENV: process.env.NODE_ENV || 'development',
  APP_NAME: process.env.APP_NAME || 'MA-DevOps-Backend',
  APP_VERSION: process.env.APP_VERSION || '1.0.0',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  START_TIME: new Date(),
  DB: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'devops_password',
    database: process.env.DB_NAME || 'ma_devops_db',
  },
};

export default config;
