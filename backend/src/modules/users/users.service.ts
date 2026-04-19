import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

export interface AdminUserView {
  id: string;
  email: string;
  role: string;
  status: 'ACTIVE' | 'DISABLED';
  created_at: string;
  product_count: number;
}

export interface PaginatedUsersResult {
  items: AdminUserView[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findAllPaginated(page = 1, limit = 50): Promise<PaginatedUsersResult> {
    const normalizedPage = Number.isFinite(page) ? Math.max(1, page) : 1;
    const normalizedLimit = Number.isFinite(limit) ? Math.min(100, Math.max(1, limit)) : 50;

    const [users, total] = await this.usersRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (normalizedPage - 1) * normalizedLimit,
      take: normalizedLimit,
    });

    const totalPages = Math.max(1, Math.ceil(total / normalizedLimit));

    return {
      items: users.map((user) => this.toAdminUserView(user)),
      page: normalizedPage,
      limit: normalizedLimit,
      total,
      totalPages,
    };
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(data);
    return this.usersRepository.save(user);
  }

  async save(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }

  async setActiveStatus(
    id: string,
    isActive: boolean,
    incrementTokenVersion = false,
  ): Promise<User> {
    const user = await this.findById(id);

    const wasActive = user.isActive;
    let changed = false;

    if (wasActive !== isActive) {
      user.isActive = isActive;
      changed = true;
    }

    // Disabling an active user must invalidate every issued JWT.
    if (incrementTokenVersion && !isActive && wasActive) {
      user.tokenVersion += 1;
      changed = true;
    }

    if (!changed) {
      return user;
    }

    return this.usersRepository.save(user);
  }

  async countAll(): Promise<number> {
    return this.usersRepository.count();
  }

  async countDisabled(): Promise<number> {
    return this.usersRepository.count({ where: { isActive: false } });
  }

  toAdminUserView(user: User): AdminUserView {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.isActive ? 'ACTIVE' : 'DISABLED',
      created_at: user.createdAt?.toISOString() ?? new Date().toISOString(),
      product_count: 0,
    };
  }

  async existsByEmail(email: string): Promise<boolean> {
    return this.usersRepository.existsBy({ email });
  }

  async findActiveByStoreId(storeId: string): Promise<User[]> {
    return this.usersRepository.find({
      where: { storeId, isActive: true },
    });
  }
}
