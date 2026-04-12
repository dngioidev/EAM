import { Controller, Get, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

// ORDER-07: GET /api/v1/orders/:orderId/invoice
// Mounted via InvoicesModule at path 'orders' so the route is /orders/:orderId/invoice
@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrderInvoiceController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get(':orderId/invoice')
  @Roles('admin', 'store-manager', 'cashier', 'accountant', 'viewer')
  @ApiOperation({ summary: 'Get invoice for a completed order (ORDER-07)' })
  @ApiResponse({ status: 200, description: 'Invoice for the order' })
  @ApiResponse({ status: 404, description: 'Invoice not yet issued or order not found' })
  async getOrderInvoice(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.invoicesService.findByOrder(orderId, user.storeId);
  }
}
