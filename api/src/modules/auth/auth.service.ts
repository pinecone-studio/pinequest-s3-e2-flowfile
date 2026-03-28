import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async validateRequest(authHeader?: string) {
    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const token = authHeader.replace('Bearer ', '');

    let payload: any;

    try {
      payload = JSON.parse(Buffer.from(token, 'base64').toString());
    } catch {
      throw new UnauthorizedException('Invalid token format');
    }

    const { sub, email, name, imageUrl } = payload;

    if (!sub || !email) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = await this.userService.findOrCreateFromClerk({
      clerkUserId: sub,
      email,
      name: name ?? email,
      imageUrl: imageUrl ?? null,
    });

    return user;
  }
}
