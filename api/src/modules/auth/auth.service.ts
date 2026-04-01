import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/modules/user/user.service';
import type { UserRole } from 'src/shared/types/user.types';

interface ClerkTokenPayload {
  sub: string;
  email: string;
  name?: string;
  imageUrl?: string | null;
}

interface DevTokenPayload {
  userId: string;
  email: string;
  role?: UserRole;
  name?: string;
  imageUrl?: string | null;
  sub?: string;
}

function isClerkTokenPayload(value: unknown): value is ClerkTokenPayload {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const payload = value as Record<string, unknown>;

  return (
    typeof payload.sub === 'string' &&
    typeof payload.email === 'string' &&
    (payload.name === undefined || typeof payload.name === 'string') &&
    (payload.imageUrl === undefined ||
      payload.imageUrl === null ||
      typeof payload.imageUrl === 'string')
  );
}

function isDevTokenPayload(value: unknown): value is DevTokenPayload {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const payload = value as Record<string, unknown>;

  return (
    typeof payload.userId === 'string' &&
    typeof payload.email === 'string' &&
    (payload.role === undefined ||
      payload.role === 'teacher' ||
      payload.role === 'student') &&
    (payload.name === undefined || typeof payload.name === 'string') &&
    (payload.imageUrl === undefined ||
      payload.imageUrl === null ||
      typeof payload.imageUrl === 'string') &&
    (payload.sub === undefined || typeof payload.sub === 'string')
  );
}

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async validateRequest(authHeader?: string) {
    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const token = authHeader.replace('Bearer ', '');

    let payload: unknown;

    try {
      payload = JSON.parse(Buffer.from(token, 'base64').toString());
    } catch {
      throw new UnauthorizedException('Invalid token format');
    }

    if (isDevTokenPayload(payload)) {
      if (process.env.NODE_ENV === 'production') {
        throw new UnauthorizedException('Dev token payload is not allowed');
      }

      return this.userService.findOrCreateDevUser({
        id: payload.userId,
        clerkUserId: payload.sub ?? `dev-${payload.userId}`,
        email: payload.email,
        name: payload.name ?? payload.email,
        imageUrl: payload.imageUrl ?? null,
        role: payload.role ?? 'student',
      });
    }

    if (!isClerkTokenPayload(payload)) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const { sub, email, name, imageUrl } = payload;

    const user = await this.userService.findOrCreateFromClerk({
      clerkUserId: sub,
      email,
      name: name ?? email,
      imageUrl: imageUrl ?? null,
    });

    return user;
  }
}
