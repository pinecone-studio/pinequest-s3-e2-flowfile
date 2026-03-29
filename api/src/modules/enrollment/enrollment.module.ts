import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { EnrollmentService } from './enrollment.service';
import { EnrollmentController } from './enrollment.controller';

@Module({
  imports: [DatabaseModule],
  providers: [EnrollmentService],
  controllers: [EnrollmentController],
})
export class EnrollmentModule {}
