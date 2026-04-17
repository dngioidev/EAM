import { IsUUID, IsInt, IsOptional, IsString, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ImportStockDto {
  @ApiProperty({ description: 'Product ID to import stock into' })
  @IsUUID()
  productId: string;

  @ApiProperty({ description: 'Quantity to import (must be > 0)', minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ description: 'Optional note for this transaction' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
