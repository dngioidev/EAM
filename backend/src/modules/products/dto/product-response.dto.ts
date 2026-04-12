import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() sku: string;
  @ApiProperty() name: string;
  @ApiProperty() priceVnd: number;
  @ApiProperty() taxRatePercent: number;
  @ApiProperty() isActive: boolean;
  @ApiProperty() storeId: string;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}
