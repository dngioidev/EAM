import { IsIn, IsInt, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddOrderItemDto {
  @ApiProperty({ description: 'Product UUID to add', format: 'uuid' })
  @IsUUID()
  productId: string;

  @ApiProperty({ description: 'Quantity to set. 0 removes the item.', minimum: 0 })
  @IsInt()
  @Min(0)
  quantity: number;
}
