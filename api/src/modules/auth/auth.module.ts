import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { ClerkAuthGuard } from './guards/clerk-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Global()
@Module({
  imports: [UserModule],
  providers: [AuthService, ClerkAuthGuard, RolesGuard],
  controllers: [AuthController],
  exports: [AuthService, ClerkAuthGuard, RolesGuard],
})
export class AuthModule {}
