import { UserRole } from 'src/shared/types/user.types';

export interface AuthenticatedUser {
  id: string;
  clerkUserId: string;
  email: string;
  role: UserRole;
  name?: string;
  imageUrl?: string | null;
  isActive?: boolean;
}
