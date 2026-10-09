// One connection pool for the whole app, plus small helpers every group uses.
// Rule: raw SQL with ? placeholders only. Never build SQL by joining strings.
import fs from 'node:fs';
import mysql from 'mysql2/promise';
import { config } from './env.js';

const ssl = config.db.ssl
  ? (config.db.sslCa
      ? { ca: fs.readFileSync(config.db.sslCa, 'utf8'), rejectUnauthorized: true }
      : { rejectUnauthorized: true })
  : undefined;

export const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  ssl,
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true,      // DATE / DATETIME come back as plain strings: no timezone surprises
  decimalNumbers: true,   // DECIMAL comes back as a number, not a string
  timezone: '+05:30',
});

// Make NOW(), CURRENT_TIMESTAMP etc. use Indian time on every connection,
// whatever timezone the MySQL server itself runs in.
pool.pool.on('connection', (conn) => {
  conn.query("SET time_zone = '+05:30'");
});

/** Run one read query. Returns all rows. */
export async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

/** Run one read query. Returns the first row or null. */
export async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] ?? null;
}

/**
 * Borrow one connection and tag it with the logged-in user, so the audit
 * triggers (Group 7) can record who made a change. Use for every WRITE.
 *
 *   await withUser(req.user.userId, conn => conn.query('UPDATE ...', [...]));
 */
export async function withUser(userId, work) {
  const conn = await pool.getConnection();
  try {
    await conn.query('SET @app_user_id = ?', [userId ?? null]);
    return await work(conn);
  } finally {
    await conn.query('SET @app_user_id = NULL').catch(() => {});
    conn.release();
  }
}

/**
 * Same as withUser, inside a transaction. Commits if `work` finishes,
 * rolls back if it throws.
 */
export async function withTransaction(userId, work) {
  return withUser(userId, async (conn) => {
    await conn.beginTransaction();
    try {
      const result = await work(conn);
      await conn.commit();
      return result;
    } catch (err) {
      await conn.rollback();
      throw err;
    }
  });
}

/**
 * Call a stored procedure on a connection.
 *   const { rows, out } = await callProcedure(conn, 'sp_book_ticket',
 *       [userId, runId, classId, fromSeq, toSeq, JSON.stringify(passengers)],
 *       ['booking_id', 'pnr']);
 * `rows` = first result set (if the procedure SELECTs), `out` = OUT parameters by name.
 */
export async function callProcedure(conn, name, inParams = [], outNames = []) {
  if (!/^[a-z_][a-z0-9_]*$/i.test(name)) throw new Error(`Bad procedure name: ${name}`);
  const outVars = outNames.map((n) => `@out_${n}`);
  const placeholders = [...inParams.map(() => '?'), ...outVars].join(', ');
  const [result] = await conn.query(`CALL ${name}(${placeholders})`, inParams);
  const rows = Array.isArray(result) && Array.isArray(result[0]) ? result[0] : [];
  let out = {};
  if (outNames.length) {
    const select = outNames.map((n) => `@out_${n} AS \`${n}\``).join(', ');
    const [[values]] = await conn.query(`SELECT ${select}`);
    out = values;
  }
  return { rows, out };
}

/** Quick connectivity check used by GET /api/v1/health. */
export async function pingDatabase() {
  const row = await queryOne(
    `SELECT DATABASE() AS name, VERSION() AS version,
            (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE()) AS tables_count`
  );
  return row;
}
