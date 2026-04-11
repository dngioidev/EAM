import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { StoresService } from './stores.service';
import { AuthService } from '../auth/auth.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { StoreResponseDto } from './dto/store-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

@ApiTags('stores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('stores')
export class StoresController {
  constructor(
    private readonly storesService: StoresService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new store (admin only)' })
  @ApiResponse({ status: 201, type: StoreResponseDto })
  async create(@Body() dto: CreateStoreDto): Promise<StoreResponseDto> {
    return this.storesService.create(dto) as unknown as StoreResponseDto;
  }

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'List all stores (admin only)' })
  @ApiResponse({ status: 200, type: [StoreResponseDto] })
  async findAll(): Promise<StoreResponseDto[]> {
    return this.storesService.findAll() as unknown as StoreResponseDto[];
  }

  @Get('me')
  @Roles('admin', 'store-manager', 'cashier', 'accountant', 'viewer')
  @ApiOperation({ summary: "Get current user's store" })
  @ApiResponse({ status: 200, type: StoreResponseDto })
  async getMyStore(@CurrentUser() user: AuthUser): Promise<StoreResponseDto> {
    return this.storesService.findMyStore(user.storeId) as unknown as StoreResponseDto;
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update store name/address (taxCode immutable)' })
  @ApiResponse({ status: 200, type: StoreResponseDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStoreDto,
  ): Promise<StoreResponseDto> {
    return this.storesService.update(id, dto) as unknown as StoreResponseDto;
  }

  @Patch(':id/deactivate')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate a store — revokes all user sessions' })
  @ApiResponse({ status: 200, type: StoreResponseDto })
  async deactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StoreResponseDto> {
    // Revoke all active sessions for users of this store (flush Redis keys)
    await this.authService.revokeAllForStore(id);

    return this.storesService.deactivate(id) as unknown as StoreResponseDto;
  }
}
