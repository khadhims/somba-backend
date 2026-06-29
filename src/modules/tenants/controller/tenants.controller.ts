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
import { TenantsService } from '../services/tenants.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { User } from '../../users/entities/user.entity';
import { CreateOrganizationDto } from '../dtos/create-organization.dto';
import { CreateAccountDto } from '../dtos/create-account.dto';
import { CreateTeamDto } from '../dtos/create-team.dto';
import { UpdateOrganizationDto } from '../dtos/update-organization.dto';
import { UpdateAccountDto } from '../dtos/update-account.dto';
import { UpdateTeamDto } from '../dtos/update-team.dto';

@ApiTags('tenants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class TenantsController {
  constructor(private tenantsService: TenantsService) {}

  @Post('organizations')
  @ApiOperation({ summary: 'Create organization' })
  createOrganization(
    @Body() data: CreateOrganizationDto,
    @CurrentUser() user: User,
  ) {
    return this.tenantsService.createOrganization(data, user.uid);
  }

  @Get('organizations')
  @ApiOperation({ summary: 'List organizations accessible to current user' })
  findAllOrganizations(@CurrentUser() user: User) {
    return this.tenantsService.findAllOrganizations(user.uid);
  }

  @Get('organizations/summary')
  @ApiOperation({ summary: 'Get summary counts for organizations accessible to current user' })
  getOrganizationsSummary(@CurrentUser() user: User) {
    return this.tenantsService.getOrganizationsSummary(user.uid);
  }

  @Get('organizations/:uid')
  @ApiOperation({ summary: 'Get organization by UID' })
  findOrganization(@Param('uid') uid: string, @CurrentUser() user: User) {
    return this.tenantsService.findOrganizationByUid(uid, user.uid);
  }

  @Patch('organizations/:uid')
  @ApiOperation({ summary: 'Update organization' })
  updateOrganization(
    @Param('uid') uid: string,
    @Body() data: UpdateOrganizationDto,
    @CurrentUser() user: User,
  ) {
    return this.tenantsService.updateOrganization(uid, data, user.uid);
  }

  @Delete('organizations/:uid')
  @ApiOperation({ summary: 'Delete organization' })
  removeOrganization(@Param('uid') uid: string, @CurrentUser() user: User) {
    return this.tenantsService.removeOrganization(uid, user.uid);
  }

  @Post('organizations/:orgUid/accounts')
  @ApiOperation({ summary: 'Create account under organization' })
  createAccountForOrganization(
    @Param('orgUid') orgUid: string,
    @Body() data: CreateAccountDto,
    @CurrentUser() user: User,
  ) {
    return this.tenantsService.createAccount(
      {
        ...data,
        organization_uid: orgUid,
      },
      user.uid,
    );
  }

  @Get('organizations/:orgUid/accounts')
  @ApiOperation({ summary: 'List accounts by organization' })
  findAccountsByOrg(
    @Param('orgUid') orgUid: string,
    @CurrentUser() user: User,
  ) {
    return this.tenantsService.findAccountsByOrg(orgUid, user.uid);
  }

  @Patch('accounts/:uid')
  @ApiOperation({ summary: 'Update account' })
  updateAccount(
    @Param('uid') uid: string,
    @Body() data: UpdateAccountDto,
    @CurrentUser() user: User,
  ) {
    return this.tenantsService.updateAccount(uid, data, user.uid);
  }

  @Delete('accounts/:uid')
  @ApiOperation({ summary: 'Delete account' })
  removeAccount(@Param('uid') uid: string, @CurrentUser() user: User) {
    return this.tenantsService.removeAccount(uid, user.uid);
  }

  @Post('accounts/:accountUid/teams')
  @ApiOperation({ summary: 'Create team under account' })
  createTeamForAccount(
    @Param('accountUid') accountUid: string,
    @Body() data: CreateTeamDto,
    @CurrentUser() user: User,
  ) {
    return this.tenantsService.createTeam(
      {
        ...data,
        account_uid: accountUid,
      },
      user.uid,
    );
  }

  @Get('accounts/:accountUid/teams')
  @ApiOperation({ summary: 'List teams by account' })
  findTeamsByAccount(
    @Param('accountUid') accountUid: string,
    @CurrentUser() user: User,
  ) {
    return this.tenantsService.findTeamsByAccount(accountUid, user.uid);
  }

  @Patch('teams/:uid')
  @ApiOperation({ summary: 'Update team' })
  updateTeam(
    @Param('uid') uid: string,
    @Body() data: UpdateTeamDto,
    @CurrentUser() user: User,
  ) {
    return this.tenantsService.updateTeam(uid, data, user.uid);
  }

  @Delete('teams/:uid')
  @ApiOperation({ summary: 'Delete team' })
  removeTeam(@Param('uid') uid: string, @CurrentUser() user: User) {
    return this.tenantsService.removeTeam(uid, user.uid);
  }
}
