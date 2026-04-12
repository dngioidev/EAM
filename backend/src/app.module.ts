import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import * as Joi from 'joi';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { StoresModule } from './modules/stores/stores.module';
import { ProductsModule } from './modules/products/products.module';
import { User } from './modules/users/entities/user.entity';
import { Store } from './modules/stores/entities/store.entity';
import { Product } from './modules/products/entities/product.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
        PORT: Joi.number().default(3000),
        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.number().default(5432),
        DATABASE_USER: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().required(),
        DATABASE_NAME: Joi.string().required(),
        DATABASE_SYNCHRONIZE: Joi.boolean().default(false),
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().default(6379),
        REDIS_PASSWORD: Joi.string().required(),
        JWT_SECRET: Joi.string().min(32).required(),
        JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
        JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
      }),
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DATABASE_HOST'),
        port: config.get<number>('DATABASE_PORT'),
        username: config.get<string>('DATABASE_USER'),
        password: config.get<string>('DATABASE_PASSWORD'),
        database: config.get<string>('DATABASE_NAME'),
        entities: [User, Store, Product],
        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
        synchronize: config.get<boolean>('DATABASE_SYNCHRONIZE', false),
        logging: config.get<string>('NODE_ENV') !== 'production',
      }),
    }),

    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 30,
      },
    ]),

    AuthModule,
    UsersModule,
    StoresModule,
    ProductsModule,
  ],
})
export class AppModule {}
