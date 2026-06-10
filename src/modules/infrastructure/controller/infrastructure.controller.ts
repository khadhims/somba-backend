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
import { InfrastructureService } from '../services/infrastructure.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CreateSiteDto } from '../dtos/create-site.dto';
import { CreateCameraDto } from '../dtos/create-camera.dto';
import { UpdateSiteDto } from '../dtos/update-site.dto';
import { UpdateCameraDto } from '../dtos/update-camera.dto';

@ApiTags('infrastructure')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class InfrastructureController {
  constructor(private infraService: InfrastructureService) {}

  @Get('sites')
  @ApiOperation({ summary: 'List all sites' })
  findAllSites() {
    return this.infraService.findAllSites();
  }

  @Get('sites/:uid')
  @ApiOperation({ summary: 'Get site by UID' })
  findSite(@Param('uid') uid: string) {
    return this.infraService.findSiteByUid(uid);
  }

  @Post('sites')
  @ApiOperation({ summary: 'Create site' })
  createSite(@Body() data: CreateSiteDto) {
    return this.infraService.createSite(data);
  }

  @Post('teams/:teamUid/sites')
  @ApiOperation({ summary: 'Create site under team' })
  createSiteForTeam(
    @Param('teamUid') teamUid: string,
    @Body() data: CreateSiteDto,
  ) {
    return this.infraService.createSite({
      ...data,
      team_uid: teamUid,
    });
  }

  @Get('teams/:teamUid/sites')
  @ApiOperation({ summary: 'List sites by team' })
  findSitesByTeam(@Param('teamUid') teamUid: string) {
    return this.infraService.findSitesByTeam(teamUid);
  }

  @Patch('sites/:uid')
  @ApiOperation({ summary: 'Update site' })
  updateSite(@Param('uid') uid: string, @Body() data: UpdateSiteDto) {
    return this.infraService.updateSite(uid, data);
  }

  @Delete('sites/:uid')
  @ApiOperation({ summary: 'Delete site' })
  removeSite(@Param('uid') uid: string) {
    return this.infraService.removeSite(uid);
  }

  @Post('sites/:uid/regenerate-key')
  @ApiOperation({ summary: 'Regenerate mini-PC API key for site' })
  regenerateSiteApiKey(@Param('uid') uid: string) {
    return this.infraService.regenerateSiteApiKey(uid);
  }

  @Get('sites/:siteUid/cameras')
  @ApiOperation({ summary: 'List cameras by site' })
  findCamerasBySite(@Param('siteUid') siteUid: string) {
    return this.infraService.findCamerasBySite(siteUid);
  }

  @Get('sites/:siteUid/cameras/:cameraUid')
  @ApiOperation({ summary: 'Get camera by site and UID' })
  findCameraBySite(
    @Param('siteUid') siteUid: string,
    @Param('cameraUid') cameraUid: string,
  ) {
    return this.infraService.findCameraBySite(siteUid, cameraUid);
  }

  @Post('sites/:siteUid/cameras')
  @ApiOperation({ summary: 'Create camera under site' })
  createCameraForSite(
    @Param('siteUid') siteUid: string,
    @Body() data: CreateCameraDto,
  ) {
    return this.infraService.createCamera({
      ...data,
      site_uid: siteUid,
    });
  }

  @Patch('sites/:siteUid/cameras/:cameraUid')
  @ApiOperation({ summary: 'Update camera under site' })
  updateCameraForSite(
    @Param('cameraUid') cameraUid: string,
    @Body() data: UpdateCameraDto,
  ) {
    return this.infraService.updateCamera(cameraUid, data);
  }

  @Delete('sites/:siteUid/cameras/:cameraUid')
  @ApiOperation({ summary: 'Delete camera under site' })
  removeCameraForSite(@Param('cameraUid') cameraUid: string) {
    return this.infraService.removeCamera(cameraUid);
  }

  @Post('cameras/:uid/start-recording')
  @ApiOperation({ summary: 'Start recording for camera' })
  startRecording(@Param('uid') uid: string) {
    return {
      status: 'success',
      message: `Started recording for camera ${uid}`,
    };
  }
}
