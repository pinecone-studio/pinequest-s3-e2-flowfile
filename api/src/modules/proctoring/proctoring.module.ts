import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { ProctoringController } from './proctoring.controller';
import { ProctoringService } from './proctoring.service';
import { ProctoringRepository } from './proctoring.repository';
import { ProctoringGateway } from './proctoring.gateway';

@Module({
  imports: [DatabaseModule],
  controllers: [ProctoringController],
  providers: [ProctoringService, ProctoringRepository, ProctoringGateway],
  exports: [ProctoringService],
})
export class ProctoringModule {}
