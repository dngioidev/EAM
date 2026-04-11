import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './entities/store.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private readonly storesRepository: Repository<Store>,
  ) {}

  async create(dto: CreateStoreDto): Promise<Store> {
    const existing = await this.storesRepository.findOne({
      where: { taxCode: dto.taxCode },
      withDeleted: true,
    });

    if (existing) {
      throw new ConflictException('A store with this tax code already exists');
    }

    const store = this.storesRepository.create({
      name: dto.name,
      taxCode: dto.taxCode,
      address: dto.address ?? null,
    });

    return this.storesRepository.save(store);
  }

  async findAll(): Promise<Store[]> {
    return this.storesRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findById(id: string): Promise<Store> {
    const store = await this.storesRepository.findOne({ where: { id } });
    if (!store) throw new NotFoundException('Store not found');
    return store;
  }

  async findMyStore(storeId: string): Promise<Store> {
    return this.findById(storeId);
  }

  async update(id: string, dto: UpdateStoreDto & { taxCode?: unknown }): Promise<Store> {
    // taxCode is immutable — reject if caller tries to change it
    if ('taxCode' in dto && dto.taxCode !== undefined) {
      throw new BadRequestException('taxCode cannot be changed after store creation');
    }

    const store = await this.findById(id);
    if (dto.name !== undefined) store.name = dto.name;
    if (dto.address !== undefined) store.address = dto.address ?? null;

    return this.storesRepository.save(store);
  }

  async deactivate(id: string): Promise<Store> {
    const store = await this.findById(id);
    store.isActive = false;
    return this.storesRepository.save(store);
  }

  async softDelete(id: string): Promise<void> {
    await this.findById(id);
    await this.storesRepository.softDelete(id);
  }
}
