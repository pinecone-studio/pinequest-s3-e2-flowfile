import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/modules/user/user.service';

interface ClerkTokenPayload {
  sub: string;
  email: string;
  name?: string;
  imageUrl?: string | null;
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
