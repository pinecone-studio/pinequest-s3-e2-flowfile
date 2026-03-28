import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { MonitoringController } from './monitoring.controller';
import { MonitoringService } from './monitoring.service';
import { SessionModule } from '../session/session.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [DatabaseModule, SessionModule, NotificationModule],
  controllers: [MonitoringController],
  providers: [MonitoringService],
  exports: [MonitoringService],
})
export class MonitoringModule {}
