# RBAC Implementation

## Roles Enum

```typescript
// src/common/enums/role.enum.ts
export enum Role {
  ADMIN = 'admin',
  STORE_MANAGER = 'store-manager',
  CASHIER = 'cashier',
  ACCOUNTANT = 'accountant',
  VIEWER = 'viewer',
}
```

## Permission Matrix

| Action | Admin | Store Manager | Cashier | Accountant | Viewer |
|---|---|---|---|---|---|
| Create order | ✅ | ✅ | ✅ | ❌ | ❌ |
| Cancel order | ✅ | ✅ | ❌ | ❌ | ❌ |
| View orders | ✅ | ✅ | ✅ | ✅ | ✅ |
| Export reports | ✅ | ✅ | ❌ | ✅ | ❌ |
| Manage users | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage products | ✅ | ✅ | ❌ | ❌ | ❌ |

## Controller Usage

```typescript
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums/role.enum';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  
  @Post()
  @Roles(Role.CASHIER, Role.STORE_MANAGER, Role.ADMIN)
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto, user.storeId);
  }

  @Delete(':id')
  @Roles(Role.STORE_MANAGER, Role.ADMIN)
  cancel(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.cancel(id);
  }
}
```

## Store-Scoped Access Guard

Ensure users can only access their own store's data:

```typescript
@Injectable()
export class StoreGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user, params } = context.switchToHttp().getRequest();
    
    // Admins can access any store
    if (user.roles.includes(Role.ADMIN)) return true;
    
    // If route has storeId param, it must match user's storeId
    if (params.storeId && params.storeId !== user.storeId) {
      return false;
    }
    
    return true;
  }
}
```
