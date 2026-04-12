import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from './order.entity';

@Entity('order_items')
@Index(['orderId', 'productId'], { unique: true })
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @Column({ name: 'product_id', type: 'uuid', nullable: true })
  productId: string | null;

  // BR-ORDER-01: price/name snapshots at add time
  @Column({ name: 'product_name', type: 'varchar', length: 255 })
  productName: string;

  @Column({ type: 'varchar', length: 100 })
  sku: string;

  @Column({ type: 'integer' })
  quantity: number;

  @Column({ name: 'unit_price_vnd', type: 'integer' })
  unitPriceVnd: number;

  @Column({ name: 'tax_rate_percent', type: 'smallint' })
  taxRatePercent: number;

  @Column({ name: 'line_total_vnd', type: 'integer' })
  lineTotalVnd: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
