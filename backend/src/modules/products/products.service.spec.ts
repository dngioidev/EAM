import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';

const ADMIN_STORE = 'store-uuid-1';
const OTHER_STORE = 'store-uuid-2';

const mockProduct = (override: Partial<Product> = {}): Product =>
  ({
    id: 'prod-uuid-1',
    sku: 'SKU-001',
    name: 'Bánh mì thịt',
    priceVnd: 25000,
    taxRatePercent: 10,
    isActive: true,
    storeId: ADMIN_STORE,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...override,
  } as Product);

// Minimal mock for QueryBuilder used in findAll
function makeQB(results: Product[], count: number) {
  const qb = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([results, count]),
  } as unknown as SelectQueryBuilder<Product>;
  return qb;
}

describe('ProductsService', () => {
  let service: ProductsService;
  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    jest.clearAllMocks();
  });

  // ─── create ───────────────────────────────────────────────────────────────

  it('creates a product successfully', async () => {
    mockRepository.findOne.mockResolvedValue(null);
    const created = mockProduct();
    mockRepository.create.mockReturnValue(created);
    mockRepository.save.mockResolvedValue(created);

    const result = await service.create(
      { sku: 'SKU-001', name: 'Bánh mì thịt', priceVnd: 25000, taxRatePercent: 10 },
      ADMIN_STORE,
    );
    expect(result.sku).toBe('SKU-001');
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it('throws ConflictException for duplicate SKU in same store', async () => {
    mockRepository.findOne.mockResolvedValue(mockProduct());
    await expect(
      service.create(
        { sku: 'SKU-001', name: 'Copy', priceVnd: 1000, taxRatePercent: 0 },
        ADMIN_STORE,
      ),
    ).rejects.toThrow(ConflictException);
  });

  it('allows same SKU in a different store (BR-PROD-03)', async () => {
    mockRepository.findOne.mockResolvedValue(null); // different store → no conflict
    const created = mockProduct({ storeId: OTHER_STORE });
    mockRepository.create.mockReturnValue(created);
    mockRepository.save.mockResolvedValue(created);

    const result = await service.create(
      { sku: 'SKU-001', name: 'Other store copy', priceVnd: 1000, taxRatePercent: 0 },
      OTHER_STORE,
    );
    expect(result.storeId).toBe(OTHER_STORE);
  });

  it('accepts priceVnd = 0 (BR-PROD-01 allows zero)', async () => {
    mockRepository.findOne.mockResolvedValue(null);
    const created = mockProduct({ priceVnd: 0 });
    mockRepository.create.mockReturnValue(created);
    mockRepository.save.mockResolvedValue(created);

    const result = await service.create(
      { sku: 'FREE-01', name: 'Freebie', priceVnd: 0, taxRatePercent: 0 },
      ADMIN_STORE,
    );
    expect(result.priceVnd).toBe(0);
  });

  // ─── findAll ──────────────────────────────────────────────────────────────

  it('cashier query includes is_active filter (BR-PROD-09)', async () => {
    const qb = makeQB([mockProduct()], 1);
    mockRepository.createQueryBuilder.mockReturnValue(qb);

    await service.findAll(ADMIN_STORE, 'cashier', { page: 1, limit: 20 });

    // andWhere should have been called with active filter
    const andWhereCalls: string[] = (qb.andWhere as jest.Mock).mock.calls.map(
      (call: [string]) => call[0],
    );
    expect(andWhereCalls.some((c) => c.includes('is_active'))).toBe(true);
  });

  it('manager query does NOT force is_active filter (BR-PROD-08)', async () => {
    const qb = makeQB([mockProduct(), mockProduct({ isActive: false })], 2);
    mockRepository.createQueryBuilder.mockReturnValue(qb);

    await service.findAll(ADMIN_STORE, 'store-manager', { page: 1, limit: 20 });

    const andWhereCalls: string[] = (qb.andWhere as jest.Mock).mock.calls.map(
      (call: [string]) => call[0],
    );
    expect(andWhereCalls.some((c) => c.includes('is_active'))).toBe(false);
  });

  // ─── findOne ──────────────────────────────────────────────────────────────

  it('returns product to manager even when deactivated', async () => {
    mockRepository.findOne.mockResolvedValue(mockProduct({ isActive: false }));
    const result = await service.findOne('prod-uuid-1', ADMIN_STORE, 'store-manager');
    expect(result.isActive).toBe(false);
  });

  it('throws NotFoundException for cashier accessing deactivated product (BR-PROD-07)', async () => {
    mockRepository.findOne.mockResolvedValue(mockProduct({ isActive: false }));
    await expect(
      service.findOne('prod-uuid-1', ADMIN_STORE, 'cashier'),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws NotFoundException for cross-store access', async () => {
    mockRepository.findOne.mockResolvedValue(null); // different storeId → not found
    await expect(
      service.findOne('prod-uuid-1', OTHER_STORE, 'admin'),
    ).rejects.toThrow(NotFoundException);
  });

  // ─── update ───────────────────────────────────────────────────────────────

  it('throws BadRequestException if sku is passed in update (BR-PROD-05)', async () => {
    await expect(
      service.update('prod-uuid-1', { name: 'New name', sku: 'NEW-SKU' } as any, ADMIN_STORE),
    ).rejects.toThrow(BadRequestException);
  });

  it('updates name + price successfully', async () => {
    const prod = mockProduct();
    mockRepository.findOne.mockResolvedValue(prod);
    mockRepository.save.mockResolvedValue({ ...prod, name: 'Updated', priceVnd: 30000 } as Product);

    const result = await service.update('prod-uuid-1', { name: 'Updated', priceVnd: 30000 }, ADMIN_STORE);
    expect(result.name).toBe('Updated');
    expect(result.priceVnd).toBe(30000);
  });

  // ─── deactivate ───────────────────────────────────────────────────────────

  it('deactivates a product idempotently', async () => {
    const prod = mockProduct({ isActive: true });
    mockRepository.findOne.mockResolvedValue(prod);
    mockRepository.save.mockResolvedValue({ ...prod, isActive: false } as Product);

    const result = await service.deactivate('prod-uuid-1', ADMIN_STORE);
    expect(result.isActive).toBe(false);
  });

  it('deactivating already-inactive product is idempotent', async () => {
    const prod = mockProduct({ isActive: false });
    mockRepository.findOne.mockResolvedValue(prod);
    mockRepository.save.mockResolvedValue(prod);

    const result = await service.deactivate('prod-uuid-1', ADMIN_STORE);
    expect(result.isActive).toBe(false);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });
});
