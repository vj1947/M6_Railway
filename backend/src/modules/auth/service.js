// GROUP 1 service: all SQL for users and profiles lives here.
import { query, queryOne, withTransaction, withUser } from '../../config/db.js';

export function findUserByEmail(email) {
  return queryOne(
    `SELECT user_id, full_name, email, role, password_hash, is_active
       FROM users
      WHERE email = ?`,
    [email]
  );
}

export async function recordLogin(userId) {
  return withUser(userId, async (conn) => {
    await conn.query('UPDATE users SET last_login_at = NOW() WHERE user_id = ?', [userId]);
  });
}

export async function getProfile(userId) {
  const row = await queryOne(
    `SELECT u.user_id, u.full_name, u.email, u.phone, u.role, u.last_login_at, u.created_at,
            p.date_of_birth, p.gender, p.id_proof_type, p.id_proof_number, p.address, p.city, p.state, p.pincode,
            s.employee_code, s.designation, st.station_code AS posting_station_code, st.station_name AS posting_station_name
       FROM users u
       LEFT JOIN passenger_profiles p ON p.user_id = u.user_id
       LEFT JOIN staff_profiles s     ON s.user_id = u.user_id
       LEFT JOIN stations st          ON st.station_id = s.station_id
      WHERE u.user_id = ?`,
    [userId]
  );
  if (!row) return null;
  return {
    userId: row.user_id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    lastLoginAt: row.last_login_at,
    memberSince: row.created_at,
    passenger: row.role === 'PASSENGER' ? {
      dateOfBirth: row.date_of_birth, gender: row.gender,
      idProofType: row.id_proof_type, idProofNumber: row.id_proof_number,
      address: row.address, city: row.city, state: row.state, pincode: row.pincode,
    } : null,
    staff: row.role === 'STAFF' ? {
      employeeCode: row.employee_code, designation: row.designation,
      postingStation: { code: row.posting_station_code, name: row.posting_station_name },
    } : null,
  };
}

export async function registerPassenger({ fullName, email, phone, passwordHash }) {
  return withTransaction(null, async (conn) => {
    const [userResult] = await conn.query(
      `INSERT INTO users (full_name, email, phone, password_hash, role, is_active)
       VALUES (?, ?, ?, ?, 'PASSENGER', TRUE)`,
      [fullName, email, phone, passwordHash]
    );

    const userId = userResult.insertId;

    await conn.query(
      `INSERT INTO passenger_profiles (user_id)
       VALUES (?)`,
      [userId]
    );

    return {
      userId,
      fullName,
      email,
      phone,
      role: 'PASSENGER',
    };
  });
}

export async function updatePassengerProfile(userId, data) {
  return withUser(userId, async (conn) => {
    const userUpdates = [];
    const userParams = [];

    if (data.fullName !== undefined) {
      userUpdates.push('full_name = ?');
      userParams.push(data.fullName);
    }
    if (data.phone !== undefined) {
      userUpdates.push('phone = ?');
      userParams.push(data.phone);
    }

    if (userUpdates.length > 0) {
      userParams.push(userId);
      await conn.query(
        `UPDATE users SET ${userUpdates.join(', ')} WHERE user_id = ?`,
        userParams
      );
    }

    const p = data.passenger || {};
    const profileUpdates = [];
    const profileParams = [];

    if (p.dateOfBirth !== undefined) {
      profileUpdates.push('date_of_birth = ?');
      profileParams.push(p.dateOfBirth);
    }
    if (p.gender !== undefined) {
      profileUpdates.push('gender = ?');
      profileParams.push(p.gender);
    }
    if (p.idProofType !== undefined) {
      profileUpdates.push('id_proof_type = ?');
      profileParams.push(p.idProofType);
    }
    if (p.idProofNumber !== undefined) {
      profileUpdates.push('id_proof_number = ?');
      profileParams.push(p.idProofNumber);
    }
    if (p.address !== undefined) {
      profileUpdates.push('address = ?');
      profileParams.push(p.address);
    }
    if (p.city !== undefined) {
      profileUpdates.push('city = ?');
      profileParams.push(p.city);
    }
    if (p.state !== undefined) {
      profileUpdates.push('state = ?');
      profileParams.push(p.state);
    }
    if (p.pincode !== undefined) {
      profileUpdates.push('pincode = ?');
      profileParams.push(p.pincode);
    }

    if (profileUpdates.length > 0) {
      profileParams.push(userId);
      await conn.query(
        `UPDATE passenger_profiles SET ${profileUpdates.join(', ')} WHERE user_id = ?`,
        profileParams
      );
    }

    return getProfile(userId);
  });
}

export function getPasswordHash(userId) {
  return queryOne(
    `SELECT password_hash FROM users WHERE user_id = ?`,
    [userId]
  );
}

export async function updatePassword(userId, passwordHash) {
  return withUser(userId, async (conn) => {
    await conn.query(
      `UPDATE users SET password_hash = ? WHERE user_id = ?`,
      [passwordHash, userId]
    );
  });
}

export async function getUsersList({ role, search, limit = 50, offset = 0 } = {}) {
  let sql = `
    SELECT 
      u.user_id,
      u.full_name,
      u.email,
      u.phone,
      u.role,
      u.is_active,
      u.created_at,
      u.last_login_at
    FROM users u
    WHERE 1=1
  `;
  const params = [];

  if (role) {
    sql += ` AND u.role = ?`;
    params.push(role);
  }

  if (search) {
    sql += ` AND (u.full_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)`;
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  sql += ` ORDER BY u.user_id ASC LIMIT ? OFFSET ?`;
  params.push(Number(limit), Number(offset));

  const rows = await query(sql, params);
  return rows.map((r) => ({
    userId: r.user_id,
    fullName: r.full_name,
    email: r.email,
    phone: r.phone,
    role: r.role,
    isActive: Boolean(r.is_active),
    memberSince: r.created_at,
    lastLoginAt: r.last_login_at,
  }));
}

export async function registerStaff(adminUserId, { fullName, email, phone, passwordHash, employeeCode, designation, stationId }) {
  return withTransaction(adminUserId, async (conn) => {
    const [userResult] = await conn.query(
      `INSERT INTO users (full_name, email, phone, password_hash, role, is_active)
       VALUES (?, ?, ?, ?, 'STAFF', TRUE)`,
      [fullName, email, phone, passwordHash]
    );

    const userId = userResult.insertId;

    await conn.query(
      `INSERT INTO staff_profiles (user_id, employee_code, designation, station_id, joined_on)
       VALUES (?, ?, ?, ?, CURDATE())`,
      [userId, employeeCode, designation, stationId]
    );

    return {
      userId,
      fullName,
      email,
      phone,
      role: 'STAFF',
      employeeCode,
      designation,
      stationId,
    };
  });
}

export async function updateUserAdmin(adminUserId, targetUserId, { isActive, role }) {
  return withUser(adminUserId, async (conn) => {
    const updates = [];
    const params = [];

    if (isActive !== undefined) {
      updates.push('is_active = ?');
      params.push(Boolean(isActive));
    }

    if (role !== undefined) {
      updates.push('role = ?');
      params.push(role);
    }

    if (updates.length > 0) {
      params.push(targetUserId);
      await conn.query(`UPDATE users SET ${updates.join(', ')} WHERE user_id = ?`, params);
    }

    return getProfile(targetUserId);
  });
}