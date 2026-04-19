/**
 * ProductsService tests — updated for EAM spec (no priceVnd/taxRatePercent, items[] response)
 */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';

const OWNER_STORE = 'store-uuid-1';
const OTHER_STORE = 'store-uuid-2';

const mockProduct = (override: Partial<Product> = {}): Product =>
  ({
    id: 'prod-uuid-1',
    sku: 'SKU-001',
    name: 'Bánh mì thịt',
    priceVnd: 0,
    taxRatePercent: 0,
    quantity: 10,
    threshold: 3,
    isActive: true,
    storeId: OWNER_STORE,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...override,
  } as Product);

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

  it('creates a product with name only (EAM spec — sku optional)', async () => {
    mockRepository.findOne.mockResolvedValue(null);
    const created = mockProduct({ sku: null });
    mockRepository.create.mockReturnValue(created);
    mockRepository.save.mockResolvedValue(created);

    const result = await service.create({ name: 'Bánh mì thịt' }, OWNER_STORE);
    expect(result.name).toBe('Bánh mì thịt');
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it('creates a product with optional SKU', async () => {
    mockRepository.findOne.mockResolvedValue(null);
    const created = mockProduct();
    mockRepository.create.mockReturnValue(created);
    mockRepository.save.mockResolvedValue(created);

    const result = await service.create({ name: 'Bánh mì thịt', sku: 'SKU-001' }, OWNER_STORE);
    expect(result.sku).toBe('SKU-001');
  });

  it('throws ConflictException for duplicate SKU in same workspace', async () => {
    mockRepository.findOne.mockResolvedValue(mockProduct());
    await expect(
      service.create({ name: 'Copy', sku: 'SKU-001' }, OWNER_STORE),
    ).rejects.toThrow(ConflictException);
  });

  it('allows same SKU in a different workspace', async () => {
    mockRepository.findOne.mockResolvedValue(null);
    const created = mockProduct({ storeId: OTHER_STORE });
    mockRepository.create.mockReturnValue(created);
    mockRepository.save.mockResolvedValue(created);

    const result = await service.create({ name: 'Copy', sku: 'SKU-001' }, OTHER_STORE);
    expect(result.storeId).toBe(OTHER_STORE);
  });

  // ─── findAll ──────────────────────────────────────────────────────────────

  it('returns items[] with status computed from quantity/threshold', async () => {
    const qb = makeQB([mockProduct({ quantity: 0 })], 1);
    mockRepository.createQueryBuilder.mockReturnValue(qb);

    const result = await service.findAll(OWNER_STORE, 'OWNER', { page: 1, limit: 20 });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].status).toBe('OUT_OF_STOCK');
    expect(result.total).toBe(1);
  });

  it('returns empty list when no products in workspace', async () => {
    const qb = makeQB([], 0);
    mockRepository.createQueryBuilder.mockReturnValue(qb);

    const result = await service.findAll(OWNER_STORE, 'OWNER', {});
    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  // ─── findOne ──────────────────────────────────────────────────────────────

  it('returns a product with computed status', async () => {
    mockRepository.findOne.mockResolvedValue(mockProduct({ quantity: 2, threshold: 5 }));
    const result = await service.findOne('prod-uuid-1', OWNER_STORE, 'OWNER');
    expect(result.status).toBe('LOW_STOCK');
  });

  it('throws NotFoundException for cross-workspace access', async () => {
    mockRepository.findOne.mockResolvedValue(mockProduct({ storeId: OWNER_STORE }));
    await expect(
      service.findOne('prod-uuid-1', OTHER_STORE, 'OWNER'),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws NotFoundException when product does not exist', async () => {
    mockRepository.findOne.mockResolvedValue(null);
    await expect(
      service.findOne('prod-uuid-1', OWNER_STORE, 'OWNER'),
    ).rejects.toThrow(NotFoundException);
  });

  // ─── update ───────────────────────────────────────────────────────────────

  it('updates name and threshold', async () => {
    const prod = mockProduct();
    mockRepository.findOne.mockResolvedValue(prod);
    mockRepository.save.mockResolvedValue({ ...prod, name: 'Updated', threshold: 10 } as Product);

    const result = await service.update('prod-uuid-1', { name: 'Updated', threshold: 10 }, OWNER_STORE);
    expect(result.name).toBe('Updated');
    expect(result.threshold).toBe(10);
  });

  it('throws NotFoundException when updating non-existent product', async () => {
    mockRepository.findOne.mockResolvedValue(null);
    await expect(
      service.update('no-such-id', { name: 'X' }, OWNER_STORE),
    ).rejects.toThrow(NotFoundException);
  });
});
