import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Sse,
  UseGuards,
} from '@nestjs/common';
import { ProctoringService } from './proctoring.service';
import { ClerkAuthGuard } from 'src/modules/auth/guards/clerk-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { CreateProctoringViolationDto } from './dto/create-proctoring-violation.dto';
import { ListProctoringViolationsDto } from './dto/list-proctoring-violations.dto';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/modules/auth/interfaces/authenticated-user.interface';

@Controller('proctoring')
@UseGuards(ClerkAuthGuard, RolesGuard)
export class ProctoringController {
  constructor(private readonly proctoringService: ProctoringService) {}

  @Get('violations')
  @Roles('teacher')
  listViolations(
    @Query() query: ListProctoringViolationsDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.proctoringService.listViolations(query, user);
  }

  @Sse('stream')
  @Roles('teacher')
  stream(@CurrentUser() user: AuthenticatedUser) {
    return this.proctoringService.createTeacherStream(user.id);
  }

  @Post('violations')
  @Roles('student', 'teacher')
  createViolation(
    @Body() body: CreateProctoringViolationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.proctoringService.createViolation(body, user);
  }
}
