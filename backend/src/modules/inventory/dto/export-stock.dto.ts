import { IsUUID, IsInt, IsOptional, IsString, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExportStockDto {
  @ApiProperty({ description: 'Product ID to export stock from' })
  @IsUUID()
  productId: string;

  @ApiProperty({ description: 'Quantity to export (must be > 0)', minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ description: 'Optional note for this transaction' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
