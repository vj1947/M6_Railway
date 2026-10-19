// GROUP 1 controller: all endpoints are hooked up to the database.
import bcrypt from 'bcryptjs';
import { ok, created } from '../../utils/response.js';
import { requireFields, isEmail, isPhone, toId } from '../../utils/validate.js';
import { badRequest, unauthorized, forbidden, notFound } from '../../utils/errors.js';
import { signToken } from '../../middleware/auth.js';
import * as service from './service.js';

export async function register(req, res) {
  requireFields(req.body, ['fullName', 'email', 'phone', 'password']);
  const email = String(req.body.email).trim().toLowerCase();
  const phone = String(req.body.phone).trim();
  const fullName = String(req.body.fullName).trim();
  const password = String(req.body.password);

  if (!isEmail(email)) throw badRequest('INVALID_EMAIL', 'Enter a valid email address');
  if (!isPhone(phone)) throw badRequest('INVALID_PHONE', 'Phone must be a 10-digit Indian mobile number');
  if (password.length < 8) throw badRequest('WEAK_PASSWORD', 'Password must be at least 8 characters');

  const existingUser = await service.findUserByEmail(email);
  if (existingUser) throw badRequest('EMAIL_IN_USE', 'An account with this email already exists');

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await service.registerPassenger({
    fullName,
    email,
    phone,
    passwordHash,
  });

  return created(res, newUser);
}

export async function login(req, res) {
  requireFields(req.body, ['email', 'password']);
  const user = await service.findUserByEmail(String(req.body.email).trim().toLowerCase());
  const passwordOk = user && (await bcrypt.compare(String(req.body.password), user.password_hash));
  if (!passwordOk) throw unauthorized('WRONG_CREDENTIALS', 'Email or password is incorrect');
  if (!user.is_active) throw forbidden('ACCOUNT_DISABLED', 'This account has been deactivated. Contact the station office.');

  await service.recordLogin(user.user_id);
  return ok(res, {
    token: signToken(user),
    user: { userId: user.user_id, fullName: user.full_name, email: user.email, role: user.role },
  });
}

export async function logout(_req, res) {
  // Tokens are stateless: the client deletes its copy.
  return ok(res, { loggedOut: true });
}

export async function me(req, res) {
  const profile = await service.getProfile(req.user.userId);
  if (!profile) throw notFound('USER_NOT_FOUND', 'Account not found');
  return ok(res, profile);
}

export async function updateMe(req, res) {
  if (req.body.phone && !isPhone(req.body.phone)) {
    throw badRequest('INVALID_PHONE', 'Phone must be a 10-digit Indian mobile number');
  }

  const updated = await service.updatePassengerProfile(req.user.userId, req.body);
  if (!updated) throw notFound('USER_NOT_FOUND', 'Account not found');

  return ok(res, updated);
}

export async function changePassword(req, res) {
  requireFields(req.body, ['currentPassword', 'newPassword']);
  const { currentPassword, newPassword } = req.body;

  if (String(newPassword).length < 8) {
    throw badRequest('WEAK_PASSWORD', 'New password must be at least 8 characters');
  }

  const user = await service.getPasswordHash(req.user.userId);
  if (!user) throw notFound('USER_NOT_FOUND', 'Account not found');

  const matches = await bcrypt.compare(String(currentPassword), user.password_hash);
  if (!matches) {
    throw unauthorized('WRONG_PASSWORD', 'Current password is incorrect');
  }

  const newHash = await bcrypt.hash(String(newPassword), 10);
  await service.updatePassword(req.user.userId, newHash);

  return ok(res, { passwordChanged: true });
}

export async function listUsers(req, res) {
  const { role, search, limit, offset } = req.query;
  const users = await service.getUsersList({ role, search, limit, offset });
  return ok(res, users);
}

export async function createStaff(req, res) {
  requireFields(req.body, ['fullName', 'email', 'phone', 'employeeCode', 'designation', 'stationId']);

  const email = String(req.body.email).trim().toLowerCase();
  const phone = String(req.body.phone).trim();
  const fullName = String(req.body.fullName).trim();
  const employeeCode = String(req.body.employeeCode).trim().toUpperCase();
  const designation = String(req.body.designation).trim();
  const stationId = toId(req.body.stationId, 'station id');

  if (!isEmail(email)) throw badRequest('INVALID_EMAIL', 'Enter a valid email address');
  if (!isPhone(phone)) throw badRequest('INVALID_PHONE', 'Phone must be a 10-digit Indian mobile number');

  const existingUser = await service.findUserByEmail(email);
  if (existingUser) throw badRequest('EMAIL_IN_USE', 'An account with this email already exists');

  const passwordHash = await bcrypt.hash('Password@123', 10);

  const newStaff = await service.registerStaff(req.user.userId, {
    fullName,
    email,
    phone,
    passwordHash,
    employeeCode,
    designation,
    stationId,
  });

  return created(res, newStaff);
}

export async function updateUser(req, res) {
  const targetUserId = toId(req.params.id, 'user id');
  const { isActive, role } = req.body;

  if (role && !['ADMIN', 'STAFF', 'PASSENGER'].includes(role)) {
    throw badRequest('INVALID_ROLE', 'Role must be ADMIN, STAFF, or PASSENGER');
  }

  const existing = await service.getProfile(targetUserId);
  if (!existing) throw notFound('USER_NOT_FOUND', 'User does not exist');

  const updated = await service.updateUserAdmin(req.user.userId, targetUserId, { isActive, role });
  return ok(res, updated);
}