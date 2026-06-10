import {
  Controller,
  Get,
  Param,
  UseGuards,
  Patch,
  Body,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { UpdateUserDto } from '../dtos/update-user.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get(':uid')
  @ApiOperation({ summary: 'Get user by UID' })
  findOne(@Param('uid') uid: string) {
    return this.usersService.findOne(uid);
  }

  @Patch(':uid')
  @ApiOperation({ summary: 'Update user' })
  update(@Param('uid') uid: string, @Body() data: UpdateUserDto) {
    return this.usersService.update(uid, data);
  }

  @Delete(':uid')
  @ApiOperation({ summary: 'Delete user' })
  remove(@Param('uid') uid: string) {
    return this.usersService.remove(uid);
  }
}
