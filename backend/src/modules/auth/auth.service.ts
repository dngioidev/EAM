import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as IORedis from 'ioredis';
import { UsersService } from '../users/users.service';
import { User, UserRole } from '../users/entities/user.entity';
import { Store } from '../stores/entities/store.entity';
import { Product } from '../products/entities/product.entity';
import { AuthResponseDto } from './dto/auth-response.dto';

const BCRYPT_COST = 12;

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  storeId: string | null;
  tokenVersion: number;
}

export interface AdminStats {
  total_users: number;
  disabled_users: number;
  total_products: number;
  total_transactions: number;
}

@Injectable()
export class AuthService {
  private readonly redis: IORedis.Redis;
  private readonly refreshTtl: number;

  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(Store)
    private readonly storesRepository: Repository<Store>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.redis = new IORedis.Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD'),
    });
    this.refreshTtl = this.configService.get<number>(
      'REDIS_TTL_REFRESH_TOKEN_SECONDS',
      604800,
    );
  }

  async hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, BCRYPT_COST);
  }

  async login(email: string, password: string): Promise<AuthResponseDto> {
    // BR-AUTH-08: Same error for wrong password AND unknown email (no enumeration)
    const user = await this.usersService.findByEmail(email);

    const isValid =
      user != null && (await bcrypt.compare(password, user.passwordHash));

    if (!isValid || !user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokens(user);
  }

  async refresh(rawRefreshToken: string): Promise<AuthResponseDto> {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(rawRefreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const stored = await this.redis.get(`refresh:${payload.sub}`);
    if (!stored || stored !== rawRefreshToken) {
      throw new UnauthorizedException('Refresh token expired or already used');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User is inactive');
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      throw new UnauthorizedException('Token version mismatch');
    }

    // Mandatory token rotation — delete old key before issuing new
    await this.redis.del(`refresh:${payload.sub}`);

    return this.issueTokens(user);
  }

  async logout(userId: string): Promise<void> {
    await this.redis.del(`refresh:${userId}`);
  }

  /**
   * Public OWNER self-registration. Auto-creates a workspace store so the
   * new user can immediately create and manage products.
   */
  async registerOwner(email: string, password: string): Promise<AuthResponseDto> {
    const exists = await this.usersService.existsByEmail(email);
    if (exists) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await this.hashPassword(password);

    // Auto-create a workspace store so OWNER can access products immediately
    const store = this.storesRepository.create({
      name: `${email.split('@')[0]} Workspace`,
      taxCode: `WS-${Date.now()}`,
      address: null,
      isActive: true,
    });
    const savedStore = await this.storesRepository.save(store);

    const user = await this.usersService.create({
      email,
      passwordHash,
      name: email.split('@')[0],
      role: UserRole.OWNER,
      storeId: savedStore.id,
    });

    return this.issueTokens(user);
  }

  async setUserStatus(userId: string, isActive: boolean): Promise<User> {
    if (!isActive) {
      await this.redis.del(`refresh:${userId}`);
    }
    return this.usersService.setActiveStatus(userId, isActive, !isActive);
  }

  async deactivateUser(userId: string): Promise<User> {
    return this.setUserStatus(userId, false);
  }

  async getAdminStats(): Promise<AdminStats> {
    const [total_users, disabled_users, total_products] = await Promise.all([
      this.usersService.countAll(),
      this.usersService.countDisabled(),
      this.productsRepository.count(),
    ]);

    return {
      total_users,
      disabled_users,
      total_products,
      total_transactions: 0,
    };
  }

  private async issueTokens(user: User): Promise<AuthResponseDto> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      storeId: user.storeId,
      tokenVersion: user.tokenVersion,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    await this.redis.set(`refresh:${user.id}`, refreshToken, 'EX', this.refreshTtl);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}
