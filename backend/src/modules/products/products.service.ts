import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { computeStatus, StockStatus } from '../../common/helpers/stock-status.helper';

export interface ProductWithStatus extends Product {
  status: StockStatus;
  updated_at: string;
}

export interface ProductQuery {
  q?: string;
  page?: number;
  limit?: number;
}

export interface ProductsPage {
  items: ProductWithStatus[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async create(dto: CreateProductDto, storeId: string | null): Promise<ProductWithStatus> {
    if (!storeId) throw new ForbiddenException('Workspace assignment required to create products');

    if (dto.sku) {
      const existing = await this.productsRepository.findOne({
        where: { sku: dto.sku, storeId },
      });
      if (existing) {
        throw new ConflictException('SKU already exists in this workspace');
      }
    }

    const product = this.productsRepository.create({
      sku: dto.sku ?? null,
      name: dto.name,
      priceVnd: 0,
      taxRatePercent: 0,
      threshold: dto.threshold ?? 0,
      storeId,
    });

    const saved = await this.productsRepository.save(product);
    return this.toResponse(saved);
  }

  async findAll(storeId: string | null, _role: string, query: ProductQuery): Promise<ProductsPage> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    const skip = (page - 1) * limit;

    const qb = this.productsRepository
      .createQueryBuilder('product')
      .andWhere('product.deleted_at IS NULL')
      .orderBy('product.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    if (storeId) {
      qb.where('product.store_id = :storeId', { storeId });
    }

    if (query.q) {
      const condition = storeId
        ? '(unaccent(product.name) ILIKE unaccent(:q) OR product.sku = :exactQ)'
        : '(unaccent(product.name) ILIKE unaccent(:q) OR product.sku = :exactQ)';
      qb.andWhere(condition, { q: `%${query.q}%`, exactQ: query.q });
    }

    const [items, total] = await qb.getManyAndCount();
    return {
      items: items.map((p) => this.toResponse(p)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, storeId: string | null, _role: string): Promise<ProductWithStatus> {
    const where = storeId ? { id, storeId } : { id, storeId: IsNull() };
    const product = await this.productsRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (storeId && product.storeId !== storeId) {
      throw new NotFoundException('Product not found');
    }

    return this.toResponse(product);
  }

  async update(id: string, dto: UpdateProductDto, storeId: string | null): Promise<ProductWithStatus> {
    const product = await this.findRaw(id, storeId);

    if (dto.name !== undefined) product.name = dto.name;
    if (dto.threshold !== undefined) product.threshold = dto.threshold;

    const saved = await this.productsRepository.save(product);
    return this.toResponse(saved);
  }

  private async findRaw(id: string, storeId: string | null): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    if (storeId && product.storeId !== storeId) throw new NotFoundException('Product not found');
    return product;
  }

  private toResponse(p: Product): ProductWithStatus {
    return {
      id: p.id,
      sku: p.sku,
      name: p.name,
      quantity: p.quantity,
      threshold: p.threshold,
      isActive: p.isActive,
      storeId: p.storeId,
      priceVnd: p.priceVnd,
      taxRatePercent: p.taxRatePercent,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      deletedAt: p.deletedAt,
      status: computeStatus(p.quantity, p.threshold),
      updated_at: p.updatedAt?.toISOString() ?? new Date().toISOString(),
    } as ProductWithStatus;
  }
}
