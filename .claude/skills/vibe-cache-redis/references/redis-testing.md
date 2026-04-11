# Redis Testing

## Unit Tests (Mock Redis)

```typescript
// Mock the Redis client for unit tests — never use real Redis in unit tests
const mockRedis = {
  get: jest.fn(),
  setex: jest.fn(),
  del: jest.fn(),
  scan: jest.fn().mockResolvedValue(['0', []]),
  ping: jest.fn().mockResolvedValue('PONG'),
};

describe('CacheService', () => {
  let cacheService: CacheService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CacheService,
        { provide: 'REDIS_CLIENT', useValue: mockRedis },
      ],
    }).compile();

    cacheService = module.get<CacheService>(CacheService);
  });

  afterEach(() => jest.clearAllMocks());

  it('returns null on cache miss', async () => {
    mockRedis.get.mockResolvedValue(null);
    const result = await cacheService.get('orders:detail:123');
    expect(result).toBeNull();
  });

  it('returns parsed value on cache hit', async () => {
    const order = { id: '123', status: 'pending' };
    mockRedis.get.mockResolvedValue(JSON.stringify(order));
    
    const result = await cacheService.get('orders:detail:123');
    expect(result).toEqual(order);
  });

  it('degrades gracefully when Redis throws', async () => {
    mockRedis.get.mockRejectedValue(new Error('Connection refused'));
    
    // Should not throw — returns null
    const result = await cacheService.get('orders:detail:123');
    expect(result).toBeNull();
  });
});
```

## Integration Tests (Real Redis)

```typescript
// Use test Redis on different port if available
// .env.test:
//   REDIS_PORT=6380  (separate test instance)
//   REDIS_HOST=localhost

describe('CacheService (integration)', () => {
  let cacheService: CacheService;

  // Uses real Redis — flush test keys after each test
  afterEach(async () => {
    const redis = cacheService['redis'];
    const keys = await redis.keys('test:*');
    if (keys.length) await redis.del(...keys);
  });

  it('persists and retrieves value', async () => {
    await cacheService.set('test:key:1', { foo: 'bar' }, 60);
    const result = await cacheService.get<{ foo: string }>('test:key:1');
    expect(result?.foo).toBe('bar');
  });
});
```

## Avoiding Real Redis in Tests

If a service uses `CacheService`, mock it:

```typescript
const mockCacheService = {
  get: jest.fn().mockResolvedValue(null), // Always miss
  set: jest.fn().mockResolvedValue(undefined),
  del: jest.fn().mockResolvedValue(undefined),
  delByPattern: jest.fn().mockResolvedValue(undefined),
};
// Provide in TestingModule
{ provide: CacheService, useValue: mockCacheService }
```
