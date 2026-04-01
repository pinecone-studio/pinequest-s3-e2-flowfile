import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ProctoringService } from './proctoring.service';
import { ClerkAuthGuard } from 'src/modules/auth/guards/clerk-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { CreateProctoringViolationDto } from './dto/create-proctoring-violation.dto';
import { ListProctoringViolationsDto } from './dto/list-proctoring-violations.dto';

@Controller('proctoring')
@UseGuards(ClerkAuthGuard, RolesGuard)
export class ProctoringController {
  constructor(private readonly proctoringService: ProctoringService) {}

  @Get('violations')
  @Roles('teacher')
  listViolations(@Query() query: ListProctoringViolationsDto) {
    return this.proctoringService.listViolations(query);
  }

  @Post('violations')
  @Roles('student', 'teacher')
  createViolation(@Body() body: CreateProctoringViolationDto) {
    return this.proctoringService.createViolation(body);
  }
}
