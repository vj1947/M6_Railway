// GROUP 7 - Admin Dashboard, Reports & DBMS.  FR-G7-01 .. FR-G7-13
import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import * as c from './controller.js';

const r = Router();
const admin = [requireAuth, requireRole('ADMIN')];

r.get('/admin/dashboard', admin, c.dashboard);             // FR-G7-01 (stub)
r.get('/admin/reports/:type', admin, c.report);            // FR-G7-02..06, 13 (stub)  type = bookings|revenue|occupancy|passengers|cancellations
r.get('/admin/audit-logs', admin, c.auditLogs);            // FR-G7-07 (stub)
r.get('/admin/sql-showcase', admin, c.sqlShowcase);        // FR-G7-12 (stub)

export default r;
