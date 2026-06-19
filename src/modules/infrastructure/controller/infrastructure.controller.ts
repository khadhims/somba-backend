import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Patch,
  Delete,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InfrastructureService } from '../services/infrastructure.service';
import { AuthorizationService } from '../../users/services/authorization.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { User } from '../../users/entities/user.entity';
import { CreateSiteDto } from '../dtos/create-site.dto';
import { CreateCameraDto } from '../dtos/create-camera.dto';
import { UpdateSiteDto } from '../dtos/update-site.dto';
import { UpdateCameraDto } from '../dtos/update-camera.dto';

@ApiTags('infrastructure')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class InfrastructureController {
  constructor(
    private infraService: InfrastructureService,
    private authorizationService: AuthorizationService,
  ) {}

  @Get('sites')
  @ApiOperation({ summary: 'List sites accessible to current user' })
  findAllSites(@CurrentUser() user: User) {
    return this.infraService.findAllSites(user.uid);
  }

  @Get('sites/:uid')
  @ApiOperation({ summary: 'Get site by UID' })
  findSite(@Param('uid') uid: string, @CurrentUser() user: User) {
    return this.infraService.findSiteByUid(uid, user.uid);
  }

  @Post('sites')
  @ApiOperation({ summary: 'Create site' })
  createSite(@Body() data: CreateSiteDto, @CurrentUser() user: User) {
    return this.infraService.createSite(data, user.uid);
  }

  @Post('teams/:teamUid/sites')
  @ApiOperation({ summary: 'Create site under team' })
  createSiteForTeam(
    @Param('teamUid') teamUid: string,
    @Body() data: CreateSiteDto,
    @CurrentUser() user: User,
  ) {
    return this.infraService.createSite(
      {
        ...data,
        team_uid: teamUid,
      },
      user.uid,
    );
  }

  @Get('teams/:teamUid/sites')
  @ApiOperation({ summary: 'List sites by team' })
  findSitesByTeam(
    @Param('teamUid') teamUid: string,
    @CurrentUser() user: User,
  ) {
    return this.infraService.findSitesByTeam(teamUid, user.uid);
  }

  @Patch('sites/:uid')
  @ApiOperation({ summary: 'Update site' })
  updateSite(
    @Param('uid') uid: string,
    @Body() data: UpdateSiteDto,
    @CurrentUser() user: User,
  ) {
    return this.infraService.updateSite(uid, data, user.uid);
  }

  @Delete('sites/:uid')
  @ApiOperation({ summary: 'Delete site' })
  removeSite(@Param('uid') uid: string, @CurrentUser() user: User) {
    return this.infraService.removeSite(uid, user.uid);
  }

  @Post('sites/:uid/regenerate-key')
  @ApiOperation({ summary: 'Regenerate mini-PC API key for site' })
  regenerateSiteApiKey(@Param('uid') uid: string, @CurrentUser() user: User) {
    return this.infraService.regenerateSiteApiKey(uid, user.uid);
  }

  @Get('sites/:siteUid/cameras')
  @ApiOperation({ summary: 'List cameras by site' })
  findCamerasBySite(
    @Param('siteUid') siteUid: string,
    @CurrentUser() user: User,
  ) {
    return this.infraService.findCamerasBySite(siteUid, user.uid);
  }

  @Get('sites/:siteUid/cameras/:cameraUid')
  @ApiOperation({ summary: 'Get camera by site and UID' })
  findCameraBySite(
    @Param('siteUid') siteUid: string,
    @Param('cameraUid') cameraUid: string,
    @CurrentUser() user: User,
  ) {
    return this.infraService.findCameraBySite(siteUid, cameraUid, user.uid);
  }

  @Post('sites/:siteUid/cameras')
  @ApiOperation({ summary: 'Create camera under site' })
  createCameraForSite(
    @Param('siteUid') siteUid: string,
    @Body() data: CreateCameraDto,
    @CurrentUser() user: User,
  ) {
    return this.infraService.createCamera(
      {
        ...data,
        site_uid: siteUid,
      },
      user.uid,
    );
  }

  @Patch('sites/:siteUid/cameras/:cameraUid')
  @ApiOperation({ summary: 'Update camera under site' })
  updateCameraForSite(
    @Param('cameraUid') cameraUid: string,
    @Body() data: UpdateCameraDto,
    @CurrentUser() user: User,
  ) {
    return this.infraService.updateCamera(cameraUid, data, user.uid);
  }

  @Delete('sites/:siteUid/cameras/:cameraUid')
  @ApiOperation({ summary: 'Delete camera under site' })
  removeCameraForSite(
    @Param('cameraUid') cameraUid: string,
    @CurrentUser() user: User,
  ) {
    return this.infraService.removeCamera(cameraUid, user.uid);
  }

  @Post('cameras/:uid/start-recording')
  @ApiOperation({ summary: 'Start recording for camera' })
  async startRecording(@Param('uid') uid: string, @CurrentUser() user: User) {
    const camera = await this.infraService.findCameraByUid(uid, user.uid);
    if (!camera) {
      throw new NotFoundException(`Camera with UID ${uid} not found`);
    }
    await this.authorizationService.assertCanWriteSite(user.uid, camera.site_uid);
    return {
      status: 'success',
      message: `Started recording for camera ${uid}`,
    };
  }
}
