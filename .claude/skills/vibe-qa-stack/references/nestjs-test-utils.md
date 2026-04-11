# NestJS Test Utilities

## Testing Module Factory

```typescript
// backend/test/utils/test-module.factory.ts
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

export async function createTestingModule(
  metadata: Parameters<typeof Test.createTestingModule>[0]
): Promise<TestingModule> {
  return Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({ envFilePath: '.env.test' }),
      ...((metadata.imports as []) ?? []),
    ],
    ...metadata,
  }).compile();
}
```

## Integration Test DB Config

```typescript
// backend/test/utils/test-db.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const testDbConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: parseInt(process.env.DATABASE_TEST_PORT ?? '5433'),
  username: process.env.DATABASE_USER ?? 'eam_test',
  password: process.env.DATABASE_TEST_PASSWORD,
  database: process.env.DATABASE_TEST_NAME ?? 'eam_tax_test',
  entities: [__dirname + '/../../src/modules/**/*.entity.{ts,js}'],
  synchronize: true, // test DB only!
  dropSchema: false, // set true in beforeAll if you want clean slate
};
```

## Seed Test Data

```typescript
// backend/test/utils/seed.ts
import { DataSource } from 'typeorm';
import { User } from '../../src/modules/users/entities/user.entity';
import * as bcrypt from 'bcrypt';

export async function seedTestUser(dataSource: DataSource): Promise<User> {
  const userRepo = dataSource.getRepository(User);
  const existing = await userRepo.findOne({ where: { email: 'cashier@test.com' } });
  if (existing) return existing;

  return userRepo.save(userRepo.create({
    email: 'cashier@test.com',
    passwordHash: await bcrypt.hash('testpassword', 10),
    roles: ['cashier'],
    storeId: 'seeded-store-uuid',
  }));
}
```

## NestJS HTTP Test Pattern

```typescript
describe('OrdersController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const module = await createTestingModule({
      imports: [TypeOrmModule.forRoot(testDbConfig), OrdersModule, AuthModule],
    });

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'cashier@test.com', password: 'testpassword' });
    authToken = loginRes.body.data.accessToken;
  });

  afterAll(async () => app.close());

  it('GET /orders returns paginated list', async () => {
    const res = await request(app.getHttpServer())
      .get('/orders?page=1&limit=10')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.meta.total).toBeGreaterThanOrEqual(0);
  });
});
```
