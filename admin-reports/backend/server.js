import express from 'express';
import cors from 'cors';
import pool from './db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Auth middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, error: 'Missing token' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // payload contains userId and role
    next();
  } catch (err) {
    return res.status(403).json({ success: false, error: 'Invalid token' });
  }
};

// Health check
app.get('/health', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS connected');
    res.json({ status: 'ok', database: rows[0].connected === 1 });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

/**
 * 1. GET /api/kpis
 * Returns key performance figures by delegating to vw_daily_bookings.
 * No raw business logic in code.
 */
app.get('/api/kpis', async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        booking_date,
        total_bookings,
        total_passengers,
        confirmed_bookings,
        cancelled_bookings,
        partial_cancellations,
        total_fare_amount
      FROM vw_daily_bookings
      ORDER BY booking_date DESC
      LIMIT 1
    `);
    res.json({ success: true, data: rows[0] || null });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 2. GET /api/revenue
 * Returns monthly revenue metrics net of refunds.
 * Calls sp_revenue_report(from, to) if date range is specified,
 * otherwise queries vw_revenue_summary.
 */
app.get('/api/revenue', async (req, res) => {
  try {
    const { from, to } = req.query;
    if (from && to) {
      const [results] = await pool.query('CALL sp_revenue_report(?, ?)', [from, to]);
      // MySQL returns [rows, OkPacket] for stored procedures
      return res.json({ success: true, data: results[0] || [] });
    }

    const [rows] = await pool.query(`
      SELECT month, gross_revenue, total_refunds, net_revenue
      FROM vw_revenue_summary
      ORDER BY month DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 3. GET /api/occupancy
 * Returns train seat occupancy metrics.
 * Calls sp_train_occupancy(train_id, journey_date) if trainId and date are provided,
 * otherwise queries vw_train_occupancy.
 */
app.get('/api/occupancy', async (req, res) => {
  try {
    const { trainId, date, limit = 50 } = req.query;
    if (trainId && date) {
      const [results] = await pool.query('CALL sp_train_occupancy(?, ?)', [
        parseInt(trainId, 10),
        date,
      ]);
      return res.json({ success: true, data: results[0] || [] });
    }

    const [rows] = await pool.query(
      `
      SELECT train_number, train_name, run_id, journey_date, total_seats, filled_seats, occupancy_percent
      FROM vw_train_occupancy
      ORDER BY journey_date DESC, occupancy_percent DESC
      LIMIT ?
    `,
      [parseInt(limit, 10)]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 4. GET /api/bookings
 * Returns daily booking aggregations by querying vw_daily_bookings.
 * Optional query param: ?limit=30
 */
app.get('/api/bookings', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '30', 10);
    const [rows] = await pool.query(
      `
      SELECT
        booking_date,
        total_bookings,
        total_passengers,
        confirmed_bookings,
        cancelled_bookings,
        partial_cancellations,
        total_fare_amount
      FROM vw_daily_bookings
      ORDER BY booking_date DESC
      LIMIT ?
    `,
      [limit]
    );
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 5. GET /api/passengers
 * Returns passenger travel history by querying vw_passenger_history.
 * Optional query params: ?userId=11 & ?from=YYYY-MM-DD & ?to=YYYY-MM-DD & ?limit=50
 */
app.get('/api/passengers', async (req, res) => {
  try {
    const { userId, from, to, limit = 50 } = req.query;
    const parsedLimit = parseInt(limit, 10);
    const conditions = [];
    const params = [];

    if (userId) {
      conditions.push('user_id = ?');
      params.push(parseInt(userId, 10));
    }
    if (from && to) {
      conditions.push('journey_date BETWEEN ? AND ?');
      params.push(from, to);
    }
    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    params.push(parsedLimit);

    const [rows] = await pool.query(
      `
      SELECT user_id, pnr, passenger_name, age, gender, train_number,
             journey_date, from_station, to_station, class_code,
             coach_label, seat_number, passenger_status, fare, booked_at
      FROM vw_passenger_history
      ${whereClause}
      ORDER BY journey_date DESC, booked_at DESC
      LIMIT ?
    `,
      params
    );
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 6. GET /api/audit-logs
 * Returns audit trail records by querying the audit_log table.
 * Optional query params: ?table=bookings & ?from=YYYY-MM-DD & ?to=YYYY-MM-DD & ?limit=50
 */
app.get('/api/audit-logs', async (req, res) => {
  try {
    const { table, from, to, limit = 50 } = req.query;
    const parsedLimit = parseInt(limit, 10);
    const conditions = [];
    const params = [];

    if (table) {
      conditions.push('table_name = ?');
      params.push(table);
    }
    if (from && to) {
      conditions.push('DATE(changed_at) BETWEEN ? AND ?');
      params.push(from, to);
    }
    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    params.push(parsedLimit);

    const [rows] = await pool.query(
      `
      SELECT log_id, table_name, record_id, action, old_value, new_value, changed_by, changed_at
      FROM audit_log
      ${whereClause}
      ORDER BY changed_at DESC
      LIMIT ?
    `,
      params
    );
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 7. GET /api/top-routes
 * Returns top train routes by volume from vw_train_occupancy.
 */
app.get('/api/top-routes', async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT train_number, train_name,
             ROUND(AVG(occupancy_percent), 1) AS avg_occupancy,
             SUM(filled_seats) AS total_passengers
      FROM vw_train_occupancy
      GROUP BY train_number, train_name
      ORDER BY total_passengers DESC
      LIMIT 6
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 8. GET /api/class-distribution
 * Returns ticket volume by coach class from vw_passenger_history.
 */
app.get('/api/class-distribution', async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT class_code, COUNT(*) AS count, SUM(fare) AS total_fare
      FROM vw_passenger_history
      GROUP BY class_code
      ORDER BY count DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start Express server
app.listen(PORT, () => {
  console.log(`Admin Reports Backend running on http://localhost:${PORT}`);
});

