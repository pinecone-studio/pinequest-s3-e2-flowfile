import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AnswerService } from './answer.service';
import { UpsertAnswerDto } from './dto/upsert-answer.dto';
import { ClerkAuthGuard } from 'src/modules/auth/guards/clerk-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/modules/auth/interfaces/authenticated-user.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'node:path';
import { UploadAnswerAssetDto } from './dto/upload-answer-asset.dto';
import type { Request } from 'express';

type UploadedAnswerFile = {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
};

@Controller('answers')
@UseGuards(ClerkAuthGuard, RolesGuard)
export class AnswerController {
  constructor(private readonly answerService: AnswerService) {}

  @Get('session/:sessionId')
  @Roles('teacher', 'student')
  getAnswersBySession(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.answerService.getAnswersBySession(sessionId, user);
  }

  @Post('autosave')
  @Roles('student')
  autosaveAnswer(
    @Body() body: UpsertAnswerDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.answerService.autosaveAnswer(body, user);
  }

  @Post('upload')
  @HttpCode(201)
  @Roles('student')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'uploads/answers',
        filename: (_req, file, cb) => {
          const safeExtension = extname(file.originalname) || '.bin';
          cb(null, `${Date.now()}-${crypto.randomUUID()}${safeExtension}`);
        },
      }),
      limits: {
        fileSize: 25 * 1024 * 1024,
      },
    }),
  )
  uploadAnswerAsset(
    @UploadedFile() file: UploadedAnswerFile,
    @Body() body: UploadAnswerAssetDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.answerService.uploadAnswerAsset(file, body, user, request);
  }

  @Patch('session/:sessionId/finalize')
  @Roles('student')
  finalizeAnswers(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.answerService.finalizeAnswers(sessionId, user);
  }
}
