import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from './api-client';
import {
  disableUser,
  enableUser,
  fetchAdminStats,
  fetchUsers,
} from './users';

describe('users api client', () => {
  const getSpy = vi.spyOn(apiClient, 'get');
  const putSpy = vi.spyOn(apiClient, 'put');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchUsers sends pagination query params to /admin/users', async () => {
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

    expect(getSpy).toHaveBeenCalledWith('/admin/users', {
      params: { page: 2, limit: 25 },
    });
    expect(result).toEqual(response.data);
  });

  it('disableUser calls PUT /admin/users/:id/disable', async () => {
    const response = {
      data: {
        id: 'u-2',
        email: 'owner@eam.local',
        role: 'OWNER',
        status: 'DISABLED',
        created_at: '2026-04-16T00:00:00Z',
        product_count: 3,
      },
    };
    putSpy.mockResolvedValue(response);

    const result = await disableUser('u-2');

    expect(putSpy).toHaveBeenCalledWith('/admin/users/u-2/disable');
    expect(result).toEqual(response.data);
  });

  it('enableUser calls PUT /admin/users/:id/enable', async () => {
    const response = {
      data: {
        id: 'u-3',
        email: 'owner2@eam.local',
        role: 'OWNER',
        status: 'ACTIVE',
        created_at: '2026-04-16T00:00:00Z',
        product_count: 5,
      },
    };
    putSpy.mockResolvedValue(response);

    const result = await enableUser('u-3');

    expect(putSpy).toHaveBeenCalledWith('/admin/users/u-3/enable');
    expect(result).toEqual(response.data);
  });

  it('fetchAdminStats calls GET /admin/stats', async () => {
    const response = {
      data: {
        total_users: 12,
        disabled_users: 2,
        total_products: 25,
        total_transactions: 40,
      },
    };
    getSpy.mockResolvedValue(response);

    const result = await fetchAdminStats();

    expect(getSpy).toHaveBeenCalledWith('/admin/stats');
    expect(result).toEqual(response.data);
  });
});
