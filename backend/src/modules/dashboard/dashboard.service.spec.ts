import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { Product } from '../products/entities/product.entity';

const buildProduct = (overrides: Partial<Product> = {}): Product =>
  ({
    id: 'p-1',
    name: 'Test Product',
    sku: 'SKU-001',
    quantity: 10,
    threshold: 5,
    isActive: true,
    storeId: 'store-1',
    ...overrides,
  }) as Product;

const mockProductsRepository = {
  find: jest.fn(),
};

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductsRepository,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    jest.clearAllMocks();
  });

  describe('getSummary', () => {
    it('returns empty result when storeId is null (admin user)', async () => {
      const result = await service.getSummary(null);

      expect(result).toEqual({ totalProducts: 0, lowStock: [], outOfStock: [] });
      expect(mockProductsRepository.find).not.toHaveBeenCalled();
    });

    it('returns correct counts for a store with no stock issues', async () => {
      mockProductsRepository.find.mockResolvedValue([
        buildProduct({ quantity: 20, threshold: 5 }),
        buildProduct({ id: 'p-2', sku: 'SKU-002', quantity: 15, threshold: 10 }),
      ]);

      const result = await service.getSummary('store-1');

      expect(result.totalProducts).toBe(2);
      expect(result.lowStock).toHaveLength(0);
      expect(result.outOfStock).toHaveLength(0);
    });

    it('identifies out-of-stock products (quantity === 0)', async () => {
      mockProductsRepository.find.mockResolvedValue([
        buildProduct({ quantity: 0, threshold: 5 }),
        buildProduct({ id: 'p-2', sku: 'SKU-002', quantity: 10, threshold: 5 }),
      ]);

      const result = await service.getSummary('store-1');

      expect(result.totalProducts).toBe(2);
      expect(result.outOfStock).toHaveLength(1);
      expect(result.outOfStock[0].id).toBe('p-1');
      expect(result.lowStock).toHaveLength(0);
    });

    it('identifies low-stock products (0 < quantity <= threshold, threshold > 0)', async () => {
      mockProductsRepository.find.mockResolvedValue([
        buildProduct({ quantity: 3, threshold: 5 }),
        buildProduct({ id: 'p-2', sku: 'SKU-002', quantity: 10, threshold: 5 }),
      ]);

      const result = await service.getSummary('store-1');

      expect(result.totalProducts).toBe(2);
      expect(result.lowStock).toHaveLength(1);
      expect(result.lowStock[0].id).toBe('p-1');
      expect(result.outOfStock).toHaveLength(0);
    });

    it('does NOT include out-of-stock items in low-stock list', async () => {
      mockProductsRepository.find.mockResolvedValue([
        buildProduct({ quantity: 0, threshold: 5 }),
      ]);

      const result = await service.getSummary('store-1');

      expect(result.outOfStock).toHaveLength(1);
      expect(result.lowStock).toHaveLength(0);
    });

    it('does NOT flag as low-stock when threshold is 0', async () => {
      mockProductsRepository.find.mockResolvedValue([
        buildProduct({ quantity: 1, threshold: 0 }),
      ]);

      const result = await service.getSummary('store-1');

      expect(result.lowStock).toHaveLength(0);
      expect(result.outOfStock).toHaveLength(0);
    });

    it('queries only active products for the given storeId', async () => {
      mockProductsRepository.find.mockResolvedValue([]);

      await service.getSummary('store-42');

      expect(mockProductsRepository.find).toHaveBeenCalledWith({
        where: { storeId: 'store-42', isActive: true },
        select: ['id', 'name', 'sku', 'quantity', 'threshold'],
      });
    });

    it('maps product fields correctly in dashboard items', async () => {
      const product = buildProduct({ quantity: 2, threshold: 5 });
      mockProductsRepository.find.mockResolvedValue([product]);

      const result = await service.getSummary('store-1');

      expect(result.lowStock[0]).toEqual({
        id: 'p-1',
        name: 'Test Product',
        sku: 'SKU-001',
        quantity: 2,
        threshold: 5,
      });
    });
  });
});
