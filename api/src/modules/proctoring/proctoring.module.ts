import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { ProctoringController } from './proctoring.controller';
import { ProctoringService } from './proctoring.service';
import { ProctoringRepository } from './proctoring.repository';
import { ProctoringGateway } from './proctoring.gateway';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [DatabaseModule, NotificationModule],
  controllers: [ProctoringController],
  providers: [ProctoringService, ProctoringRepository, ProctoringGateway],
  exports: [ProctoringService],
})
export class ProctoringModule {}
