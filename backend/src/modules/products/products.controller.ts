import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
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
  ApiQuery,
} from '@nestjs/swagger';
import { ProductsService, ProductQuery } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

@ApiTags('products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles('admin', 'store-manager')
  @ApiOperation({ summary: 'Create a product in caller\'s store' })
  @ApiResponse({ status: 201, type: ProductResponseDto })
  async create(
    @Body() dto: CreateProductDto,
    @CurrentUser() user: AuthUser,
  ): Promise<ProductResponseDto> {
    return this.productsService.create(dto, user.storeId) as unknown as ProductResponseDto;
  }

  @Get()
  @Roles('admin', 'store-manager', 'cashier', 'accountant', 'viewer')
  @ApiOperation({ summary: 'List/search products — cashier sees active only' })
  @ApiQuery({ name: 'q', required: false, description: 'Diacritic-insensitive search' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200 })
  async findAll(
    @CurrentUser() user: AuthUser,
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const query: ProductQuery = {
      q,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    };
    return this.productsService.findAll(user.storeId, user.role, query);
  }

  @Get(':id')
  @Roles('admin', 'store-manager', 'cashier', 'accountant', 'viewer')
  @ApiOperation({ summary: 'Get product by ID — cashier gets 404 for deactivated' })
  @ApiResponse({ status: 200, type: ProductResponseDto })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<ProductResponseDto> {
    return this.productsService.findOne(id, user.storeId, user.role) as unknown as ProductResponseDto;
  }

  @Patch(':id')
  @Roles('admin', 'store-manager')
  @ApiOperation({ summary: 'Update product — SKU immutable' })
  @ApiResponse({ status: 200, type: ProductResponseDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser() user: AuthUser,
  ): Promise<ProductResponseDto> {
    return this.productsService.update(id, dto, user.storeId) as unknown as ProductResponseDto;
  }

  @Patch(':id/deactivate')
  @Roles('admin', 'store-manager')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate product (idempotent)' })
  @ApiResponse({ status: 200, type: ProductResponseDto })
  async deactivate(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<ProductResponseDto> {
    return this.productsService.deactivate(id, user.storeId) as unknown as ProductResponseDto;
  }
}
