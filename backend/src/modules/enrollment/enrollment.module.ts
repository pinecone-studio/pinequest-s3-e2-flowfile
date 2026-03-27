import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { EnrollmentService } from './enrollment.service';
import { EnrollmentController } from './enrollment.controller';
import { EnrollmentResolver } from './enrollment.resolver';

@Module({
  imports: [DatabaseModule],
  providers: [EnrollmentService, EnrollmentResolver],
  controllers: [EnrollmentController],
})
export class EnrollmentModule {}
