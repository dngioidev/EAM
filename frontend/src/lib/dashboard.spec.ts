/**
 * QA — Dashboard API client unit tests
 * TC-DASH-U01: fetchDashboard calls GET /dashboard
 * TC-DASH-U02: returns totalProducts count from response
 * TC-DASH-U03: returns lowStock list from response
 * TC-DASH-U04: returns outOfStock list from response
 * TC-DASH-U05: returns empty lists when all products are in stock
 * TC-DASH-U06: propagates API error when request fails
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from './api-client';
import { fetchDashboard, type DashboardItem, type DashboardSummary } from './dashboard';

describe('dashboard api client', () => {
  const getSpy = vi.spyOn(apiClient, 'get');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const buildItem = (overrides: Partial<DashboardItem> = {}): DashboardItem => ({
    id: 'p-1',
    name: 'Test Product',
    sku: 'SKU-001',
    quantity: 3,
    threshold: 5,
    ...overrides,
  });

  // ── Happy Path ────────────────────────────────────────────────────────────

  // TC-DASH-U01
  it('fetchDashboard calls GET /dashboard with no extra params', async () => {
    const summary: DashboardSummary = { totalProducts: 0, lowStock: [], outOfStock: [] };
    getSpy.mockResolvedValue({ data: summary });

    await fetchDashboard();

    expect(getSpy).toHaveBeenCalledWith('/dashboard');
    expect(getSpy).toHaveBeenCalledTimes(1);
  });

  // TC-DASH-U02
  it('returns totalProducts count from response', async () => {
    const summary: DashboardSummary = { totalProducts: 7, lowStock: [], outOfStock: [] };
    getSpy.mockResolvedValue({ data: summary });

    const result = await fetchDashboard();

    expect(result.totalProducts).toBe(7);
  });

  // TC-DASH-U03
  it('returns lowStock list with full item shape', async () => {
    const item = buildItem({ id: 'p-1', quantity: 2, threshold: 5 });
    const summary: DashboardSummary = { totalProducts: 3, lowStock: [item], outOfStock: [] };
    getSpy.mockResolvedValue({ data: summary });

    const result = await fetchDashboard();

    expect(result.lowStock).toHaveLength(1);
    expect(result.lowStock[0]).toEqual(item);
  });

  // TC-DASH-U04
  it('returns outOfStock list with full item shape', async () => {
    const item = buildItem({ id: 'p-2', name: 'Empty Widget', sku: 'EW-002', quantity: 0, threshold: 10 });
    const summary: DashboardSummary = { totalProducts: 4, lowStock: [], outOfStock: [item] };
    getSpy.mockResolvedValue({ data: summary });

    const result = await fetchDashboard();

    expect(result.outOfStock).toHaveLength(1);
    expect(result.outOfStock[0]).toEqual(item);
  });

  // TC-DASH-U05
  it('returns empty low-stock and out-of-stock lists when all products are healthy', async () => {
    const summary: DashboardSummary = { totalProducts: 10, lowStock: [], outOfStock: [] };
    getSpy.mockResolvedValue({ data: summary });

    const result = await fetchDashboard();

    expect(result.lowStock).toHaveLength(0);
    expect(result.outOfStock).toHaveLength(0);
  });

  // ── Edge Cases ────────────────────────────────────────────────────────────

  it('handles both lowStock and outOfStock populated simultaneously', async () => {
    const lowItem = buildItem({ id: 'p-3', quantity: 1, threshold: 5 });
    const outItem = buildItem({ id: 'p-4', quantity: 0, threshold: 5 });
    const summary: DashboardSummary = {
      totalProducts: 5,
      lowStock: [lowItem],
      outOfStock: [outItem],
    };
    getSpy.mockResolvedValue({ data: summary });

    const result = await fetchDashboard();

    expect(result.lowStock).toHaveLength(1);
    expect(result.outOfStock).toHaveLength(1);
    expect(result.totalProducts).toBe(5);
  });

  it('handles items with null/empty sku gracefully', async () => {
    const item = buildItem({ sku: '' });
    const summary: DashboardSummary = { totalProducts: 1, lowStock: [item], outOfStock: [] };
    getSpy.mockResolvedValue({ data: summary });

    const result = await fetchDashboard();

    expect(result.lowStock[0].sku).toBe('');
  });

  // TC-DASH-U06
  it('propagates API error when request fails', async () => {
    const networkError = new Error('Network Error');
    getSpy.mockRejectedValue(networkError);

    await expect(fetchDashboard()).rejects.toThrow('Network Error');
  });
});
