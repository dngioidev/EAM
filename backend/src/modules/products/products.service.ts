import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

const MANAGER_ROLES = ['admin', 'store-manager', 'accountant'];
const CASHIER_VISIBLE_ROLES = ['cashier', 'viewer'];

export interface ProductQuery {
  q?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async create(dto: CreateProductDto, storeId: string): Promise<Product> {
    const existing = await this.productsRepository.findOne({
      where: { sku: dto.sku, storeId },
    });

    if (existing) {
      throw new ConflictException('SKU already exists in this store');
    }

    const product = this.productsRepository.create({
      sku: dto.sku,
      name: dto.name,
      priceVnd: dto.priceVnd,
      taxRatePercent: dto.taxRatePercent,
      storeId,
    });

    return this.productsRepository.save(product);
  }

  async findAll(storeId: string, role: string, query: ProductQuery): Promise<{ data: Product[]; total: number }> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    const skip = (page - 1) * limit;

    const qb = this.productsRepository
      .createQueryBuilder('product')
      .where('product.store_id = :storeId', { storeId })
      .andWhere('product.deleted_at IS NULL')
      .orderBy('product.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    // BR-PROD-07/09: cashier and viewer see only active products
    if (CASHIER_VISIBLE_ROLES.includes(role)) {
      qb.andWhere('product.is_active = true');
    }

    // BR-PROD-11: diacritic-insensitive search with unaccent
    if (query.q) {
      qb.andWhere(
        '(unaccent(product.name) ILIKE unaccent(:q) OR product.sku = :exactQ)',
        { q: `%${query.q}%`, exactQ: query.q },
      );
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async findOne(id: string, storeId: string, role: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id, storeId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // BR-PROD-07: cashier/viewer cannot see deactivated products
    if (!product.isActive && CASHIER_VISIBLE_ROLES.includes(role)) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, dto: UpdateProductDto & { sku?: unknown }, storeId: string): Promise<Product> {
    // BR-PROD-05: SKU is immutable
    if ('sku' in dto && dto.sku !== undefined) {
      throw new BadRequestException('SKU cannot be changed after creation');
    }

    const product = await this.findOneForWrite(id, storeId);

    if (dto.name !== undefined) product.name = dto.name;
    if (dto.priceVnd !== undefined) product.priceVnd = dto.priceVnd;
    if (dto.taxRatePercent !== undefined) product.taxRatePercent = dto.taxRatePercent;

    return this.productsRepository.save(product);
  }

  async deactivate(id: string, storeId: string): Promise<Product> {
    const product = await this.findOneForWrite(id, storeId);
    // BR-PROD idempotent
    product.isActive = false;
    return this.productsRepository.save(product);
  }

  private async findOneForWrite(id: string, storeId: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id, storeId },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }
}
