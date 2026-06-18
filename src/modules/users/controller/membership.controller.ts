import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Patch,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MembershipService } from '../services/membership.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { User } from '../entities/user.entity';
import { CreateMembershipDto } from '../dtos/create-membership.dto';
import { UpdateMembershipDto } from '../dtos/update-membership.dto';

@ApiTags('memberships')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class MembershipController {
  constructor(private membershipService: MembershipService) {}

  @Get('organizations/:entityUid/memberships')
  @ApiOperation({ summary: 'List memberships by organization' })
  findByOrganization(
    @Param('entityUid') entityUid: string,
    @CurrentUser() user: User,
  ) {
    return this.membershipService.findByOrganization(entityUid, user.uid);
  }

  @Post('organizations/:entityUid/memberships')
  @ApiOperation({ summary: 'Add member to organization' })
  createForOrganization(
    @Param('entityUid') entityUid: string,
    @Body() data: CreateMembershipDto,
    @CurrentUser() user: User,
  ) {
    return this.membershipService.create(
      {
        ...data,
        organization_uid: entityUid,
      },
      user.uid,
    );
  }

  @Patch('organizations/:entityUid/memberships/:uid')
  @ApiOperation({ summary: 'Update organization membership' })
  updateForOrganization(
    @Param('uid') uid: string,
    @Body() data: UpdateMembershipDto,
    @CurrentUser() user: User,
  ) {
    return this.membershipService.update(uid, data, user.uid);
  }

  @Delete('organizations/:entityUid/memberships/:uid')
  @ApiOperation({ summary: 'Remove organization membership' })
  removeForOrganization(@Param('uid') uid: string, @CurrentUser() user: User) {
    return this.membershipService.remove(uid, user.uid);
  }

  @Get('accounts/:entityUid/memberships')
  @ApiOperation({ summary: 'List memberships by account' })
  findByAccount(
    @Param('entityUid') entityUid: string,
    @CurrentUser() user: User,
  ) {
    return this.membershipService.findByAccount(entityUid, user.uid);
  }

  @Post('accounts/:entityUid/memberships')
  @ApiOperation({ summary: 'Add member to account' })
  createForAccount(
    @Param('entityUid') entityUid: string,
    @Body() data: CreateMembershipDto,
    @CurrentUser() user: User,
  ) {
    return this.membershipService.create(
      {
        ...data,
        account_uid: entityUid,
      },
      user.uid,
    );
  }

  @Patch('accounts/:entityUid/memberships/:uid')
  @ApiOperation({ summary: 'Update account membership' })
  updateForAccount(
    @Param('uid') uid: string,
    @Body() data: UpdateMembershipDto,
    @CurrentUser() user: User,
  ) {
    return this.membershipService.update(uid, data, user.uid);
  }

  @Delete('accounts/:entityUid/memberships/:uid')
  @ApiOperation({ summary: 'Remove account membership' })
  removeForAccount(@Param('uid') uid: string, @CurrentUser() user: User) {
    return this.membershipService.remove(uid, user.uid);
  }

  @Get('teams/:entityUid/memberships')
  @ApiOperation({ summary: 'List memberships by team' })
  findByTeam(
    @Param('entityUid') entityUid: string,
    @CurrentUser() user: User,
  ) {
    return this.membershipService.findByTeam(entityUid, user.uid);
  }

  @Post('teams/:entityUid/memberships')
  @ApiOperation({ summary: 'Add member to team' })
  createForTeam(
    @Param('entityUid') entityUid: string,
    @Body() data: CreateMembershipDto,
    @CurrentUser() user: User,
  ) {
    return this.membershipService.create(
      {
        ...data,
        team_uid: entityUid,
      },
      user.uid,
    );
  }

  @Patch('teams/:entityUid/memberships/:uid')
  @ApiOperation({ summary: 'Update team membership' })
  updateForTeam(
    @Param('uid') uid: string,
    @Body() data: UpdateMembershipDto,
    @CurrentUser() user: User,
  ) {
    return this.membershipService.update(uid, data, user.uid);
  }

  @Delete('teams/:entityUid/memberships/:uid')
  @ApiOperation({ summary: 'Remove team membership' })
  removeForTeam(@Param('uid') uid: string, @CurrentUser() user: User) {
    return this.membershipService.remove(uid, user.uid);
  }
}
