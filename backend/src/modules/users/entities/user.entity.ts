import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Store } from '../../stores/entities/store.entity';

export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
}

@Entity('users')
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ type: 'varchar', length: 50, nullable: true, default: '' })
  name: string | null;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.OWNER })
  role: UserRole;

  @Column({ name: 'store_id', type: 'uuid', nullable: true })
  storeId: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'token_version', type: 'integer', default: 0 })
  tokenVersion: number;

  @ManyToOne(() => Store, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'store_id' })
  store: Store;
}
