import { IsInt, IsIn, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const VALID_TAX_RATES = [0, 5, 8, 10] as const;

export class CreateProductDto {
  @ApiProperty({ example: 'SKU-001', description: 'Unique within caller\'s store' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  sku: string;

  @ApiProperty({ example: 'Bánh mì thịt', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 25000, description: 'Integer đồng — no decimals (BR-PROD-01)' })
  @IsInt()
  @Min(0)
  priceVnd: number;

  @ApiProperty({ example: 10, enum: VALID_TAX_RATES, description: 'Vietnamese VAT tier (BR-PROD-02)' })
  @IsInt()
  @IsIn(VALID_TAX_RATES as unknown as number[], {
    message: 'taxRatePercent must be one of 0, 5, 8, 10',
  })
  taxRatePercent: number;
}
