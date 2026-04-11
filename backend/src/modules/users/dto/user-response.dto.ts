import { Exclude, Expose } from 'class-transformer';
import { UserRole } from '../entities/user.entity';

@Exclude()
export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  name: string;

  @Expose()
  role: UserRole;

  @Expose()
  storeId: string | null;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: Date;
}
