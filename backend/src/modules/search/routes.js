// GROUP 4 - Train Search & Availability.  FR-G4-01 .. FR-G4-10
import { Router } from 'express';
import * as c from './controller.js';

const r = Router();

r.get('/search/trains', c.searchTrains);          // FR-G4-01..05, 08, 09 (stub)
r.get('/search/availability', c.availability);    // FR-G4-06  (stub) -> sp_check_availability
r.get('/search/fare', c.fare);                    // FR-G4-07  (stub) -> fn_calculate_fare
r.get('/search/calendar', c.calendar);            // FR-G4-10  (stub)

export default r;
