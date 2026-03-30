import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [DatabaseModule, NotificationModule],
  controllers: [SessionController],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
