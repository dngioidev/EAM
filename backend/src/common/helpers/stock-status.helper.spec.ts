import { computeStatus } from './stock-status.helper';

describe('computeStatus', () => {
  it('returns OUT_OF_STOCK when quantity is 0', () => {
    expect(computeStatus(0, 0)).toBe('OUT_OF_STOCK');
    expect(computeStatus(0, 5)).toBe('OUT_OF_STOCK');
  });

  it('returns LOW_STOCK when quantity <= threshold and threshold > 0', () => {
    expect(computeStatus(3, 5)).toBe('LOW_STOCK');
    expect(computeStatus(5, 5)).toBe('LOW_STOCK');
  });

  it('returns IN_STOCK when threshold is 0 and quantity > 0', () => {
    expect(computeStatus(1, 0)).toBe('IN_STOCK');
    expect(computeStatus(100, 0)).toBe('IN_STOCK');
  });

  it('returns IN_STOCK when quantity > threshold', () => {
    expect(computeStatus(10, 5)).toBe('IN_STOCK');
    expect(computeStatus(6, 5)).toBe('IN_STOCK');
  });
});
