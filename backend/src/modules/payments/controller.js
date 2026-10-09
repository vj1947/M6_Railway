// GROUP 6 controller. Input checks are real; results are sample data.
import { stub } from '../../utils/response.js';
import { requireFields, toId, isPnr } from '../../utils/validate.js';
import { badRequest } from '../../utils/errors.js';
import * as sample from './sample.js';

const OWNER = 'Group 6';
const METHODS = ['UPI', 'CARD', 'NET_BANKING', 'WALLET'];

/** POST /payments  { bookingId, method } */
export async function startPayment(req, res) {
  requireFields(req.body, ['bookingId', 'method']);
  if (!METHODS.includes(req.body.method)) throw badRequest('INVALID_METHOD', `Method must be one of ${METHODS.join(', ')}`);
  return stub(res, OWNER, { ...sample.payment, bookingId: toId(req.body.bookingId, 'bookingId'), method: req.body.method }, { status: 201 });
}

/** POST /payments/:id/verify  { success: true|false }  - the mock gateway's answer */
export async function verifyPayment(req, res) {
  if (typeof req.body?.success !== 'boolean') throw badRequest('MISSING_FIELDS', 'Send success: true or false');
  const paymentId = toId(req.params.id, 'payment id');
  return stub(res, OWNER, req.body.success ? { ...sample.paid, paymentId } : { ...sample.failed, paymentId });
}

export async function myPayments(_req, res) {
  return stub(res, OWNER, sample.paymentHistory);
}

/** POST /bookings/:pnr/cancel?preview=true  { bpIds: [..], reason } */
export async function cancel(req, res) {
  if (!isPnr(req.params.pnr)) throw badRequest('INVALID_PNR', 'A PNR is 10 digits and does not start with 0');
  requireFields(req.body, ['bpIds']);
  if (!Array.isArray(req.body.bpIds) || req.body.bpIds.length === 0) throw badRequest('INVALID_PASSENGERS', 'Choose at least one traveller to cancel');
  const preview = req.query.preview === 'true';
  return stub(res, OWNER, sample.cancellation({ pnr: req.params.pnr, bpIds: req.body.bpIds, preview }));
}

export async function myRefunds(_req, res) {
  return stub(res, OWNER, sample.refundHistory);
}

export async function processRefund(req, res) {
  requireFields(req.body, ['status']);
  return stub(res, OWNER, { refundId: toId(req.params.id, 'refund id'), status: req.body.status });
}

export async function waitlistStatus(req, res) {
  if (!isPnr(req.params.pnr)) throw badRequest('INVALID_PNR', 'A PNR is 10 digits and does not start with 0');
  return stub(res, OWNER, { ...sample.waitlist, pnr: req.params.pnr });
}
