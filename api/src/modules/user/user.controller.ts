import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import type { UserRole } from 'src/shared/types/user.types';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.userService.getById(id);
  }

  @Get()
  async findAllByRole(@Query('role') role?: UserRole) {
    if (role) {
      return this.userService.findAllByRole(role);
    }

    return {
      message: 'Role query: teacher | student',
    };
  }

  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(id, updateUserDto);
  }
}
