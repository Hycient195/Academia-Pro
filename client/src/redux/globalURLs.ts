/**
 * Robust API base URL builder with safe fallback and single trailing slash.
 * - Falls back to http://localhost:3001 when NEXT_PUBLIC_API_BASE_URL is undefined.
 * - Strips a trailing '/api/v1' from the env var to avoid duplicating the path.
 * - Ensures exactly one trailing slash on GLOBAL_BASEURL.
 */
const envBase = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001').trim();

// Strip a trailing '/api/v1' if present to avoid duplicating the path
const baseWithoutApiV1 = envBase.replace(/\/?api\/v1\/?$/, '');

// Ensure exactly one trailing slash
export const GLOBAL_BASEURL = baseWithoutApiV1.endsWith('/') ? baseWithoutApiV1 : `${baseWithoutApiV1}/`;

// Final API root used by RTK Query clients (e.g., http://localhost:3001/api/v1)
export const GLOBAL_API_URL = `${GLOBAL_BASEURL}api/v1`;