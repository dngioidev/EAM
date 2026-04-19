import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterOwnerDto {
  @ApiProperty({ example: 'owner@shop.vn' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Pass@1234', minimum: 8 })
  @IsString()
  @MinLength(8)
  password: string;
}
