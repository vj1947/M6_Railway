// GROUP 4 controller. Input checks are real (FR-G4-02); results are sample data.
import { stub } from '../../utils/response.js';
import { requireFields, toDate, toId } from '../../utils/validate.js';
import { badRequest } from '../../utils/errors.js';
import * as sample from './sample.js';

const OWNER = 'Group 4';

/** GET /search/trains?from=NDLS&to=BPL&date=2026-11-20&class=3A */
export async function searchTrains(req, res) {
  requireFields(req.query, ['from', 'to', 'date']);
  const from = String(req.query.from).toUpperCase();
  const to = String(req.query.to).toUpperCase();
  if (from === to) throw badRequest('SAME_STATION', 'From and To stations must be different');
  const date = toDate(req.query.date);
  // TODO Group 4: reject past dates and dates more than 60 days ahead (FR-G4-02),
  // query real runs, call sp_check_availability + fn_calculate_fare per class.
  const classFilter = req.query.class ? String(req.query.class).toUpperCase() : null;
  const data = sample.searchResults({ date, classFilter });
  return stub(res, OWNER, data);
}

/** GET /search/availability?runId=..&classId=..&fromSeq=..&toSeq=.. */
export async function availability(req, res) {
  requireFields(req.query, ['runId', 'classId', 'fromSeq', 'toSeq']);
  return stub(res, OWNER, {
    runId: toId(req.query.runId, 'runId'),
    classId: toId(req.query.classId, 'classId'),
    fromSeq: Number(req.query.fromSeq),
    toSeq: Number(req.query.toSeq),
    availableSeats: 96,
    waitingCount: 0,
    status: 'AVAILABLE',
  });
}

/** GET /search/fare?trainId=..&classId=..&fromSeq=..&toSeq=.. */
export async function fare(req, res) {
  requireFields(req.query, ['trainId', 'classId', 'fromSeq', 'toSeq']);
  return stub(res, OWNER, sample.fareBreakup);
}

/** GET /search/calendar?trainId=..&classId=..&fromSeq=..&toSeq=..&startDate=.. */
export async function calendar(req, res) {
  requireFields(req.query, ['trainId', 'classId']);
  return stub(res, OWNER, sample.calendar);
}
