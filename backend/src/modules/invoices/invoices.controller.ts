import {
  Controller,
  Get,
  Patch,
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
import { InvoicesService, ListInvoicesQuery } from './invoices.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

@ApiTags('invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  // INV-01: List invoices
  @Get()
  @Roles('admin', 'store-manager', 'accountant')
  @ApiOperation({ summary: 'List invoices for the store, filterable by date and status' })
  @ApiQuery({ name: 'from', required: false, description: 'ISO date' })
  @ApiQuery({ name: 'to', required: false, description: 'ISO date' })
  @ApiQuery({ name: 'status', required: false, enum: ['issued', 'cancelled'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @CurrentUser() user: AuthUser,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const query: ListInvoicesQuery = {
      from,
      to,
      status: status as ListInvoicesQuery['status'],
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    };
    return this.invoicesService.findAll(user.storeId, query);
  }

  // INV-02: Get single invoice
  @Get(':id')
  @Roles('admin', 'store-manager', 'accountant')
  @ApiOperation({ summary: 'Get invoice by ID with full lines' })
  @ApiResponse({ status: 200 })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.invoicesService.findOne(id, user.storeId);
  }

  // INV-03: Cancel invoice
  @Patch(':id/cancel')
  @Roles('admin', 'accountant')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel an issued invoice (order must be refunded). Idempotent.' })
  @ApiResponse({ status: 200 })
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.invoicesService.cancel(id, user.storeId);
  }
}
