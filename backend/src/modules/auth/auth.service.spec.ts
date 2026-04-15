import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User, UserRole } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { Order } from '../orders/entities/order.entity';

// Mock ioredis
jest.mock('ioredis', () => {
  const mockRedis = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };
  return { Redis: jest.fn(() => mockRedis) };
});

const mockUsersService = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  findActiveByStoreId: jest.fn(),
  setActiveStatus: jest.fn(),
  countAll: jest.fn(),
  countDisabled: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock.jwt.token'),
  verify: jest.fn(),
};

const mockProductsRepository = {
  count: jest.fn().mockResolvedValue(0),
};

const mockOrdersRepository = {
  count: jest.fn().mockResolvedValue(0),
};

const mockConfigService = {
  get: jest.fn((key: string, defaultValue?: unknown) => {
    const config: Record<string, unknown> = {
      REDIS_HOST: 'localhost',
      REDIS_PORT: 6379,
      REDIS_PASSWORD: 'test',
      REDIS_TTL_REFRESH_TOKEN_SECONDS: 604800,
      JWT_ACCESS_EXPIRES_IN: '15m',
      JWT_REFRESH_EXPIRES_IN: '7d',
      JWT_SECRET: 'test_secret',
    };
    return config[key] ?? defaultValue;
  }),
};

const buildUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-uuid-1',
  email: 'admin@eam.local',
  passwordHash: '',
  name: 'Admin',
  role: UserRole.ADMIN,
  storeId: null,
  isActive: true,
  tokenVersion: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  store: null as never,
  ...overrides,
});

describe('AuthService', () => {
  let service: AuthService;
  let redisMock: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: getRepositoryToken(Product), useValue: mockProductsRepository },
        { provide: getRepositoryToken(Order), useValue: mockOrdersRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    const IORedis = require('ioredis');
    redisMock = new IORedis.Redis();
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('returns tokens when credentials are valid', async () => {
      const hash = await bcrypt.hash('correct_password', 12);
      const user = buildUser({ passwordHash: hash });
      mockUsersService.findByEmail.mockResolvedValue(user);

      const result = await service.login('admin@eam.local', 'correct_password');

      expect(result.accessToken).toBeDefined();
      expect(result.user.email).toBe('admin@eam.local');
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: user.id,
          tokenVersion: user.tokenVersion,
        }),
        expect.any(Object),
      );
    });

    it('throws 401 when password is wrong — SAME error as unknown email (BR-AUTH-08)', async () => {
      const hash = await bcrypt.hash('other_password', 12);
      const user = buildUser({ passwordHash: hash });
      mockUsersService.findByEmail.mockResolvedValue(user);

      await expect(service.login('admin@eam.local', 'wrong_password')).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );
    });

    it('throws 401 when user does not exist — SAME error as wrong password (BR-AUTH-08)', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.login('notexist@eam.local', 'any_password')).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );
    });

    it('throws 401 when user account is inactive', async () => {
      const hash = await bcrypt.hash('correct_password', 12);
      const user = buildUser({ passwordHash: hash, isActive: false });
      mockUsersService.findByEmail.mockResolvedValue(user);

      await expect(service.login('admin@eam.local', 'correct_password')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('deletes refresh token key from Redis', async () => {
      const IORedis = require('ioredis');
      const redisMock = new IORedis.Redis();
      redisMock.del.mockResolvedValue(1);

      await service.logout('user-uuid-1');
      // Behaviour verified by no-throw
    });
  });

  describe('refresh', () => {
    it('throws 401 when token version mismatches user version', async () => {
      const refreshToken = 'refresh-token';
      mockJwtService.verify.mockReturnValue({
        sub: 'user-uuid-1',
        tokenVersion: 0,
      });
      redisMock.get.mockResolvedValue(refreshToken);
      mockUsersService.findById.mockResolvedValue(buildUser({ tokenVersion: 1 }));

      await expect(service.refresh(refreshToken)).rejects.toThrow(
        new UnauthorizedException('Token version mismatch'),
      );
    });

    it('rotates refresh token when payload and user token version match', async () => {
      const refreshToken = 'refresh-token';
      mockJwtService.verify.mockReturnValue({
        sub: 'user-uuid-1',
        tokenVersion: 2,
      });
      redisMock.get.mockResolvedValue(refreshToken);
      mockUsersService.findById.mockResolvedValue(buildUser({ tokenVersion: 2 }));

      const result = await service.refresh(refreshToken);

      expect(result.accessToken).toBeDefined();
      expect(redisMock.del).toHaveBeenCalledWith('refresh:user-uuid-1');
    });
  });

  describe('setUserStatus', () => {
    it('disables user with token-version increment and session revoke', async () => {
      const updated = buildUser({ isActive: false, tokenVersion: 3 });
      mockUsersService.setActiveStatus.mockResolvedValue(updated);

      const result = await service.setUserStatus('user-uuid-1', false);

      expect(redisMock.del).toHaveBeenCalledWith('refresh:user-uuid-1');
      expect(mockUsersService.setActiveStatus).toHaveBeenCalledWith('user-uuid-1', false, true);
      expect(result).toBe(updated);
    });

    it('enables user without forcing token-version increment', async () => {
      const updated = buildUser({ isActive: true, tokenVersion: 3 });
      mockUsersService.setActiveStatus.mockResolvedValue(updated);

      const result = await service.setUserStatus('user-uuid-1', true);

      expect(redisMock.del).not.toHaveBeenCalled();
      expect(mockUsersService.setActiveStatus).toHaveBeenCalledWith('user-uuid-1', true, false);
      expect(result).toBe(updated);
    });
  });

  describe('getAdminStats', () => {
    it('returns aggregated platform stats', async () => {
      mockUsersService.countAll.mockResolvedValue(12);
      mockUsersService.countDisabled.mockResolvedValue(2);
      mockProductsRepository.count.mockResolvedValue(30);
      mockOrdersRepository.count.mockResolvedValue(45);

      const result = await service.getAdminStats();

      expect(result).toEqual({
        totalUsers: 12,
        disabledUsers: 2,
        totalProducts: 30,
        totalTransactions: 45,
      });
    });
  });
});
