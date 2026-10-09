// GROUP 3 - Station, Route & Schedule.  FR-G3-01 .. FR-G3-11
//
// GET /stations is a COMPLETE, WORKING example of the routes -> controller -> service
// pattern. Every group should copy its style when replacing their stubs.
import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import * as c from './controller.js';

const r = Router();
const admin = [requireAuth, requireRole('ADMIN')];
const staffOrAdmin = [requireAuth, requireRole('STAFF', 'ADMIN')];

r.get('/stations', c.listStations);                          // FR-G3-02  (WORKING - reference example)
r.post('/stations', admin, c.createStation);                 // FR-G3-01  (stub)
r.put('/stations/:id', admin, c.updateStation);              // FR-G3-01  (stub)
r.get('/stations/:code/board', c.stationBoard);              // FR-G3-11  (stub)

r.get('/routes', c.listRoutes);                              // FR-G3-03  (stub)
r.post('/routes', admin, c.createRoute);                     // FR-G3-03  (stub)
r.post('/routes/:id/stations', admin, c.addRouteStops);      // FR-G3-04  (stub)

r.get('/trains/:id/schedule', c.getSchedule);                // FR-G3-06  (stub)
r.put('/trains/:id/schedule', admin, c.setSchedule);         // FR-G3-05  (stub)

r.post('/train-runs/generate', admin, c.generateRuns);       // FR-G3-07  (stub)
r.patch('/train-runs/:runId/status', staffOrAdmin, c.updateRunStatus); // FR-G3-08/09 (stub)

r.get('/fare-rules', c.listFareRules);                       // FR-G3-10  (stub)
r.put('/fare-rules/:classId', admin, c.updateFareRule);      // FR-G3-10  (stub)

export default r;
