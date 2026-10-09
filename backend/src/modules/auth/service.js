// GROUP 1 service: all SQL for users and profiles lives here.
import { query, queryOne } from '../../config/db.js';

export function findUserByEmail(email) {
  return queryOne(
    `SELECT user_id, full_name, email, role, password_hash, is_active
       FROM users
      WHERE email = ?`,
    [email]
  );
}

export async function recordLogin(userId) {
  await query('UPDATE users SET last_login_at = NOW() WHERE user_id = ?', [userId]);
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
