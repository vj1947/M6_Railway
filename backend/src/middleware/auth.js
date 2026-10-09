// Login checks used by every group.  (Owner: Group 1 - may harden, must not rename.)
//
//   router.get('/bookings/my', requireAuth, controller.myBookings);
//   router.post('/trains', requireAuth, requireRole('ADMIN'), controller.create);
//   router.get('/runs/:runId/chart', requireAuth, requireRole('STAFF', 'ADMIN'), controller.chart);
//
// After requireAuth, req.user = { userId, role, name }.
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { unauthorized, forbidden } from '../utils/errors.js';

export function signToken(user) {
  return jwt.sign(
    { userId: user.user_id, role: user.role, name: user.full_name },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

function readToken(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}

export function requireAuth(req, _res, next) {
  const token = readToken(req);
  if (!token) return next(unauthorized('NOT_LOGGED_IN', 'Log in to continue'));
  try {
    const payload = jwt.verify(token, config.jwt.secret);
    req.user = { userId: payload.userId, role: payload.role, name: payload.name };
    return next();
  } catch (err) {
    const code = err.name === 'TokenExpiredError' ? 'SESSION_EXPIRED' : 'INVALID_TOKEN';
    return next(unauthorized(code, code === 'SESSION_EXPIRED' ? 'Your session has expired. Log in again.' : 'Log in again'));
  }
}

/** Like requireAuth, but lets anonymous users through (req.user stays undefined). */
export function optionalAuth(req, _res, next) {
  const token = readToken(req);
  if (token) {
    try {
      const payload = jwt.verify(token, config.jwt.secret);
      req.user = { userId: payload.userId, role: payload.role, name: payload.name };
    } catch { /* ignore bad tokens for public routes */ }
  }
  next();
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(unauthorized('NOT_LOGGED_IN', 'Log in to continue'));
    if (!roles.includes(req.user.role)) {
      const who = roles.map((r) => r.toLowerCase()).join(' or ');
      return next(forbidden('WRONG_ROLE', `Only ${who} accounts can do this`));
    }
    return next();
  };
}
