// GROUP 5 - Booking & Ticket.  FR-G5-01 .. FR-G5-11
import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import * as c from './controller.js';

const r = Router();

r.post('/bookings', requireAuth, requireRole('PASSENGER'), c.createBooking);   // FR-G5-01..06 (stub) -> sp_book_ticket
r.get('/bookings/my', requireAuth, c.myBookings);                              // FR-G5-08 (stub)  (must stay above /bookings/:pnr)
r.get('/bookings/:pnr', c.pnrStatus);                                          // FR-G5-09 (stub, public)
r.get('/bookings/:pnr/ticket', requireAuth, c.ticket);                         // FR-G5-07 (stub)

r.get('/runs/:runId/chart', requireAuth, requireRole('STAFF', 'ADMIN'), c.reservationChart); // FR-G5-10 (stub)
r.post('/counter/bookings', requireAuth, requireRole('STAFF'), c.counterBooking);           // FR-G5-11 (stub)

export default r;
