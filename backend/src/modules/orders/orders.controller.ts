import {
  Controller,
  Get,
  Post,
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
import { OrdersService, OrderQuery } from './orders.service';
import { AddOrderItemDto } from './dto/add-order-item.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ORDER-01: Create empty order
  @Post()
  @Roles('cashier', 'store-manager')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create empty order in caller\'s store' })
  @ApiResponse({ status: 201, description: 'Order created in pending state' })
  async create(@CurrentUser() user: AuthUser) {
    return this.ordersService.create(user.storeId, user.id);
  }

  // ORDER-02: Add item to order
  @Post(':id/items')
  @Roles('cashier', 'store-manager')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add/update product in order cart. quantity=0 removes item.' })
  @ApiResponse({ status: 200, description: 'Order updated' })
  async addItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddOrderItemDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.ordersService.addItem(id, dto, user.storeId, user.id);
  }

  // ORDER-03: Confirm payment
  @Post(':id/confirm-payment')
  @Roles('cashier', 'store-manager')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm payment — advances order to processing, triggers invoice' })
  @ApiResponse({ status: 200, description: 'Order status = processing' })
  async confirmPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ConfirmPaymentDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.ordersService.confirmPayment(id, dto, user.storeId, user.id, user.role);
  }

  // ORDER-04: Cancel order
  @Post(':id/cancel')
  @Roles('cashier', 'store-manager')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a pending order' })
  @ApiResponse({ status: 200, description: 'Order cancelled' })
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.ordersService.cancel(id, user.storeId, user.id, user.role);
  }

  // ORDER-05: List orders
  @Get()
  @Roles('admin', 'store-manager', 'cashier', 'accountant', 'viewer')
  @ApiOperation({ summary: 'List orders. Cashier sees own only.' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'from', required: false, description: 'ISO date' })
  @ApiQuery({ name: 'to', required: false, description: 'ISO date' })
  @ApiQuery({ name: 'cashierId', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @CurrentUser() user: AuthUser,
    @Query('status') status?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('cashierId') cashierId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const query: OrderQuery = {
      status: status as OrderQuery['status'],
      from,
      to,
      cashierId,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    };
    return this.ordersService.findAll(user.storeId, user.id, user.role, query);
  }

  // ORDER-06: Get single order
  @Get(':id')
  @Roles('admin', 'store-manager', 'cashier', 'accountant', 'viewer')
  @ApiOperation({ summary: 'Get order by ID with all items' })
  @ApiResponse({ status: 200 })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.ordersService.findOne(id, user.storeId, user.id, user.role);
  }

  // ORDER-07: Get invoice for order (delegated to InvoicesService via InvoicesController at orders/:id/invoice)
  // Implemented in invoices.controller.ts as @Get('/orders/:orderId/invoice') + separate InvoicesController
  // mounted at 'orders' path — see InvoicesController nested route
}
