# Service Test Patterns

## Test Setup

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';

describe('OrdersService', () => {
  let service: OrdersService;
  let ordersRepository: jest.Mocked<Repository<Order>>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    softDelete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    ordersRepository = module.get(getRepositoryToken(Order));
  });

  afterEach(() => jest.clearAllMocks());
```

## Happy Path Test

```typescript
  describe('create', () => {
    it('creates and returns order', async () => {
      const dto = { customerId: 'uuid-1', items: [{ productId: 'uuid-2', quantity: 1 }] };
      const savedOrder = { id: 'uuid-order', ...dto, createdAt: new Date() };
      
      mockRepository.create.mockReturnValue(savedOrder);
      mockRepository.save.mockResolvedValue(savedOrder);

      const result = await service.create(dto);
      
      expect(result).toEqual(savedOrder);
      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(mockRepository.save).toHaveBeenCalledWith(savedOrder);
    });
  });
```

## Error Path Test

```typescript
  describe('findOne', () => {
    it('throws NotFoundException when order not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      
      await expect(service.findOne('non-existent-id'))
        .rejects.toThrow(NotFoundException);
    });

    it('returns order when found', async () => {
      const order = { id: 'uuid-1', orderNumber: 'ORD-001' };
      mockRepository.findOne.mockResolvedValue(order);
      
      const result = await service.findOne('uuid-1');
      expect(result).toEqual(order);
    });
  });
```

## Database Error Test

```typescript
  it('propagates database error without swallowing', async () => {
    mockRepository.save.mockRejectedValue(new Error('Connection refused'));
    
    await expect(service.create({ customerId: 'id-1', items: [] }))
      .rejects.toThrow('Connection refused');
  });
```
