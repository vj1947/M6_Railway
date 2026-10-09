// GROUP 1 controller. login, logout and me are real; the rest return sample data.
import bcrypt from 'bcryptjs';
import { ok, stub } from '../../utils/response.js';
import { requireFields, isEmail, isPhone, toId } from '../../utils/validate.js';
import { badRequest, unauthorized, forbidden, notFound } from '../../utils/errors.js';
import { signToken } from '../../middleware/auth.js';
import * as service from './service.js';
import * as sample from './sample.js';

const OWNER = 'Group 1';

export async function register(req, res) {
  requireFields(req.body, ['fullName', 'email', 'phone', 'password']);
  if (!isEmail(req.body.email)) throw badRequest('INVALID_EMAIL', 'Enter a valid email address');
  if (!isPhone(req.body.phone)) throw badRequest('INVALID_PHONE', 'Phone must be a 10-digit Indian mobile number');
  if (String(req.body.password).length < 8) throw badRequest('WEAK_PASSWORD', 'Password must be at least 8 characters');
  // TODO Group 1: hash with bcrypt, insert users + passenger_profiles in ONE transaction, return 201.
  return stub(res, OWNER, sample.registeredUser(req.body), { status: 201 });
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
  // Tokens are stateless: the frontend deletes its copy. Nothing to store.
  return ok(res, { loggedOut: true });
}

export async function me(req, res) {
  const profile = await service.getProfile(req.user.userId);
  if (!profile) throw notFound('USER_NOT_FOUND', 'Account not found');
  return ok(res, profile);
}

export async function updateMe(req, res) {
  return stub(res, OWNER, { ...sample.profile, ...req.body });
}

export async function changePassword(req, res) {
  requireFields(req.body, ['currentPassword', 'newPassword']);
  return stub(res, OWNER, { passwordChanged: true });
}

export async function listUsers(_req, res) {
  return stub(res, OWNER, sample.userList);
}

export async function createStaff(req, res) {
  requireFields(req.body, ['fullName', 'email', 'phone', 'employeeCode', 'designation', 'stationId']);
  return stub(res, OWNER, { userId: 211, role: 'STAFF', ...req.body }, { status: 201 });
}

export async function updateUser(req, res) {
  const userId = toId(req.params.id, 'user id');
  return stub(res, OWNER, { userId, ...req.body });
}
