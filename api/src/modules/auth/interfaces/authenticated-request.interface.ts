import type { Request } from 'express';
import type { AuthenticatedUser } from './authenticated-user.interface';

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}
