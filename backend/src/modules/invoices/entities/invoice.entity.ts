import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Store } from '../../stores/entities/store.entity';

export type InvoiceStatus = 'draft' | 'issued' | 'cancelled';

export interface InvoiceLine {
  productName: string;
  sku: string;
  quantity: number;
  unitPriceVnd: number;
  taxRatePercent: number;
  lineTotalVnd: number;
}

export interface VatSubtotal {
  rate: number;
  taxableVnd: number;
  vatVnd: number;
}

@Entity('invoices')
@Index(['storeId', 'issuedAt'])
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // LEGAL-01: immutable after creation
  @Column({ name: 'invoice_number', type: 'varchar', length: 20 })
  invoiceNumber: string;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @Column({ name: 'store_id', type: 'uuid' })
  storeId: string;

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status: InvoiceStatus;

  // BR-INV-03: JSONB snapshot of order items
  @Column({ type: 'jsonb', default: [] })
  lines: InvoiceLine[];

  // BR-INV-04: VAT subtotals grouped by rate
  @Column({ name: 'vat_subtotals', type: 'jsonb', default: [] })
  vatSubtotals: VatSubtotal[];

  @Column({ name: 'total_vnd', type: 'integer', default: 0 })
  totalVnd: number;

  @Column({ name: 'issued_at', type: 'timestamptz', nullable: true })
  issuedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => Store, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: Store;
}
