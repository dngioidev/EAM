import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Transaction, TransactionType } from './entities/transaction.entity';
import { Product } from '../products/entities/product.entity';
import { ImportStockDto } from './dto/import-stock.dto';
import { ExportStockDto } from './dto/export-stock.dto';
import { computeStatus, StockStatus } from '../../common/helpers/stock-status.helper';

export interface TransactionResult {
  transaction: {
    id: string;
    type: TransactionType;
    quantity: number;
    note: string | null;
    createdAt: Date;
  };
  product: {
    id: string;
    name: string;
    quantity: number;
    status: StockStatus;
  };
}

export interface TransactionListResult {
  items: Array<{
    id: string;
    type: TransactionType;
    quantity: number;
    note: string | null;
    createdAt: Date;
  }>;
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    private readonly dataSource: DataSource,
  ) {}

  async import(dto: ImportStockDto, storeId: string | null): Promise<TransactionResult> {
    if (!storeId) throw new ForbiddenException('Store assignment required');

    const product = await this.findProduct(dto.productId, storeId);

    return this.dataSource.transaction(async (manager) => {
      const tx = manager.create(Transaction, {
        storeId,
        productId: product.id,
        type: TransactionType.IMPORT,
        quantity: dto.quantity,
        note: dto.note ?? null,
      });
      const saved = await manager.save(Transaction, tx);

      await manager.increment(Product, { id: product.id }, 'quantity', dto.quantity);
      const updated = await manager.findOneOrFail(Product, { where: { id: product.id } });

      return this.toResult(saved, updated);
    });
  }

  async export(dto: ExportStockDto, storeId: string | null): Promise<TransactionResult> {
    if (!storeId) throw new ForbiddenException('Store assignment required');

    const product = await this.findProduct(dto.productId, storeId);

    if (dto.quantity > product.quantity) {
      throw new BadRequestException(
        `Not enough stock. Current: ${product.quantity}.`,
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const tx = manager.create(Transaction, {
        storeId,
        productId: product.id,
        type: TransactionType.EXPORT,
        quantity: dto.quantity,
        note: dto.note ?? null,
      });
      const saved = await manager.save(Transaction, tx);

      await manager.decrement(Product, { id: product.id }, 'quantity', dto.quantity);
      const updated = await manager.findOneOrFail(Product, { where: { id: product.id } });

      return this.toResult(saved, updated);
    });
  }

  async listTransactions(
    productId: string,
    storeId: string | null,
    page = 1,
    limit = 50,
  ): Promise<TransactionListResult> {
    if (!storeId) throw new ForbiddenException('Store assignment required');
    if (!productId) throw new BadRequestException('product_id is required');

    await this.findProduct(productId, storeId);

    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const skip = (safePage - 1) * safeLimit;

    const [items, total] = await this.transactionRepo.findAndCount({
      where: { productId, storeId },
      order: { createdAt: 'DESC' },
      skip,
      take: safeLimit,
    });

    return {
      items: items.map((t) => ({
        id: t.id,
        type: t.type,
        quantity: t.quantity,
        note: t.note,
        createdAt: t.createdAt,
      })),
      total,
      page: safePage,
      limit: safeLimit,
    };
  }

  private async findProduct(productId: string, storeId: string): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id: productId, storeId },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  private toResult(tx: Transaction, product: Product): TransactionResult {
    return {
      transaction: {
        id: tx.id,
        type: tx.type,
        quantity: tx.quantity,
        note: tx.note,
        createdAt: tx.createdAt,
      },
      product: {
        id: product.id,
        name: product.name,
        quantity: product.quantity,
        status: computeStatus(product.quantity, product.threshold),
      },
    };
  }
}
