# API Client Setup

## Axios Instance

```typescript
// src/lib/api.ts
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import { useSessionStore } from '@/stores/session.store';

const instance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach auth token from store
instance.interceptors.request.use((config) => {
  const token = useSessionStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Unwrap NestJS response envelope { data, meta }
instance.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      useSessionStore.getState().clearSession();
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data ?? error);
  }
);
```

---

## Typed API Functions

```typescript
// Typed wrappers that unwrap the envelope
export const apiClient = {
  get: <T>(url: string, params?: Record<string, unknown>): Promise<T> =>
    instance.get(url, { params }).then(res => res.data ?? res),

  post: <T>(url: string, data?: unknown): Promise<T> =>
    instance.post(url, data).then(res => res.data ?? res),

  patch: <T>(url: string, data?: unknown): Promise<T> =>
    instance.patch(url, data).then(res => res.data ?? res),

  delete: <T>(url: string): Promise<T> =>
    instance.delete(url).then(res => res.data ?? res),
};
```

---

## Environment Variables

```
# .env.local
VITE_API_URL=http://localhost:3000
```

All env vars must be prefixed `VITE_` to be exposed to the browser by Vite.

---

## Error Typing

```typescript
// src/types/api-error.ts
export interface ApiError {
  error: {
    code: string;
    message: string;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    path: string;
  };
}

export function isApiError(error: unknown): error is ApiError {
  return typeof error === 'object' && error !== null && 'error' in error;
}

// Usage in component:
const { error } = useOrder(id);
if (isApiError(error)) {
  return <Alert>{error.error.message}</Alert>;
}
```
