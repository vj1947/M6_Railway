// Builds the Express app. (Owner: Core Team)
// Every group's routes are mounted here under /api/v1 - groups never edit this file;
// they add routes inside their own module's routes.js.
import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { pingDatabase } from './config/db.js';
import { ok } from './utils/response.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

import authRoutes from './modules/auth/routes.js';         // Group 1
import trainRoutes from './modules/trains/routes.js';      // Group 2
import stationRoutes from './modules/stations/routes.js';  // Group 3
import searchRoutes from './modules/search/routes.js';     // Group 4
import bookingRoutes from './modules/bookings/routes.js';  // Group 5
import paymentRoutes from './modules/payments/routes.js';  // Group 6
import adminRoutes from './modules/admin/routes.js';       // Group 7

export function createApp() {
  const app = express();
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json({ limit: '100kb' }));

  const api = express.Router();

  api.get('/health', async (_req, res) => {
    const db = await pingDatabase();
    return ok(res, {
      api: 'running',
      database: { connected: true, name: db.name, mysqlVersion: db.version, tables: Number(db.tables_count) },
      time: new Date().toISOString(),
    });
  });

  // Order matters only where paths overlap: payments (G6) mounts /bookings/:pnr/cancel,
  // bookings (G5) mounts /bookings/my and /bookings/:pnr - they don't collide.
  api.use(authRoutes);
  api.use(trainRoutes);
  api.use(stationRoutes);
  api.use(searchRoutes);
  api.use(bookingRoutes);
  api.use(paymentRoutes);
  api.use(adminRoutes);

  app.use('/api/v1', api);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
