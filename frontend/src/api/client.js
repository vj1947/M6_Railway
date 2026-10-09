// The ONE way the frontend talks to the backend. (Owner: Core Team)
//
//   import { api } from '../../api/client';
//   const { data, meta } = await api.get('/search/trains', { params: { from, to, date } });
//   await api.post('/bookings', body);
//
// - Adds the login token automatically.
// - Unwraps { success, data, error, meta }: you get { data, meta } back.
// - Throws ApiError (with .code and .message) when success is false.
import axios from 'axios';

const TOKEN_KEY = 'pravas.token';

export class ApiError extends Error {
  constructor(code, message, status, details) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export const tokenStore = {
  get() { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } },
  set(t) { try { localStorage.setItem(TOKEN_KEY, t); } catch { /* storage blocked */ } },
  clear() { try { localStorage.removeItem(TOKEN_KEY); } catch { /* storage blocked */ } },
};

const http = axios.create({ baseURL: '/api/v1', timeout: 15000 });

http.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let onSessionExpired = () => {};
export function setSessionExpiredHandler(fn) { onSessionExpired = fn; }

function unwrap(response) {
  const body = response.data;
  return { data: body?.data ?? null, meta: body?.meta ?? null };
}

function toApiError(err) {
  const body = err.response?.data;
  if (body?.error) {
    if (body.error.code === 'SESSION_EXPIRED' || body.error.code === 'INVALID_TOKEN') onSessionExpired();
    return new ApiError(body.error.code, body.error.message, err.response.status, body.error.details);
  }
  if (err.code === 'ECONNABORTED') return new ApiError('TIMEOUT', 'The server took too long to answer. Try again.', 0);
  if (!err.response) return new ApiError('NETWORK', 'Cannot reach the server. Is the backend running on port 5000?', 0);
  return new ApiError('SERVER_ERROR', `Server error (${err.response.status})`, err.response.status);
}

async function call(promise) {
  try {
    return unwrap(await promise);
  } catch (err) {
    throw toApiError(err);
  }
}

export const api = {
  get: (url, config) => call(http.get(url, config)),
  post: (url, body, config) => call(http.post(url, body, config)),
  put: (url, body, config) => call(http.put(url, body, config)),
  patch: (url, body, config) => call(http.patch(url, body, config)),
  delete: (url, config) => call(http.delete(url, config)),
};
