// src/services/apiClient.js
// One place that knows how to talk HTTP to your backend.
// Every other service file (calendarApi, eventsApi, userApi...) should
// import `request` from here rather than calling fetch directly.
import { getToken } from './authStorage';

// const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.your-temple-app.com/v1';
const BASE_URL = 'https://agamandira.com';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request(path, { method = 'GET', body, headers = {}, auth = true, timeoutMs = 15000 } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const authHeaders = {};
    if (auth) {
      const token = await getToken();
      if (token) authHeaders.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      throw new ApiError(data?.message || 'Something went wrong. Please try again.', response.status, data);
    }

    return data;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new ApiError('The request timed out. Please check your connection.', 0);
    }
    if (err instanceof ApiError) throw err;
    throw new ApiError(err.message || 'We could not reach the server.', 0);
  } finally {
    clearTimeout(timeout);
  }
}

export const apiClient = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  delete: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
};

export { ApiError };
