import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseUUIDPipe,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { ImportStockDto } from './dto/import-stock.dto';
import { ExportStockDto } from './dto/export-stock.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

@ApiTags('inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('import')
  @Roles('admin', 'store-manager')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record stock coming in (IMPORT transaction)' })
  @ApiResponse({ status: 201, description: 'Transaction created and product quantity updated' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async import(
    @Body() dto: ImportStockDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.inventoryService.import(dto, user.storeId);
  }

  @Post('export')
  @Roles('admin', 'store-manager')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record stock going out (EXPORT transaction)' })
  @ApiResponse({ status: 201, description: 'Transaction created and product quantity updated' })
  @ApiResponse({ status: 400, description: 'Not enough stock. Current: {quantity}.' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async export(
    @Body() dto: ExportStockDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.inventoryService.export(dto, user.storeId);
  }

  @Get('transactions')
  @Roles('admin', 'store-manager', 'cashier', 'accountant', 'viewer')
  @ApiOperation({ summary: 'List transactions for a product (ordered by created_at DESC)' })
  @ApiQuery({ name: 'product_id', required: true, description: 'Product UUID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated transaction list' })
  async listTransactions(
    @Query('product_id', ParseUUIDPipe) productId: string,
    @CurrentUser() user: AuthUser,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.inventoryService.listTransactions(productId, user.storeId, page, limit);
  }
}
