/**
 * QA-T005: Backend integration test setup
 *
 * Usage: imported by all .e2e-spec.ts files.
 * Requires: TEST_DB_PORT=5433 pointing to a clean Postgres instance.
 * Run: cd backend && npm run test:e2e
 */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from '../src/modules/auth/auth.module';
import { UsersModule } from '../src/modules/users/users.module';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { Reflector } from '@nestjs/core';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { User } from '../src/modules/users/entities/user.entity';
import { Store } from '../src/modules/stores/entities/store.entity';
import { Product } from '../src/modules/products/entities/product.entity';
import { Order } from '../src/modules/orders/entities/order.entity';
import { OrderItem } from '../src/modules/orders/entities/order-item.entity';
import { Invoice } from '../src/modules/invoices/entities/invoice.entity';
import { InvoiceSequence } from '../src/modules/invoices/entities/invoice-sequence.entity';

const TEST_DB = {
  host: process.env['TEST_DB_HOST'] ?? 'localhost',
  port: Number(process.env['TEST_DB_PORT'] ?? 5433),
  username: process.env['TEST_DB_USER'] ?? 'eam',
  password: process.env['TEST_DB_PASSWORD'] ?? 'eam_password',
  database: process.env['TEST_DB_NAME'] ?? 'eam_test',
};

export async function createTestApp(): Promise<{ app: INestApplication; module: TestingModule }> {
  const module = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env.test' }),
      TypeOrmModule.forRoot({
        type: 'postgres',
        ...TEST_DB,
        entities: [User, Store, Product, Order, OrderItem, Invoice, InvoiceSequence],
        synchronize: true, // test DB only — drops + recreates schema on each run
        dropSchema: false,
        logging: false,
      }),
      AuthModule,
      UsersModule,
    ],
  }).compile();

  const app = module.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.useGlobalInterceptors(new TransformInterceptor(new Reflector()));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.setGlobalPrefix('api/v1');
  await app.init();

  return { app, module };
}
