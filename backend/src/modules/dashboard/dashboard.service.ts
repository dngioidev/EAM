import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';

export interface DashboardItem {
  id: string;
  name: string;
  sku: string | null;
  quantity: number;
  threshold: number;
}

export interface DashboardResult {
  totalProducts: number;
  lowStock: DashboardItem[];
  outOfStock: DashboardItem[];
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async getSummary(storeId: string | null): Promise<DashboardResult> {
    if (!storeId) {
      return { totalProducts: 0, lowStock: [], outOfStock: [] };
    }

    const activeProducts = await this.productsRepository.find({
      where: { storeId, isActive: true },
      select: ['id', 'name', 'sku', 'quantity', 'threshold'],
    });

    const totalProducts = activeProducts.length;

    const outOfStock: DashboardItem[] = activeProducts
      .filter((p) => p.quantity === 0)
      .map(this.toItem);

    const lowStock: DashboardItem[] = activeProducts
      .filter((p) => p.quantity > 0 && p.threshold > 0 && p.quantity <= p.threshold)
      .map(this.toItem);

    return { totalProducts, lowStock, outOfStock };
  }

  private toItem(p: Product): DashboardItem {
    return { id: p.id, name: p.name, sku: p.sku, quantity: p.quantity, threshold: p.threshold };
  }
}
