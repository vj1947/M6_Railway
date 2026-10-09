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
