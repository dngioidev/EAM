import { apiClient } from '@/lib/api-client';
import { useAuthStore, type AuthUser } from '@/stores/auth.store';

interface AuthPayload {
  email: string;
  password: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export async function login(payload: AuthPayload): Promise<void> {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
  useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);
  useAuthStore.getState().setUser(data.user);
}

export async function register(payload: AuthPayload): Promise<void> {
  const { data } = await apiClient.post<AuthResponse>('/auth/register', payload);
  useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);
  useAuthStore.getState().setUser(data.user);
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout');
  } finally {
    useAuthStore.getState().logout();
  }
}
