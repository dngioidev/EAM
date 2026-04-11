# Controller Test Patterns

## Integration Test Setup (Supertest)

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersModule } from './orders.module';
import { AuthModule } from '../auth/auth.module';

describe('OrdersController (integration)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DATABASE_HOST,
          port: parseInt(process.env.DATABASE_TEST_PORT ?? '5433'),
          username: process.env.DATABASE_USER,
          password: process.env.DATABASE_TEST_PASSWORD,
          database: process.env.DATABASE_TEST_NAME,
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          synchronize: true, // test DB only!
        }),
        OrdersModule,
        AuthModule,
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    // Get auth token
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'cashier@test.com', password: 'testpassword' });
    authToken = loginRes.body.data.accessToken;
  });

  afterAll(async () => await app.close());
```

## Endpoint Tests

```typescript
  describe('POST /orders', () => {
    it('creates order with valid data', async () => {
      const dto = {
        customerId: 'seeded-customer-uuid',
        items: [{ productId: 'seeded-product-uuid', quantity: 2 }],
      };
      
      const res = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(dto)
        .expect(201);

      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.status).toBe('pending');
    });

    it('rejects unauthenticated request', async () => {
      await request(app.getHttpServer())
        .post('/orders')
        .send({ customerId: 'x', items: [] })
        .expect(401);
    });

    it('rejects empty items array', async () => {
      const res = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ customerId: 'seeded-customer-uuid', items: [] })
        .expect(400);

      expect(res.body.error.message).toContain('at least one item');
    });
  });
```
