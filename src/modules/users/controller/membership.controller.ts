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
  findByOrganization(@Param('entityUid') entityUid: string) {
    return this.membershipService.findByOrganization(entityUid);
  }

  @Post('organizations/:entityUid/memberships')
  @ApiOperation({ summary: 'Add member to organization' })
  createForOrganization(
    @Param('entityUid') entityUid: string,
    @Body() data: CreateMembershipDto,
  ) {
    return this.membershipService.create({
      ...data,
      organization_uid: entityUid,
    });
  }

  @Patch('organizations/:entityUid/memberships/:uid')
  @ApiOperation({ summary: 'Update organization membership' })
  updateForOrganization(
    @Param('uid') uid: string,
    @Body() data: UpdateMembershipDto,
  ) {
    return this.membershipService.update(uid, data);
  }

  @Delete('organizations/:entityUid/memberships/:uid')
  @ApiOperation({ summary: 'Remove organization membership' })
  removeForOrganization(@Param('uid') uid: string) {
    return this.membershipService.remove(uid);
  }

  @Get('accounts/:entityUid/memberships')
  @ApiOperation({ summary: 'List memberships by account' })
  findByAccount(@Param('entityUid') entityUid: string) {
    return this.membershipService.findByAccount(entityUid);
  }

  @Post('accounts/:entityUid/memberships')
  @ApiOperation({ summary: 'Add member to account' })
  createForAccount(
    @Param('entityUid') entityUid: string,
    @Body() data: CreateMembershipDto,
  ) {
    return this.membershipService.create({
      ...data,
      account_uid: entityUid,
    });
  }

  @Patch('accounts/:entityUid/memberships/:uid')
  @ApiOperation({ summary: 'Update account membership' })
  updateForAccount(
    @Param('uid') uid: string,
    @Body() data: UpdateMembershipDto,
  ) {
    return this.membershipService.update(uid, data);
  }

  @Delete('accounts/:entityUid/memberships/:uid')
  @ApiOperation({ summary: 'Remove account membership' })
  removeForAccount(@Param('uid') uid: string) {
    return this.membershipService.remove(uid);
  }

  @Get('teams/:entityUid/memberships')
  @ApiOperation({ summary: 'List memberships by team' })
  findByTeam(@Param('entityUid') entityUid: string) {
    return this.membershipService.findByTeam(entityUid);
  }

  @Post('teams/:entityUid/memberships')
  @ApiOperation({ summary: 'Add member to team' })
  createForTeam(
    @Param('entityUid') entityUid: string,
    @Body() data: CreateMembershipDto,
  ) {
    return this.membershipService.create({
      ...data,
      team_uid: entityUid,
    });
  }

  @Patch('teams/:entityUid/memberships/:uid')
  @ApiOperation({ summary: 'Update team membership' })
  updateForTeam(
    @Param('uid') uid: string,
    @Body() data: UpdateMembershipDto,
  ) {
    return this.membershipService.update(uid, data);
  }

  @Delete('teams/:entityUid/memberships/:uid')
  @ApiOperation({ summary: 'Remove team membership' })
  removeForTeam(@Param('uid') uid: string) {
    return this.membershipService.remove(uid);
  }
}
