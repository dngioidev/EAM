export type StockStatus = 'OUT_OF_STOCK' | 'LOW_STOCK' | 'IN_STOCK';

export function computeStatus(quantity: number, threshold: number): StockStatus {
  if (quantity === 0) return 'OUT_OF_STOCK';
  if (threshold > 0 && quantity <= threshold) return 'LOW_STOCK';
  return 'IN_STOCK';
}
