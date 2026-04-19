import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty() id: string;
  @ApiPropertyOptional() sku: string | null;
  @ApiProperty() name: string;
  @ApiProperty() quantity: number;
  @ApiProperty() threshold: number;
  @ApiProperty({ enum: ['OUT_OF_STOCK', 'LOW_STOCK', 'IN_STOCK'] }) status: string;
  @ApiProperty() updated_at: string;
}
