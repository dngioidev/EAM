# Connection Pool Config

## TypeORM DataSource Options

```typescript
// src/database/data-source.ts
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT ?? '5432'),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  
  // Connection pool
  extra: {
    max: 20,         // Max connections in pool
    min: 2,          // Min idle connections
    acquire: 30000,  // Max ms to wait for connection
    idle: 10000,     // Close idle connections after 10s
  },
  
  // Entities and migrations
  entities: ['dist/modules/**/*.entity.js'],
  migrations: ['dist/database/migrations/*.js'],
  
  // Never in production
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});
```

## NestJS Module Setup

```typescript
// Database connection in AppModule
TypeOrmModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    type: 'postgres',
    host: config.get('DATABASE_HOST'),
    port: config.get<number>('DATABASE_PORT'),
    username: config.get('DATABASE_USER'),
    password: config.get('DATABASE_PASSWORD'),
    database: config.get('DATABASE_NAME'),
    autoLoadEntities: true,  // Loads entities registered via forFeature()
    synchronize: false,
    extra: { max: 20, min: 2 },
  }),
}),
```

## Environment Variables Required

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=eam_user
DATABASE_PASSWORD=<vault>
DATABASE_NAME=eam_tax
DATABASE_TEST_PORT=5433
DATABASE_TEST_NAME=eam_tax_test
```
