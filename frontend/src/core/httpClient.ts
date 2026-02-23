import { fetchUtils, HttpError } from 'react-admin';

export const API = `${import.meta.env.VITE_API_URL}`;

const getCookie = (name: string) =>
  document.cookie
    .split('; ')
    .find(c => c.startsWith(name + '='))
    ?.split('=')[1];

async function fetchCsrfToken(): Promise<string | undefined> {
  const res = await fetch(`${API}/csrf`, { credentials: 'include', cache: 'no-store' });
  const fromCookie = getCookie('XSRF-TOKEN');
  if (fromCookie) return decodeURIComponent(fromCookie);

  try {
    const json = await res.json();
    if (json?.token) return String(json.token);
  } catch {
  }
  return undefined;
}

export async function getCsrfHeaderValue(): Promise<string | undefined> {
  const fromCookie = getCookie('XSRF-TOKEN');
  if (fromCookie) return decodeURIComponent(fromCookie);
  return await fetchCsrfToken();
}

export const httpClient: typeof fetchUtils.fetchJson = async (url, options: any = {}) => {
  const method = String(options.method || 'GET').toUpperCase();

  const headers =
    options.headers instanceof Headers
      ? options.headers
      : new Headers(options.headers || {});

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const xsrf = await getCsrfHeaderValue();
    if (xsrf) headers.set('X-XSRF-TOKEN', xsrf);
  }

  try {
    return await fetchUtils.fetchJson(url, {
      ...options,
      headers,
      credentials: 'include',
    });
  } catch (error: any) {
    const status = error?.status;
    const body = error?.body;

    if (status === 400 && body && typeof body === 'object' && body.errors) {
      throw new HttpError(
        body.message || 'Validation failed',
        status,
        body
      );
    }

    throw error;
  }
};
