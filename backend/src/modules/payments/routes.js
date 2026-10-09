// GROUP 6 - Payment, Cancellation & Waiting List.  FR-G6-01 .. FR-G6-12
import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import * as c from './controller.js';

const r = Router();

r.post('/payments', requireAuth, c.startPayment);                  // FR-G6-01/03 (stub)
r.post('/payments/:id/verify', requireAuth, c.verifyPayment);      // FR-G6-02 (stub) -> sp_confirm_payment
r.get('/payments/my', requireAuth, c.myPayments);                  // FR-G6-12 (stub)

r.post('/bookings/:pnr/cancel', requireAuth, c.cancel);            // FR-G6-05/06 (stub) -> sp_cancel_ticket  (?preview=true = charges only)
r.get('/refunds/my', requireAuth, c.myRefunds);                    // FR-G6-12 (stub)
r.patch('/refunds/:id', requireAuth, requireRole('ADMIN', 'STAFF'), c.processRefund); // FR-G6-07 (stub)

r.get('/waitlist/:pnr', c.waitlistStatus);                         // FR-G6-08 (stub)

export default r;
