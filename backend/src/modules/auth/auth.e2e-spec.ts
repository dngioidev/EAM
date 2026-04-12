/**
 * QA-T006: Auth integration tests
 * TC-AUTH-I01: Login happy path
 * TC-AUTH-I02: Login wrong password → 401 no enumeration
 * TC-AUTH-I03: Refresh token → new pair issued, old token revoked
 * TC-AUTH-I04: GET /me → returns current user profile
 * TC-AUTH-I05: Logout → refresh token deleted, subsequent refresh → 401
 *
 * Run: cd backend && npm run test:e2e
 */
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from '../../test/app.e2e-setup';
import { DataSource } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import * as bcrypt from 'bcryptjs';

describe('Auth — Integration Tests', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  const testUser = {
    email: 'test.auth@eam.local',
    password: 'TestPass@123',
    name: 'Test User',
    role: UserRole.CASHIER,
    storeId: null,
  };

  beforeAll(async () => {
    const setup = await createTestApp();
    app = setup.app;
    dataSource = setup.module.get(DataSource);

    // Seed test user
    const usersRepo = dataSource.getRepository(User);
    await usersRepo.delete({ email: testUser.email });
    const passwordHash = await bcrypt.hash(testUser.password, 12);
    await usersRepo.save(
      usersRepo.create({ ...testUser, passwordHash, isActive: true }),
    );
  });

  afterAll(async () => {
    await dataSource.getRepository(User).delete({ email: testUser.email });
    await app.close();
  });

  // ── TC-AUTH-I01 ───────────────────────────────────────────────────────────
  describe('TC-AUTH-I01: Login happy path', () => {
    it('returns 200 with accessToken, refreshToken, and user object', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(200);

      expect(res.body.data.accessToken).toBeTruthy();
      expect(res.body.data.refreshToken).toBeTruthy();
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.user.role).toBe(testUser.role);
    });
  });

  // ── TC-AUTH-I02 ───────────────────────────────────────────────────────────
  describe('TC-AUTH-I02: Invalid credentials → same 401 (no enumeration)', () => {
    it('wrong password returns 401 with generic message', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: 'wrongpassword' })
        .expect(401);

      expect(res.body.message).toBe('Invalid credentials');
    });

    it('unknown email returns same 401', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'nobody@eam.local', password: 'anypassword' })
        .expect(401);

      expect(res.body.message).toBe('Invalid credentials');
    });
  });

  // ── TC-AUTH-I03 ───────────────────────────────────────────────────────────
  describe('TC-AUTH-I03: Refresh token rotation', () => {
    it('returns new token pair; old refresh token is invalidated', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(200);

      const { refreshToken: oldToken } = loginRes.body.data;

      const refreshRes = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: oldToken })
        .expect(200);

      const newToken = refreshRes.body.data.refreshToken;
      expect(newToken).not.toBe(oldToken);

      // Old token must be rejected
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: oldToken })
        .expect(401);
    });
  });

  // ── TC-AUTH-I04 ───────────────────────────────────────────────────────────
  describe('TC-AUTH-I04: GET /me returns profile', () => {
    it('returns current user with live DB lookup', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(200);

      const token = loginRes.body.data.accessToken;

      const meRes = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(meRes.body.data.email).toBe(testUser.email);
      expect(meRes.body.data.isActive).toBe(true);
    });
  });

  // ── TC-AUTH-I05 ───────────────────────────────────────────────────────────
  describe('TC-AUTH-I05: Logout invalidates refresh token', () => {
    it('logout deletes token; subsequent refresh returns 401', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(200);

      const { accessToken, refreshToken } = loginRes.body.data;

      await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);

      // Refresh must be rejected
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(401);
    });
  });
});
