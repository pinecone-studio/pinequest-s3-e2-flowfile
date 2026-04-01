import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from 'src/modules/user/user.module';
import { DatabaseModule } from 'src/database/database.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { ExamModule } from 'src/modules/exam/exam.module';
import { SessionModule } from 'src/modules/session/session.module';
import { AnswerModule } from 'src/modules/answer/answer.module';
import { MonitoringModule } from 'src/modules/monitoring/monitoring.module';
import { NotificationModule } from 'src/modules/notification/notification.module';
import { QuestionModule } from 'src/modules/question/question.module';
import { graphqlServerConfig } from 'src/graphql/server';
import {
  AdminDashboardResolver,
  ReportsOverviewResolver,
  TeacherExamDetailResolver,
} from 'src/graphql/resolvers';
import { OfflineExamSyncModule } from 'src/modules/offline-exam-sync/offline-exam-sync.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.local',
    }),
    GraphQLModule.forRoot(graphqlServerConfig),
    DatabaseModule,
    UserModule,
    AuthModule,
    ExamModule,
    QuestionModule,
    SessionModule,
    AnswerModule,
    MonitoringModule,
    NotificationModule,
    OfflineExamSyncModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AdminDashboardResolver,
    TeacherExamDetailResolver,
    ReportsOverviewResolver,
  ],
})
export class AppModule {}
