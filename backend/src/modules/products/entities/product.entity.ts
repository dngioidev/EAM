import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Store } from '../../stores/entities/store.entity';

@Entity('products')
export class Product extends BaseEntity {
  @Column({ type: 'varchar', length: 100, nullable: true })
  sku: string | null;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'price_vnd', type: 'integer', nullable: true, default: 0 })
  priceVnd: number | null;

  @Column({ name: 'tax_rate_percent', type: 'smallint', nullable: true, default: 0 })
  taxRatePercent: number | null;

  @Column({ type: 'integer', default: 0 })
  quantity: number;

  @Column({ type: 'integer', default: 0 })
  threshold: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'store_id', type: 'uuid', nullable: true })
  storeId: string | null;

  @ManyToOne(() => Store, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: Store;
}
