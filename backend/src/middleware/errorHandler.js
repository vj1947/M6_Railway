// Turns every thrown error into the standard { success:false, error } response.
// Express 5 forwards errors from async handlers here automatically.
import { AppError, fromDatabaseError } from '../utils/errors.js';
import { fail } from '../utils/response.js';
import { isDev } from '../config/env.js';

export function notFoundHandler(req, res) {
  return fail(res, 404, 'ROUTE_NOT_FOUND', `No API route for ${req.method} ${req.originalUrl}`);
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  if (err?.type === 'entity.parse.failed') {
    return fail(res, 400, 'INVALID_JSON', 'Request body is not valid JSON');
  }

  const appError = err instanceof AppError ? err : fromDatabaseError(err);
  if (appError) {
    if (appError.status >= 500) console.error(`[${req.method} ${req.originalUrl}]`, err.message);
    return fail(res, appError.status, appError.code, appError.message, appError.details);
  }

  console.error(`[${req.method} ${req.originalUrl}]`, err);
  return fail(res, 500, 'SERVER_ERROR', isDev ? String(err?.message || err) : 'Something went wrong on the server');
}
