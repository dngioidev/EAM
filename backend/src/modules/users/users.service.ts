import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

export interface AdminUserView {
  id: string;
  email: string;
  name: string;
  role: User['role'];
  storeId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
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

  async deactivate(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user.isActive) return user; // idempotent
    user.isActive = false;
    return this.usersRepository.save(user);
  }

  async setActiveStatus(id: string, isActive: boolean): Promise<User> {
    const user = await this.findById(id);
    if (user.isActive === isActive) return user;
    user.isActive = isActive;
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
      name: user.name,
      role: user.role,
      storeId: user.storeId,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
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
