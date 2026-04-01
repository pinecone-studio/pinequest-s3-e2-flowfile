import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { OfflineExamSyncController } from './offline-exam-sync.controller';
import { OfflineExamSyncService } from './offline-exam-sync.service';
import { OfflineExamSyncRepository } from './offline-exam-sync.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [OfflineExamSyncController],
  providers: [OfflineExamSyncService, OfflineExamSyncRepository],
  exports: [OfflineExamSyncService],
})
export class OfflineExamSyncModule {}
