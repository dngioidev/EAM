import { apiClient } from '@/lib/api-client';
import { useAuthStore, type AuthUser } from '@/stores/auth.store';

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export async function login(payload: LoginPayload): Promise<void> {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', payload);
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
