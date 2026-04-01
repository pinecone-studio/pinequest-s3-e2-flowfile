import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Query,
} from '@nestjs/common';
import { OfflineExamSyncService } from './offline-exam-sync.service';
import { GetOfflineDraftDto } from './dto/get-offline-draft.dto';
import { DeleteOfflineDraftDto } from './dto/delete-offline-draft.dto';
import { UpsertOfflineDraftDto } from './dto/upsert-offline-draft.dto';
import { ListOfflineSubmissionDto } from './dto/list-offline-submission.dto';
import { UpsertOfflineSubmissionDto } from './dto/upsert-offline-submission.dto';

@Controller('offline-exam-sync')
export class OfflineExamSyncController {
  constructor(
    private readonly offlineExamSyncService: OfflineExamSyncService,
  ) {}

  @Get('draft')
  async getDraft(@Query() query: GetOfflineDraftDto) {
    const draft = await this.offlineExamSyncService.getDraft(
      query.assignmentId,
      query.studentId,
    );

    return { draft };
  }

  @Post('draft')
  async saveDraft(@Body() body: UpsertOfflineDraftDto) {
    const draft = await this.offlineExamSyncService.saveDraft(body);
    return { draft };
  }

  @Delete('draft')
  @HttpCode(204)
  async deleteDraft(@Query() query: DeleteOfflineDraftDto) {
    await this.offlineExamSyncService.deleteDraft(
      query.assignmentId,
      query.studentId,
    );
  }

  @Get('submission')
  async listSubmissions(@Query() query: ListOfflineSubmissionDto) {
    const submissions = await this.offlineExamSyncService.listSubmissions({
      studentId: query.studentId,
      assignmentId: query.assignmentId,
      limit: query.limit ?? 500,
    });

    return { submissions };
  }

  @Post('submission')
  async saveSubmission(@Body() body: UpsertOfflineSubmissionDto) {
    const submission = await this.offlineExamSyncService.saveSubmission(body);
    return { submission };
  }
}
