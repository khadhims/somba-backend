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
  createOrganization(@Body() data: CreateOrganizationDto) {
    return this.tenantsService.createOrganization(data);
  }

  @Get('organizations')
  @ApiOperation({ summary: 'List all organizations' })
  findAllOrganizations() {
    return this.tenantsService.findAllOrganizations();
  }

  @Get('organizations/:uid')
  @ApiOperation({ summary: 'Get organization by UID' })
  findOrganization(@Param('uid') uid: string) {
    return this.tenantsService.findOrganizationByUid(uid);
  }

  @Patch('organizations/:uid')
  @ApiOperation({ summary: 'Update organization' })
  updateOrganization(
    @Param('uid') uid: string,
    @Body() data: UpdateOrganizationDto,
  ) {
    return this.tenantsService.updateOrganization(uid, data);
  }

  @Delete('organizations/:uid')
  @ApiOperation({ summary: 'Delete organization' })
  removeOrganization(@Param('uid') uid: string) {
    return this.tenantsService.removeOrganization(uid);
  }

  @Post('organizations/:orgUid/accounts')
  @ApiOperation({ summary: 'Create account under organization' })
  createAccountForOrganization(
    @Param('orgUid') orgUid: string,
    @Body() data: CreateAccountDto,
  ) {
    return this.tenantsService.createAccount({
      ...data,
      organization_uid: orgUid,
    });
  }

  @Get('organizations/:orgUid/accounts')
  @ApiOperation({ summary: 'List accounts by organization' })
  findAccountsByOrg(@Param('orgUid') orgUid: string) {
    return this.tenantsService.findAccountsByOrg(orgUid);
  }

  @Patch('accounts/:uid')
  @ApiOperation({ summary: 'Update account' })
  updateAccount(@Param('uid') uid: string, @Body() data: UpdateAccountDto) {
    return this.tenantsService.updateAccount(uid, data);
  }

  @Delete('accounts/:uid')
  @ApiOperation({ summary: 'Delete account' })
  removeAccount(@Param('uid') uid: string) {
    return this.tenantsService.removeAccount(uid);
  }

  @Post('accounts/:accountUid/teams')
  @ApiOperation({ summary: 'Create team under account' })
  createTeamForAccount(
    @Param('accountUid') accountUid: string,
    @Body() data: CreateTeamDto,
  ) {
    return this.tenantsService.createTeam({
      ...data,
      account_uid: accountUid,
    });
  }

  @Get('accounts/:accountUid/teams')
  @ApiOperation({ summary: 'List teams by account' })
  findTeamsByAccount(@Param('accountUid') accountUid: string) {
    return this.tenantsService.findTeamsByAccount(accountUid);
  }

  @Patch('teams/:uid')
  @ApiOperation({ summary: 'Update team' })
  updateTeam(@Param('uid') uid: string, @Body() data: UpdateTeamDto) {
    return this.tenantsService.updateTeam(uid, data);
  }

  @Delete('teams/:uid')
  @ApiOperation({ summary: 'Delete team' })
  removeTeam(@Param('uid') uid: string) {
    return this.tenantsService.removeTeam(uid);
  }
}
