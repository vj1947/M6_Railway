// GROUP 7 controller. All endpoints return sample data until Group 7 builds the views.
import { stub } from '../../utils/response.js';
import { notFound } from '../../utils/errors.js';
import * as sample from './sample.js';

const OWNER = 'Group 7';
const REPORT_TYPES = ['bookings', 'revenue', 'occupancy', 'passengers', 'cancellations'];

export async function dashboard(_req, res) {
  return stub(res, OWNER, sample.dashboard);
}

/** GET /admin/reports/revenue?from=2026-09-01&to=2026-09-30&trainId=&classId=&format=csv */
export async function report(req, res) {
  const type = req.params.type;
  if (!REPORT_TYPES.includes(type)) throw notFound('REPORT_NOT_FOUND', `Reports: ${REPORT_TYPES.join(', ')}`);
  return stub(res, OWNER, sample.reports[type]);
}

export async function auditLogs(_req, res) {
  return stub(res, OWNER, sample.auditLogs);
}

export async function sqlShowcase(_req, res) {
  return stub(res, OWNER, sample.showcase);
}
