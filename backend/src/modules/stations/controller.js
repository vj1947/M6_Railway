// GROUP 3 controller.
// listStations is the reference example: validate input -> call service -> ok(res, data).
import { ok, stub } from '../../utils/response.js';
import { pagination, requireFields, toId, toDate } from '../../utils/validate.js';
import { badRequest } from '../../utils/errors.js';
import * as service from './service.js';
import * as sample from './sample.js';

const OWNER = 'Group 3';

/** GET /stations?q=pune&active=true&page=1&pageSize=20 */
export async function listStations(req, res) {
  const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 50) : '';
  const activeOnly = req.query.active !== 'false';
  const { page, pageSize, offset } = pagination(req.query);

  const { items, total } = await service.findStations({ q, activeOnly, limit: pageSize, offset });
  return ok(res, { page, pageSize, total, items });
}

export async function createStation(req, res) {
  requireFields(req.body, ['stationCode', 'stationName', 'city', 'state', 'zone']);
  if (!/^[A-Z]{2,6}$/.test(req.body.stationCode)) {
    throw badRequest('INVALID_STATION_CODE', 'Station code must be 2 to 6 capital letters');
  }

  const data = await service.createStation(req.body);
  return ok(res, data, { status: 201 });
}

export async function updateStation(req, res) {
  return stub(res, OWNER, { stationId: toId(req.params.id, 'station id'), ...req.body });
}

export async function stationBoard(req, res) {
  const date = req.query.date ? toDate(req.query.date) : sample.board.date;
  return stub(res, OWNER, { ...sample.board, date, stationCode: req.params.code.toUpperCase() });
}

export async function listRoutes(_req, res) {
  return stub(res, OWNER, sample.routes);
}

export async function createRoute(req, res) {
  requireFields(req.body, ['routeCode', 'routeName', 'originStationId', 'destinationStationId']);
  return stub(res, OWNER, { routeId: 13, ...req.body }, { status: 201 });
}

export async function addRouteStops(req, res) {
  requireFields(req.body, ['stops']);
  return stub(res, OWNER, { routeId: toId(req.params.id, 'route id'), stops: req.body.stops });
}

export async function getSchedule(req, res) {
  return stub(res, OWNER, { ...sample.schedule, trainId: toId(req.params.id, 'train id') });
}

export async function setSchedule(req, res) {
  requireFields(req.body, ['stops']);
  return stub(res, OWNER, { trainId: toId(req.params.id, 'train id'), stops: req.body.stops });
}

export async function generateRuns(req, res) {
  requireFields(req.body, ['trainId', 'fromDate', 'toDate']);
  toDate(req.body.fromDate, 'fromDate');
  toDate(req.body.toDate, 'toDate');
  return stub(res, OWNER, { trainId: req.body.trainId, created: 31, skippedExisting: 0, skippedNotRunning: 0 }, { status: 201 });
}

export async function updateRunStatus(req, res) {
  requireFields(req.body, ['status']);
  return stub(res, OWNER, { runId: toId(req.params.runId, 'run id'), status: req.body.status });
}

export async function listFareRules(_req, res) {
  return stub(res, OWNER, sample.fareRules);
}

export async function updateFareRule(req, res) {
  return stub(res, OWNER, { classId: toId(req.params.classId, 'class id'), ...req.body });
}
