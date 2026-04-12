import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './entities/invoice.entity';
import { InvoiceSequence } from './entities/invoice-sequence.entity';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { OrderInvoiceController } from './order-invoice.controller';
import { OrdersModule } from '../orders/orders.module';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, InvoiceSequence, Order, OrderItem]),
    OrdersModule,
  ],
  providers: [InvoicesService],
  controllers: [InvoicesController, OrderInvoiceController],
  exports: [InvoicesService],
})
export class InvoicesModule {}
