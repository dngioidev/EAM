import { Column, Entity, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Store } from '../../stores/entities/store.entity';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';

@Entity('orders')
@Index(['storeId', 'createdAt'])
export class Order extends BaseEntity {
  @Column({ name: 'order_number', type: 'varchar', length: 50 })
  orderNumber: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: OrderStatus;

  @Column({ name: 'total_vnd', type: 'integer', default: 0 })
  totalVnd: number;

  @Column({ name: 'payment_method', type: 'varchar', length: 10, nullable: true })
  paymentMethod: 'cash' | 'card' | null;

  @Column({ name: 'store_id', type: 'uuid' })
  storeId: string;

  @Column({ name: 'cashier_id', type: 'uuid' })
  cashierId: string;

  @ManyToOne(() => Store, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'cashier_id' })
  cashier: User;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true, eager: false })
  items: OrderItem[];
}
