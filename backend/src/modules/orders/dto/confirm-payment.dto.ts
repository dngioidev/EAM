import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmPaymentDto {
  @ApiProperty({ description: "Payment method — 'cash' or 'card'", enum: ['cash', 'card'] })
  @IsIn(['cash', 'card'], { message: "paymentMethod must be 'cash' or 'card'" })
  paymentMethod: 'cash' | 'card';
}
