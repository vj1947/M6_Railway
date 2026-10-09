// Throw an AppError anywhere; the error handler turns it into the standard response.
//   throw notFound('PNR_NOT_FOUND', 'No booking found for PNR 4521876390');

export class AppError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const badRequest   = (code, message, details) => new AppError(400, code, message, details);
export const unauthorized = (code, message) => new AppError(401, code, message);
export const forbidden    = (code, message) => new AppError(403, code, message);
export const notFound     = (code, message) => new AppError(404, code, message);
export const conflict     = (code, message) => new AppError(409, code, message);

// Error codes raised by stored procedures with
//   SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'CODE: Human readable message';
// map to these HTTP statuses. Anything not listed becomes 400.
const PROCEDURE_CODE_STATUS = {
  NOT_IMPLEMENTED: 501,
  NOT_FOUND: 404,
  PNR_NOT_FOUND: 404,
  RUN_NOT_FOUND: 404,
  FORBIDDEN: 403,
  SEAT_UNAVAILABLE: 409,
  ALREADY_CANCELLED: 409,
  ALREADY_PAID: 409,
  CHART_PREPARED: 409,
  BOOKING_CLOSED: 409,
};

/** Converts a MySQL error into an AppError with a clear message. Returns null if it isn't a DB error. */
export function fromDatabaseError(err) {
  if (!err || (!err.code && !err.sqlState)) return null;

  if (err.sqlState === '45000') {
    const text = err.sqlMessage || err.message || '';
    const match = text.match(/^([A-Z_]+):\s*(.*)$/s);
    const code = match ? match[1] : 'PROCEDURE_ERROR';
    const message = match ? match[2] : text;
    return new AppError(PROCEDURE_CODE_STATUS[code] ?? 400, code, message);
  }

  switch (err.code) {
    case 'ER_DUP_ENTRY':
      return conflict('DUPLICATE', duplicateMessage(err.sqlMessage));
    case 'ER_CHECK_CONSTRAINT_VIOLATED':
      return badRequest('INVALID_DATA', `Value not allowed (${constraintName(err.sqlMessage)})`);
    case 'ER_NO_REFERENCED_ROW_2':
    case 'ER_NO_REFERENCED_ROW':
      return badRequest('INVALID_REFERENCE', 'A referenced record does not exist');
    case 'ER_ROW_IS_REFERENCED_2':
    case 'ER_ROW_IS_REFERENCED':
      return conflict('IN_USE', 'This record is used by other records, so it cannot be removed. Deactivate it instead.');
    case 'ER_BAD_NULL_ERROR':
      return badRequest('MISSING_VALUE', err.sqlMessage);
    case 'ER_DATA_TOO_LONG':
      return badRequest('VALUE_TOO_LONG', err.sqlMessage);
    case 'ER_TRUNCATED_WRONG_VALUE':
    case 'WARN_DATA_TRUNCATED':
      return badRequest('INVALID_VALUE', err.sqlMessage);
    case 'ECONNREFUSED':
    case 'PROTOCOL_CONNECTION_LOST':
    case 'ER_ACCESS_DENIED_ERROR':
    case 'ER_BAD_DB_ERROR':
    case 'ETIMEDOUT':
      return new AppError(503, 'DATABASE_UNAVAILABLE', 'Cannot reach the database. Check backend/.env and that MySQL is running.');
    default:
      return null;
  }
}

function duplicateMessage(sqlMessage = '') {
  const key = (sqlMessage.match(/for key '([^']+)'/) || [])[1] || '';
  if (key.includes('email')) return 'This email is already registered';
  if (key.includes('phone')) return 'This phone number is already registered';
  if (key.includes('pnr')) return 'PNR clash, please try again';
  return 'This record already exists';
}

function constraintName(sqlMessage = '') {
  return (sqlMessage.match(/Check constraint '([^']+)'/) || [])[1] || 'check failed';
}
