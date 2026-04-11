# DTO Validation Patterns

## class-validator Setup

All DTOs use `class-validator` + `class-transformer`:

```typescript
import {
  IsString, IsUUID, IsNumber, IsArray, IsOptional,
  IsISO8601, IsEnum, Min, Max, ArrayMinSize,
  ValidateNested, IsNotEmpty
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
```

---

## Common DTO Patterns

### Create DTO
```typescript
export class CreateOrderDto {
  @ApiProperty({ description: 'Customer UUID', format: 'uuid' })
  @IsUUID()
  customerId: string;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ArrayMinSize(1, { message: 'Order must have at least one item' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @ApiPropertyOptional({ description: 'Promotion code to apply' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  promoCode?: string;
}
```

### Update DTO (Partial)
```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateOrderDto } from './create-order.dto';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {}
```

### Response DTO (Excludes sensitive fields)
```typescript
import { Exclude, Expose } from 'class-transformer';

export class OrderResponseDto {
  @Expose()
  id: string;

  @Expose()
  orderNumber: string;

  @Expose()
  totalAmount: number;

  @Expose()
  status: string;

  @Expose()
  createdAt: Date;

  @Exclude()
  internalNotes: string; // Never exposed
}
```

---

## Custom Validators

For business-rule validation:

```typescript
import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsVndAmount(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isVndAmount',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return typeof value === 'number' && Number.isInteger(value) && value >= 0;
        },
        defaultMessage() {
          return 'Amount must be a non-negative integer (VND has no decimals)';
        },
      },
    });
  };
}
```

---

## Pagination Query DTO

```typescript
export class PaginationQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
```
