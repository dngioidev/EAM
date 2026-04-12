import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

// Control table for gap-free per-store per-year invoice number sequence
// SELECT ... FOR UPDATE to avoid concurrent sequence collisions (BR-INV-02)
@Entity('invoice_sequences')
@Index(['storeId', 'year'], { unique: true })
export class InvoiceSequence {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Column({ name: 'store_id', type: 'uuid' })
  storeId: string;

  @Column({ type: 'smallint' })
  year: number;

  @Column({ name: 'last_sequence', type: 'integer', default: 0 })
  lastSequence: number;
}
