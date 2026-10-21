// GROUP 3 service: SQL only, no req/res here.
import { query, queryOne } from '../../config/db.js';

/** Reference example: search + pagination with ? placeholders. */
export async function findStations({ q, activeOnly, limit, offset }) {
  const where = [];
  const params = [];
  if (activeOnly) where.push('is_active = TRUE');
  if (q) {
    where.push('(station_code LIKE ? OR station_name LIKE ? OR city LIKE ?)');
    params.push(`${q.toUpperCase()}%`, `%${q}%`, `${q}%`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const items = await query(
    `SELECT station_id   AS stationId,
            station_code AS stationCode,
            station_name AS stationName,
            city, state, zone,
            is_active    AS isActive
       FROM stations
       ${whereSql}
      ORDER BY (station_code = ?) DESC, station_name
      LIMIT ? OFFSET ?`,
    [...params, (q || '').toUpperCase(), limit, offset]
  );
  const { total } = await queryOne(`SELECT COUNT(*) AS total FROM stations ${whereSql}`, params);

  return {
    total: Number(total),
    items: items.map((s) => ({ ...s, isActive: Boolean(s.isActive) })),
  };
}

export async function createStation({ stationCode, stationName, city, state, zone }) {
  const result = await query(
    `INSERT INTO stations (station_code, station_name, city, state, zone, is_active)
     VALUES (?, ?, ?, ?, ?, TRUE)`,
    [stationCode.toUpperCase(), stationName, city, state, zone || null]
  );

  return {
    stationId: result.insertId,
    stationCode: stationCode.toUpperCase(),
    stationName,
    city,
    state,
    zone: zone || null,
    isActive: true,
  };
}

export async function findRoutes() {
  const items = await query(
    `SELECT r.route_id     AS routeId,
            r.route_code   AS routeCode,
            r.route_name   AS routeName,
            orig.station_code AS origin,
            dest.station_code AS destination,
            (SELECT COUNT(*) FROM route_stops rs WHERE rs.route_id = r.route_id) AS stops,
            (SELECT COALESCE(MAX(distance_from_origin_km), 0) FROM route_stops rs WHERE rs.route_id = r.route_id) AS distanceKm
       FROM routes r
       JOIN stations orig ON r.origin_station_id = orig.station_id
       JOIN stations dest ON r.destination_station_id = dest.station_id
      ORDER BY r.route_code`
  );

  return { items };
}

export async function createRoute({ routeCode, routeName, originStationId, destinationStationId }) {
  const result = await query(
    `INSERT INTO routes (route_code, route_name, origin_station_id, destination_station_id)
     VALUES (?, ?, ?, ?)`,
    [routeCode.toUpperCase(), routeName || null, originStationId, destinationStationId]
  );

  return {
    routeId: result.insertId,
    routeCode: routeCode.toUpperCase(),
    routeName: routeName || null,
    originStationId,
    destinationStationId,
  };
}

export async function addRouteStops(routeId, stops) {
  // Clear existing stops for this route before re-inserting
  await query(`DELETE FROM route_stops WHERE route_id = ?`, [routeId]);

  // Insert each stop with its sequence and distance from origin
  for (const s of stops) {
    await query(
      `INSERT INTO route_stops (route_id, stop_sequence, station_id, distance_from_origin_km)
       VALUES (?, ?, ?, ?)`,
      [routeId, s.stopSeq, s.stationId, s.distanceKm || 0]
    );
  }

  return { routeId, stops };
}

export async function getSchedule(trainId) {
  const train = await queryOne(
    `SELECT train_id AS trainId, train_number AS trainNumber, train_name AS trainName
       FROM trains
      WHERE train_id = ?`,
    [trainId]
  );

  if (!train) return null;

  const stops = await query(
    `SELECT ts.stop_sequence AS stopSeq,
            s.station_code   AS stationCode,
            s.station_name   AS stationName,
            TIME_FORMAT(ts.arrival_time, '%H:%i')   AS arrival,
            TIME_FORMAT(ts.departure_time, '%H:%i') AS departure,
            ts.day_offset + 1                       AS day,
            ts.distance_from_origin_km              AS distanceKm
       FROM train_schedules ts
       JOIN stations s ON ts.station_id = s.station_id
      WHERE ts.train_id = ?
      ORDER BY ts.stop_sequence`,
    [trainId]
  );

  return {
    trainId: train.trainId,
    trainNumber: train.trainNumber,
    trainName: train.trainName,
    stops,
  };
}
