import { Controller, Get, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from './guards/clerk-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface';

@Controller('auth')
export class AuthController {
  @Get('me')
  @UseGuards(ClerkAuthGuard)
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return {
      success: true,
      data: user,
    };
  }
}
