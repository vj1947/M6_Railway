// GROUP 2 - Train, Coach & Seat.  FR-G2-01 .. FR-G2-09
import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import * as c from './controller.js';

const r = Router();
const admin = [requireAuth, requireRole('ADMIN')];

r.get('/trains', c.listTrains);                         // FR-G2-03  (stub)
r.post('/trains', admin, c.createTrain);                // FR-G2-01  (stub)
r.get('/trains/:id', c.getTrain);                       // FR-G2-03/08 (stub)
r.put('/trains/:id', admin, c.updateTrain);             // FR-G2-02  (stub)

r.get('/coach-classes', c.listClasses);                 // FR-G2-04  (stub)
r.put('/coach-classes/:id', admin, c.updateClass);      // FR-G2-04  (stub)

r.get('/trains/:id/coaches', c.listCoaches);            // FR-G2-03  (stub)
r.post('/trains/:id/coaches', admin, c.addCoach);       // FR-G2-05/06 (stub)
r.get('/coaches/:id/seats', c.listSeats);               // FR-G2-07  (stub)

export default r;
