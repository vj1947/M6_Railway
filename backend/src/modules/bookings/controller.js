// GROUP 5 controller. Input checks are real (FR-G5-02); results are sample data.
// When replacing: createBooking must call sp_book_ticket inside withTransaction().
import { stub } from '../../utils/response.js';
import { requireFields, toId, isPnr } from '../../utils/validate.js';
import { badRequest } from '../../utils/errors.js';
import * as sample from './sample.js';

const OWNER = 'Group 5';
const GENDERS = ['M', 'F', 'O'];

function checkPassengers(passengers) {
  if (!Array.isArray(passengers) || passengers.length < 1 || passengers.length > 6) {
    throw badRequest('INVALID_PASSENGERS', 'Add between 1 and 6 travellers');
  }
  passengers.forEach((p, i) => {
    const n = i + 1;
    if (!p?.name || String(p.name).trim().length < 2) throw badRequest('INVALID_PASSENGER', `Traveller ${n}: enter a name`);
    const age = Number(p.age);
    if (!Number.isInteger(age) || age < 1 || age > 125) throw badRequest('INVALID_PASSENGER', `Traveller ${n}: age must be 1 to 125`);
    if (!GENDERS.includes(p.gender)) throw badRequest('INVALID_PASSENGER', `Traveller ${n}: choose a gender`);
  });
}

function checkPnr(pnr) {
  if (!isPnr(pnr)) throw badRequest('INVALID_PNR', 'A PNR is 10 digits and does not start with 0');
}

/** POST /bookings  { runId, classId, fromSeq, toSeq, passengers: [{name, age, gender, berthPreference}] } */
export async function createBooking(req, res) {
  requireFields(req.body, ['runId', 'classId', 'fromSeq', 'toSeq', 'passengers']);
  toId(req.body.runId, 'runId');
  toId(req.body.classId, 'classId');
  if (!(Number(req.body.fromSeq) < Number(req.body.toSeq))) throw badRequest('INVALID_STOPS', 'Boarding stop must come before destination');
  checkPassengers(req.body.passengers);
  return stub(res, OWNER, sample.newBooking(req.body.passengers), { status: 201 });
}

export async function myBookings(_req, res) {
  return stub(res, OWNER, sample.myBookings);
}

export async function pnrStatus(req, res) {
  checkPnr(req.params.pnr);
  return stub(res, OWNER, { ...sample.pnrStatus, pnr: req.params.pnr });
}

export async function ticket(req, res) {
  checkPnr(req.params.pnr);
  return stub(res, OWNER, { ...sample.ticket, pnr: req.params.pnr });
}

export async function reservationChart(req, res) {
  return stub(res, OWNER, { ...sample.chart, runId: toId(req.params.runId, 'run id') });
}

export async function counterBooking(req, res) {
  requireFields(req.body, ['userId', 'runId', 'classId', 'fromSeq', 'toSeq', 'passengers']);
  checkPassengers(req.body.passengers);
  return stub(res, OWNER, sample.newBooking(req.body.passengers), { status: 201 });
}
