---
name: vibe-backend-nestjs
description: |
  Layer 2 NestJS Backend Implementation for EAM. Tech-specific implementation patterns for NestJS 10.x + TypeORM 0.3.x + class-validator + Passport/JWT. Activates alongside vibe-backend-general when writing actual backend code. Enforces Stack Validation Guard and Layer 1 Bypass Guard.
  
  LAYER 2 — Technology-Specific. Requires Layer 1 (vibe-backend-general) approval to activate.
  STACK VALIDATION GUARD: Only activates if backend stack is NestJS 10.x + TypeORM 0.3.x.
  LAYER 1 BYPASS GUARD: Never bypass vibe-backend-general's architecture decisions.
applyTo: "**"
---

# vibe-backend-nestjs

## STACK VALIDATION GUARD

Before applying any pattern in this skill, verify:
- `wiki/techstack/backend.json → framework` = "NestJS 10.x"
- `wiki/techstack/backend.json → orm` = "TypeORM 0.3.x"

If stack has changed: re-read `wiki/techstack/backend.json` and adapt patterns. Do NOT blindly apply this skill to a different stack.

## LAYER 1 BYPASS GUARD

This skill does NOT override:
- Architecture decisions made by `vibe-backend-general`
- API contract shapes defined by `vibe-api-contractor`
- Security requirements from `vibe-security-general`

This skill ONLY provides the NestJS/TypeORM implementation of those decisions.

## Module Template

```
src/modules/{name}/
  {name}.module.ts
  {name}.controller.ts
  {name}.service.ts
  dto/
    create-{name}.dto.ts
    update-{name}.dto.ts
    {name}-response.dto.ts
  entities/
    {name}.entity.ts
  interfaces/
    {name}.interface.ts    (optional if complex types needed)
  {name}.service.spec.ts
  {name}.controller.spec.ts
```

## Module File Templates

### `{name}.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order])],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
```

### `{name}.service.ts` — CRUD Pattern
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
  ) {}

  async create(dto: CreateOrderDto): Promise<Order> {
    const order = this.ordersRepository.create(dto);
    return this.ordersRepository.save(order);
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return order;
  }

  async findAll(page = 1, limit = 20): Promise<[Order[], number]> {
    return this.ordersRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }
}
```

### `{name}.controller.ts` — REST Pattern
```typescript
import { Controller, Get, Post, Body, Param, ParseUUIDPipe, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  async create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOne(id);
  }
}
```

## Entity Template

```typescript
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('orders')
export class Order extends BaseEntity {
  @Column({ name: 'order_number', unique: true })
  orderNumber: string;

  @Column({ type: 'decimal', precision: 15, scale: 0, name: 'total_amount' })
  totalAmount: number;

  @Column({ name: 'customer_id' })
  @Index('idx_order_customer_id')
  customerId: string;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;
}
```

## References

- [NestJS Module Patterns](references/module-patterns.md)
- [TypeORM Patterns](references/typeorm-patterns.md)
- [DTO Validation Patterns](references/dto-validation-patterns.md)
- [Exception Handling](references/exception-handling.md)
- [Auth Guard Patterns](references/auth-guard-patterns.md)
- [Service Test Patterns](references/service-test-patterns.md)
- [Controller Test Patterns](references/controller-test-patterns.md)
- [Migration Patterns](references/migration-patterns.md)
- [Logger Patterns](references/logger-patterns.md)
- [Redis Cache Patterns](references/redis-cache-patterns.md)
- [Event Emitter Patterns](references/event-emitter-patterns.md)
