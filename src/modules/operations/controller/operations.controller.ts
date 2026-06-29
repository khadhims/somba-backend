import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OperationsService } from '../services/operations.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CreateEventDto } from '../dtos/create-event.dto';
import { CreateAlertDto } from '../dtos/create-alert.dto';
import { UpdateAlertDto } from '../dtos/update-alert.dto';
import { QueryPageSearchDto } from '../../../common/queryPaginateSearch.dto';

@ApiTags('operations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class OperationsController {
  constructor(private operationsService: OperationsService) {}

  @Post('events')
  @ApiOperation({ summary: 'Create event' })
  createEvent(@Body() data: CreateEventDto) {
    return this.operationsService.createRecordingEvent(data);
  }

  @Get('sites/:siteUid/events')
  @ApiOperation({ summary: 'List events by site' })
  findEventsBySite(
    @Param('siteUid') siteUid: string,
    @Query() query: QueryPageSearchDto,
  ) {
    return this.operationsService.findActivitiesBySite(siteUid, query);
  }

  @Get('sites/:siteUid/activities')
  @ApiOperation({ summary: 'List activities by site' })
  findActivitiesBySite(
    @Param('siteUid') siteUid: string,
    @Query() query: QueryPageSearchDto,
  ) {
    return this.operationsService.findActivitiesBySite(siteUid, query);
  }

  @Get('sites/:siteUid/live-activities')
  @ApiOperation({ summary: 'List live activities by site' })
  findLiveActivitiesBySite(@Param('siteUid') siteUid: string) {
    return this.operationsService.findLiveActivitiesBySite(siteUid);
  }

  // Returns the full set of site activities (no DTO bound, so the redundant
  // site_uid/from_date/to_date query params the dashboard sends are ignored).
  @Get('sites/:siteUid/activities-summary')
  @ApiOperation({ summary: 'Get activities summary by site' })
  findActivitiesSummaryBySite(@Param('siteUid') siteUid: string) {
    return this.operationsService.findActivitiesSummaryBySite(siteUid);
  }

  @Post('alerts')
  @ApiOperation({ summary: 'Create alert' })
  createAlert(@Body() data: CreateAlertDto) {
    return this.operationsService.createAlert(data);
  }

  @Get('sites/:siteUid/alerts')
  @ApiOperation({ summary: 'List alerts by site' })
  findAlertsBySite(
    @Param('siteUid') siteUid: string,
    @Query() query: QueryPageSearchDto,
  ) {
    return this.operationsService.findAlertsBySite(siteUid, query);
  }

  @Get('sites/:siteUid/alerts-summary')
  @ApiOperation({ summary: 'Get alerts summary by site' })
  findAlertsSummaryBySite(@Param('siteUid') siteUid: string) {
    return this.operationsService.findAlertsSummaryBySite(siteUid);
  }

  @Post('sites/alerts/:alertId/update')
  @ApiOperation({ summary: 'Update alert status and comment' })
  updateAlert(
    @Param('alertId') alertId: string,
    @Body() body: UpdateAlertDto,
  ) {
    return this.operationsService.updateAlertById(
      alertId,
      body.status,
      body.comment,
    );
  }

  @Patch('alerts/:alertId/resolve')
  @ApiOperation({ summary: 'Resolve or update alert status' })
  resolveAlert(
    @Param('alertId') alertId: string,
    @Body() body: UpdateAlertDto,
  ) {
    return this.operationsService.updateAlertById(
      alertId,
      body.status,
      body.comment,
    );
  }

  @Post('events/:uid/acknowledge')
  @ApiOperation({ summary: 'Acknowledge an event' })
  acknowledgeEvent(@Param('uid') uid: string) {
    return { status: 'success', message: `Acknowledged event ${uid}` };
  }
}
