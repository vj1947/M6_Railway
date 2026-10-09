// GROUP 2 controller. All endpoints return sample data until Group 2 builds them.
// Pattern to follow: modules/stations/controller.js -> listStations
import { stub } from '../../utils/response.js';
import { requireFields, toId } from '../../utils/validate.js';
import { badRequest } from '../../utils/errors.js';
import * as sample from './sample.js';

const OWNER = 'Group 2';

export async function listTrains(_req, res) {
  return stub(res, OWNER, sample.trainList);
}

export async function createTrain(req, res) {
  requireFields(req.body, ['trainNumber', 'trainName', 'trainType', 'routeId', 'runningDays']);
  if (!/^\d{5}$/.test(req.body.trainNumber)) throw badRequest('INVALID_TRAIN_NUMBER', 'Train number must be 5 digits');
  return stub(res, OWNER, { trainId: 13, ...req.body, isActive: true }, { status: 201 });
}

export async function getTrain(req, res) {
  return stub(res, OWNER, { ...sample.trainDetail, trainId: toId(req.params.id, 'train id') });
}

export async function updateTrain(req, res) {
  return stub(res, OWNER, { trainId: toId(req.params.id, 'train id'), ...req.body });
}

export async function listClasses(_req, res) {
  return stub(res, OWNER, sample.classes);
}

export async function updateClass(req, res) {
  return stub(res, OWNER, { classId: toId(req.params.id, 'class id'), ...req.body });
}

export async function listCoaches(req, res) {
  toId(req.params.id, 'train id');
  return stub(res, OWNER, { items: sample.trainDetail.coaches });
}

export async function addCoach(req, res) {
  requireFields(req.body, ['coachLabel', 'classId', 'coachPosition']);
  return stub(res, OWNER, { coachId: 153, trainId: toId(req.params.id, 'train id'), ...req.body, seatsCreated: 64 }, { status: 201 });
}

export async function listSeats(req, res) {
  return stub(res, OWNER, { ...sample.coachSeats, coachId: toId(req.params.id, 'coach id') });
}
