import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InventoryService } from './inventory.service';
import { Transaction, TransactionType } from './entities/transaction.entity';
import { Product } from '../products/entities/product.entity';

const STORE_ID = 'store-uuid-1';
const OTHER_STORE = 'store-uuid-2';
const PRODUCT_ID = 'prod-uuid-1';

const mockProduct = (override: Partial<Product> = {}): Product =>
  ({
    id: PRODUCT_ID,
    name: 'Test Product',
    sku: 'SKU-001',
    quantity: 10,
    threshold: 3,
    storeId: STORE_ID,
    priceVnd: 0,
    taxRatePercent: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...override,
  } as Product);

const mockTransaction = (override: Partial<Transaction> = {}): Transaction =>
  ({
    id: 'tx-uuid-1',
    storeId: STORE_ID,
    productId: PRODUCT_ID,
    type: TransactionType.IMPORT,
    quantity: 5,
    note: null,
    createdAt: new Date(),
    ...override,
  } as Transaction);

describe('InventoryService', () => {
  let service: InventoryService;

  const mockTransactionRepo = {
    findOne: jest.fn(),
    findAndCount: jest.fn(),
  };

  const mockProductRepo = {
    findOne: jest.fn(),
  };

  // EntityManager mock used inside dataSource.transaction callback
  const mockManager = {
    create: jest.fn(),
    save: jest.fn(),
    increment: jest.fn(),
    decrement: jest.fn(),
    findOneOrFail: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn((cb: (manager: typeof mockManager) => Promise<unknown>) =>
      cb(mockManager),
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: getRepositoryToken(Transaction), useValue: mockTransactionRepo },
        { provide: getRepositoryToken(Product), useValue: mockProductRepo },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    jest.clearAllMocks();
  });

  // ── import ────────────────────────────────────────────────────────────────

  describe('import', () => {
    it('creates IMPORT transaction and returns updated product with status', async () => {
      const product = mockProduct({ quantity: 5 });
      const updatedProduct = mockProduct({ quantity: 10 });
      const tx = mockTransaction({ type: TransactionType.IMPORT, quantity: 5 });

      mockProductRepo.findOne.mockResolvedValue(product);
      mockManager.create.mockReturnValue(tx);
      mockManager.save.mockResolvedValue(tx);
      mockManager.increment.mockResolvedValue(undefined);
      mockManager.findOneOrFail.mockResolvedValue(updatedProduct);

      const result = await service.import(
        { productId: PRODUCT_ID, quantity: 5 },
        STORE_ID,
      );

      expect(mockManager.save).toHaveBeenCalled();
      expect(mockManager.increment).toHaveBeenCalledWith(
        Product,
        { id: PRODUCT_ID },
        'quantity',
        5,
      );
      expect(result.transaction.type).toBe(TransactionType.IMPORT);
      expect(result.product.quantity).toBe(10);
      expect(result.product.status).toBe('IN_STOCK');
    });

    it('throws ForbiddenException when storeId is null', async () => {
      await expect(
        service.import({ productId: PRODUCT_ID, quantity: 5 }, null),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException when product not found in store', async () => {
      mockProductRepo.findOne.mockResolvedValue(null);
      await expect(
        service.import({ productId: PRODUCT_ID, quantity: 5 }, STORE_ID),
      ).rejects.toThrow(NotFoundException);
    });

    it('returns OUT_OF_STOCK status when quantity remains 0 after import of 0 edge — threshold=0 by default means IN_STOCK at qty>0', async () => {
      const product = mockProduct({ quantity: 0, threshold: 0 });
      const updatedProduct = mockProduct({ quantity: 2, threshold: 0 });
      const tx = mockTransaction({ quantity: 2 });

      mockProductRepo.findOne.mockResolvedValue(product);
      mockManager.create.mockReturnValue(tx);
      mockManager.save.mockResolvedValue(tx);
      mockManager.increment.mockResolvedValue(undefined);
      mockManager.findOneOrFail.mockResolvedValue(updatedProduct);

      const result = await service.import({ productId: PRODUCT_ID, quantity: 2 }, STORE_ID);
      expect(result.product.status).toBe('IN_STOCK');
    });
  });

  // ── export ────────────────────────────────────────────────────────────────

  describe('export', () => {
    it('creates EXPORT transaction and returns updated product', async () => {
      const product = mockProduct({ quantity: 10, threshold: 7 });
      const updatedProduct = mockProduct({ quantity: 5, threshold: 7 });
      const tx = mockTransaction({ type: TransactionType.EXPORT, quantity: 5 });

      mockProductRepo.findOne.mockResolvedValue(product);
      mockManager.create.mockReturnValue(tx);
      mockManager.save.mockResolvedValue(tx);
      mockManager.decrement.mockResolvedValue(undefined);
      mockManager.findOneOrFail.mockResolvedValue(updatedProduct);

      const result = await service.export(
        { productId: PRODUCT_ID, quantity: 5 },
        STORE_ID,
      );

      expect(mockManager.save).toHaveBeenCalled();
      expect(mockManager.decrement).toHaveBeenCalledWith(
        Product,
        { id: PRODUCT_ID },
        'quantity',
        5,
      );
      expect(result.transaction.type).toBe(TransactionType.EXPORT);
      expect(result.product.quantity).toBe(5);
      expect(result.product.status).toBe('LOW_STOCK');
    });

    it('throws BadRequestException with exact message when export exceeds stock', async () => {
      const product = mockProduct({ quantity: 3 });
      mockProductRepo.findOne.mockResolvedValue(product);

      await expect(
        service.export({ productId: PRODUCT_ID, quantity: 10 }, STORE_ID),
      ).rejects.toThrow(new BadRequestException('Not enough stock. Current: 3.'));
    });

    it('returns OUT_OF_STOCK when all stock exported', async () => {
      const product = mockProduct({ quantity: 5, threshold: 3 });
      const updatedProduct = mockProduct({ quantity: 0, threshold: 3 });
      const tx = mockTransaction({ type: TransactionType.EXPORT, quantity: 5 });

      mockProductRepo.findOne.mockResolvedValue(product);
      mockManager.create.mockReturnValue(tx);
      mockManager.save.mockResolvedValue(tx);
      mockManager.decrement.mockResolvedValue(undefined);
      mockManager.findOneOrFail.mockResolvedValue(updatedProduct);

      const result = await service.export({ productId: PRODUCT_ID, quantity: 5 }, STORE_ID);
      expect(result.product.status).toBe('OUT_OF_STOCK');
    });

    it('throws ForbiddenException when storeId is null', async () => {
      await expect(
        service.export({ productId: PRODUCT_ID, quantity: 1 }, null),
      ).rejects.toThrow(ForbiddenException);
    });

    it('rejects product from a different store', async () => {
      mockProductRepo.findOne.mockResolvedValue(null); // not found for OTHER_STORE
      await expect(
        service.export({ productId: PRODUCT_ID, quantity: 1 }, OTHER_STORE),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── listTransactions ──────────────────────────────────────────────────────

  describe('listTransactions', () => {
    it('returns paginated transaction list for a product', async () => {
      const product = mockProduct();
      const txList = [
        mockTransaction({ type: TransactionType.IMPORT }),
        mockTransaction({ type: TransactionType.EXPORT, id: 'tx-uuid-2' }),
      ];

      mockProductRepo.findOne.mockResolvedValue(product);
      mockTransactionRepo.findAndCount.mockResolvedValue([txList, 2]);

      const result = await service.listTransactions(PRODUCT_ID, STORE_ID, 1, 50);

      expect(result.total).toBe(2);
      expect(result.items).toHaveLength(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(50);
    });

    it('throws ForbiddenException when storeId is null', async () => {
      await expect(
        service.listTransactions(PRODUCT_ID, null, 1, 50),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException when product not in store', async () => {
      mockProductRepo.findOne.mockResolvedValue(null);
      await expect(
        service.listTransactions(PRODUCT_ID, STORE_ID, 1, 50),
      ).rejects.toThrow(NotFoundException);
    });

    it('applies pagination correctly', async () => {
      const product = mockProduct();
      mockProductRepo.findOne.mockResolvedValue(product);
      mockTransactionRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.listTransactions(PRODUCT_ID, STORE_ID, 2, 10);

      expect(mockTransactionRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
    });
  });
});
