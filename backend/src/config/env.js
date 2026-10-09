// Reads backend/.env once and exposes typed settings to the rest of the app.
import 'dotenv/config';

function required(name) {
  const value = process.env[name];
  if (value === undefined || value === '') {
    throw new Error(`Missing ${name} in backend/.env (copy .env.example to .env and fill it in)`);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT || 5000),
  env: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: required('DB_USER'),
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'railway_db',
    ssl: process.env.DB_SSL === 'true',
    sslCa: process.env.DB_SSL_CA || '',
  },
  jwt: {
    secret: required('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
};

export const isDev = config.env !== 'production';
