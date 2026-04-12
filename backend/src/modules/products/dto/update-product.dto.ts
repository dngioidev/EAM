import { IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const VALID_TAX_RATES = [0, 5, 8, 10] as const;

export class UpdateProductDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @ApiProperty({ required: false, description: 'Integer đồng' })
  @IsInt()
  @Min(0)
  @IsOptional()
  priceVnd?: number;

  @ApiProperty({ required: false, enum: VALID_TAX_RATES })
  @IsInt()
  @IsIn(VALID_TAX_RATES as unknown as number[], {
    message: 'taxRatePercent must be one of 0, 5, 8, 10',
  })
  @IsOptional()
  taxRatePercent?: number;
}
