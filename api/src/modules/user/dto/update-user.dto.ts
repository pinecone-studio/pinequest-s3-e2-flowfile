import { UserRole } from 'src/shared/types/user.types';

export class UpdateUserDto {
  name?: string;
  email?: string;
  imageUrl?: string | null;
  role?: UserRole;
  isActive?: boolean;
}
