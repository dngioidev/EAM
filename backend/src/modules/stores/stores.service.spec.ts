import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StoresService } from './stores.service';
import { Store } from './entities/store.entity';

const mockStore = (overrides: Partial<Store> = {}): Store => ({
  id: 'store-uuid-1',
  name: 'Test Store',
  taxCode: '0123456789',
  address: '123 Main St',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  ...overrides,
});

const mockRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  softDelete: jest.fn(),
};

describe('StoresService', () => {
  let service: StoresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoresService,
        { provide: getRepositoryToken(Store), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<StoresService>(StoresService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('creates a store when taxCode is unique', async () => {
      const dto = { name: 'Store A', taxCode: '0123456789' };
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue({ ...dto, id: 'uuid-1' });
      mockRepository.save.mockResolvedValue({ ...dto, id: 'uuid-1', isActive: true });

      const result = await service.create(dto);
      expect(result.taxCode).toBe('0123456789');
    });

    it('throws ConflictException when taxCode already exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockStore());

      await expect(service.create({ name: 'Store B', taxCode: '0123456789' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('update', () => {
    it('updates name successfully', async () => {
      const store = mockStore();
      mockRepository.findOne.mockResolvedValue(store);
      mockRepository.save.mockResolvedValue({ ...store, name: 'New Name' });

      const result = await service.update('store-uuid-1', { name: 'New Name' });
      expect(result.name).toBe('New Name');
    });

    it('throws BadRequestException when taxCode is in update body', async () => {
      await expect(
        service.update('store-uuid-1', { taxCode: '9999999999' } as never),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deactivate', () => {
    it('sets isActive to false', async () => {
      const store = mockStore({ isActive: true });
      mockRepository.findOne.mockResolvedValue(store);
      mockRepository.save.mockResolvedValue({ ...store, isActive: false });

      const result = await service.deactivate('store-uuid-1');
      expect(result.isActive).toBe(false);
    });
  });

  describe('findById', () => {
    it('throws NotFoundException when store not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findById('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });
});
