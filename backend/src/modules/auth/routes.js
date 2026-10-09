// GROUP 1 - User & Authentication.  FR-G1-01 .. FR-G1-11
import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import * as c from './controller.js';

const r = Router();

r.post('/auth/register', c.register);                     // FR-G1-01  (stub)
r.post('/auth/login', c.login);                           // FR-G1-02  (WORKING)
r.post('/auth/logout', requireAuth, c.logout);            // FR-G1-03  (WORKING)

r.get('/users/me', requireAuth, c.me);                    // FR-G1-05/08 (WORKING)
r.put('/users/me', requireAuth, c.updateMe);              // FR-G1-05  (stub)
r.put('/users/me/password', requireAuth, c.changePassword); // FR-G1-06 (stub)

r.get('/admin/users', requireAuth, requireRole('ADMIN'), c.listUsers);         // FR-G1-09 (stub)
r.post('/admin/staff', requireAuth, requireRole('ADMIN'), c.createStaff);      // FR-G1-07 (stub)
r.patch('/admin/users/:id', requireAuth, requireRole('ADMIN'), c.updateUser);  // FR-G1-09 (stub)

export default r;
