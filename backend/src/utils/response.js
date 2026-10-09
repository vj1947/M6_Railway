// Every API response has exactly this shape:
//   { "success": true,  "data": {...}, "error": null }
//   { "success": false, "data": null,  "error": { "code": "SEAT_UNAVAILABLE", "message": "..." } }
// Never call res.json() directly in a controller - use these helpers.

export function ok(res, data, { status = 200, meta } = {}) {
  const body = { success: true, data, error: null };
  if (meta) body.meta = meta;
  return res.status(status).json(body);
}

export function created(res, data, options = {}) {
  return ok(res, data, { ...options, status: 201 });
}

export function fail(res, status, code, message, details) {
  const error = { code, message };
  if (details) error.details = details;
  return res.status(status).json({ success: false, data: null, error });
}

/**
 * Used by stub endpoints until the owner group builds the real one.
 * The frontend shows a small "sample data" note when meta.stub is true.
 * DELETE the stub() call when you replace it with real logic.
 */
export function stub(res, owner, data, { status = 200 } = {}) {
  return ok(res, data, { status, meta: { stub: true, owner } });
}
