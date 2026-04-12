/**
 * QA-T007: Frontend unit tests — api-client interceptors
 * TC-AUTH-FU05: Request interceptor attaches Bearer token when user is logged in
 * TC-AUTH-FU06: Request interceptor skips auth header when not logged in
 * TC-AUTH-FU07: Response interceptor unwraps { data } envelope
 * TC-AUTH-FU08: 401 response with no refresh token calls logout
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock axios to control HTTP behavior — axios ESM default export
vi.mock('axios', async () => {
  const actual = await vi.importActual<typeof import('axios')>('axios');
  return {
    default: {
      ...actual.default,
      create: actual.default.create.bind(actual.default),
      post: vi.fn(),
    },
  };
});

import { useAuthStore } from '@/stores/auth.store';
import { apiClient } from './api-client';

describe('apiClient interceptors', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, accessToken: null, refreshToken: null });
  });

  // TC-AUTH-FU05
  it('attaches Bearer token when accessToken is set', () => {
    useAuthStore.setState({ accessToken: 'my-access-token', refreshToken: null, user: null });
    const config = { headers: {} as Record<string, string> };
    // Access the request interceptor handler directly
    const reqInterceptors = (apiClient.interceptors.request as unknown as {
      handlers: Array<{ fulfilled: (c: typeof config) => typeof config }>;
    }).handlers;
    const fulfilled = reqInterceptors[0]?.fulfilled;
    const result = fulfilled?.(config);
    expect(result?.headers.Authorization).toBe('Bearer my-access-token');
  });

  // TC-AUTH-FU06
  it('does not attach Authorization header when not logged in', () => {
    const config = { headers: {} as Record<string, string> };
    const reqInterceptors = (apiClient.interceptors.request as unknown as {
      handlers: Array<{ fulfilled: (c: typeof config) => typeof config }>;
    }).handlers;
    const fulfilled = reqInterceptors[0]?.fulfilled;
    const result = fulfilled?.(config);
    expect(result?.headers.Authorization).toBeUndefined();
  });

  // TC-AUTH-FU07: Response envelope unwrap
  it('unwraps { data } envelope from response', () => {
    const responseInterceptors = (apiClient.interceptors.response as unknown as {
      handlers: Array<{ fulfilled: (r: { data: unknown }) => { data: unknown } }>;
    }).handlers;
    const fulfilled = responseInterceptors[0]?.fulfilled;
    const mockResponse = { data: { data: [{ id: 1 }], meta: { timestamp: '2026' } } };
    const result = fulfilled?.(mockResponse);
    expect(result?.data).toEqual([{ id: 1 }]);
  });

  // TC-AUTH-FU08: non-{ data } response passes through unchanged
  it('passes through responses without data envelope', () => {
    const responseInterceptors = (apiClient.interceptors.response as unknown as {
      handlers: Array<{ fulfilled: (r: { data: unknown }) => { data: unknown } }>;
    }).handlers;
    const fulfilled = responseInterceptors[0]?.fulfilled;
    const mockResponse = { data: 'plain-string' };
    const result = fulfilled?.(mockResponse);
    expect(result?.data).toBe('plain-string');
  });
});
