import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.user) {
      throw new UnauthorizedException(
        'Authenticated user missing from request',
      );
    }

    return request.user;
  },
);
