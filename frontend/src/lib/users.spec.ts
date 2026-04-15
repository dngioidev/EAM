import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from './api-client';
import {
  createUser,
  deactivateUser,
  fetchAdminStats,
  fetchUsers,
  setUserStatus,
  type CreateUserPayload,
} from './users';

describe('users api client', () => {
  const getSpy = vi.spyOn(apiClient, 'get');
  const postSpy = vi.spyOn(apiClient, 'post');
  const patchSpy = vi.spyOn(apiClient, 'patch');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchUsers sends pagination query params', async () => {
    const response = {
      data: {
        items: [],
        page: 2,
        limit: 25,
        total: 0,
        totalPages: 1,
      },
    };
    getSpy.mockResolvedValue(response);

    const result = await fetchUsers(2, 25);

    expect(getSpy).toHaveBeenCalledWith('/auth/users', {
      params: { page: 2, limit: 25 },
    });
    expect(result).toEqual(response.data);
  });

  it('createUser posts payload to register endpoint', async () => {
    const payload: CreateUserPayload = {
      email: 'new.user@eam.local',
      password: 'Admin@123456',
      name: 'New User',
      role: 'cashier',
      storeId: 'store-1',
    };

    const response = {
      data: {
        id: 'u-1',
        email: payload.email,
        name: payload.name,
        role: payload.role,
        storeId: payload.storeId,
        isActive: true,
        createdAt: '2026-04-16T00:00:00Z',
        updatedAt: '2026-04-16T00:00:00Z',
      },
    };
    postSpy.mockResolvedValue(response);

    const result = await createUser(payload);

    expect(postSpy).toHaveBeenCalledWith('/auth/register', payload);
    expect(result).toEqual(response.data);
  });

  it('deactivateUser calls deactivate endpoint', async () => {
    const response = {
      data: {
        id: 'u-2',
        email: 'staff@eam.local',
        name: 'Staff',
        role: 'cashier',
        storeId: 'store-1',
        isActive: false,
        createdAt: '2026-04-16T00:00:00Z',
        updatedAt: '2026-04-16T00:00:00Z',
      },
    };
    patchSpy.mockResolvedValue(response);

    const result = await deactivateUser('u-2');

    expect(patchSpy).toHaveBeenCalledWith('/auth/users/u-2/deactivate');
    expect(result).toEqual(response.data);
  });

  it('setUserStatus calls status endpoint with ACTIVE payload', async () => {
    const response = {
      data: {
        id: 'u-3',
        email: 'staff2@eam.local',
        name: 'Staff 2',
        role: 'viewer',
        storeId: null,
        isActive: true,
        createdAt: '2026-04-16T00:00:00Z',
        updatedAt: '2026-04-16T00:00:00Z',
      },
    };
    patchSpy.mockResolvedValue(response);

    const result = await setUserStatus('u-3', 'ACTIVE');

    expect(patchSpy).toHaveBeenCalledWith('/auth/users/u-3/status', { status: 'ACTIVE' });
    expect(result).toEqual(response.data);
  });

  it('fetchAdminStats calls stats endpoint', async () => {
    const response = {
      data: {
        totalUsers: 12,
        disabledUsers: 2,
        totalProducts: 25,
        totalTransactions: 40,
      },
    };
    getSpy.mockResolvedValue(response);

    const result = await fetchAdminStats();

    expect(getSpy).toHaveBeenCalledWith('/auth/stats');
    expect(result).toEqual(response.data);
  });
});
