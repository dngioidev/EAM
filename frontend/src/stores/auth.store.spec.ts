/**
 * QA-T007: Frontend unit tests — useAuthStore
 * TC-AUTH-FU01: setTokens updates accessToken + refreshToken
 * TC-AUTH-FU02: setUser updates user object
 * TC-AUTH-FU03: logout clears all auth state
 * TC-AUTH-FU04: initial state is null across all fields
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './auth.store';

const MOCK_USER = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'owner@eam.local',
  role: 'OWNER' as const,
};

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, accessToken: null, refreshToken: null });
    localStorage.clear();
  });

  // TC-AUTH-FU01
  it('setTokens stores accessToken and refreshToken', () => {
    useAuthStore.getState().setTokens('access-tok-123', 'refresh-tok-456');
    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('access-tok-123');
    expect(state.refreshToken).toBe('refresh-tok-456');
  });

  // TC-AUTH-FU02
  it('setUser stores the user object', () => {
    useAuthStore.getState().setUser(MOCK_USER);
    expect(useAuthStore.getState().user).toEqual(MOCK_USER);
  });

  // TC-AUTH-FU03
  it('logout clears all auth state to null', () => {
    useAuthStore.getState().setTokens('tok-a', 'tok-r');
    useAuthStore.getState().setUser(MOCK_USER);
    useAuthStore.getState().logout();

    const { user, accessToken, refreshToken } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(accessToken).toBeNull();
    expect(refreshToken).toBeNull();
  });

  // TC-AUTH-FU04
  it('initial state is null across all fields', () => {
    const { user, accessToken, refreshToken } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(accessToken).toBeNull();
    expect(refreshToken).toBeNull();
  });
});
