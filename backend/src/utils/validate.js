// Small input helpers. Validate in the controller BEFORE touching the database.
import { badRequest } from './errors.js';

/** Throws 400 listing every missing field. */
export function requireFields(obj, fields) {
  const missing = fields.filter((f) => obj?.[f] === undefined || obj?.[f] === null || obj?.[f] === '');
  if (missing.length) {
    throw badRequest('MISSING_FIELDS', `Missing: ${missing.join(', ')}`, { missing });
  }
}

/** Parses a positive whole number or throws 400. */
export function toId(value, name = 'id') {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) throw badRequest('INVALID_ID', `${name} must be a positive whole number`);
  return n;
}

/** Checks a YYYY-MM-DD date string. */
export function toDate(value, name = 'date') {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '') || Number.isNaN(Date.parse(value))) {
    throw badRequest('INVALID_DATE', `${name} must be a date like 2026-11-20`);
  }
  return value;
}

/** Reads ?page=&pageSize= with safe limits. Default 20 rows per page (FR-C-06). */
export function pagination(query, defaultSize = 20) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, Number.parseInt(query.pageSize, 10) || defaultSize));
  return { page, pageSize, offset: (page - 1) * pageSize };
}

export const isEmail = (v) => typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
export const isPhone = (v) => typeof v === 'string' && /^[6-9]\d{9}$/.test(v);
export const isPnr   = (v) => typeof v === 'string' && /^[1-9]\d{9}$/.test(v);
