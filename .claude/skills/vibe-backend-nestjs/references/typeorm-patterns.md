# TypeORM Patterns

## Repository Injection

```typescript
@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
  ) {}
}
```

---

## FindAndCount (Paginated List)

```typescript
async findAll(page: number, limit: number, filters?: OrderFilters): Promise<[Order[], number]> {
  const query = this.ordersRepository.createQueryBuilder('order')
    .leftJoinAndSelect('order.customer', 'customer')
    .where('order.deletedAt IS NULL')
    .orderBy('order.createdAt', 'DESC')
    .skip((page - 1) * limit)
    .take(limit);

  if (filters?.status) {
    query.andWhere('order.status = :status', { status: filters.status });
  }

  return query.getManyAndCount();
}
```

---

## Soft Delete

```typescript
// Soft delete (sets deletedAt timestamp, does not remove row)
await this.ordersRepository.softDelete(id);

// Verify it's gone in normal queries (TypeORM automatically excludes deleted)
const order = await this.ordersRepository.findOne({ where: { id } });
// → null if deleted

// Admin query including deleted records
const allOrders = await this.ordersRepository.find({ withDeleted: true });
```

---

## Transaction Pattern

```typescript
async createOrderWithItems(dto: CreateOrderDto): Promise<Order> {
  return this.ordersRepository.manager.transaction(async (manager) => {
    const order = manager.create(Order, { ...dto });
    const savedOrder = await manager.save(order);

    for (const item of dto.items) {
      const orderItem = manager.create(OrderItem, {
        ...item,
        orderId: savedOrder.id,
      });
      await manager.save(orderItem);
    }

    return savedOrder;
  });
}
```

---

## QueryBuilder Security

ALWAYS use parameterized queries:

```typescript
// ✅ Safe: parameterized
query.where('order.storeId = :storeId', { storeId: userStoreId });

// ❌ Unsafe: string interpolation (SQL injection risk)
query.where(`order.storeId = '${userStoreId}'`);
```

---

## Select Only Required Columns

For list queries, select only needed columns:

```typescript
const orders = await this.ordersRepository
  .createQueryBuilder('order')
  .select(['order.id', 'order.orderNumber', 'order.status', 'order.totalAmount'])
  .getMany();
```

Avoid `SELECT *` in production — causes overfetching and leaks unexpected fields.
