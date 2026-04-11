import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const TAX_CODE_REGEX = /^\d{10}(-\d{3})?$/;

export class CreateStoreDto {
  @ApiProperty({ example: 'Chi nhánh Quận 1' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '0123456789', description: '10 digits or 10-3 digits format' })
  @IsString()
  @Matches(TAX_CODE_REGEX, {
    message: 'taxCode must be 10 digits or format XXXXXXXXXX-XXX',
  })
  taxCode: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  address?: string;
}
