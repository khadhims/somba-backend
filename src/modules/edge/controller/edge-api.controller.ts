import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EdgeAuthGuard } from '../../../common/guards/edge-auth.guard';
import type { EdgeAuthenticatedRequest } from '../../../common/guards/edge-auth.guard';
import { EdgeService } from '../services/edge.service';

@ApiTags('edge')
@Controller('edge')
export class EdgeApiController {
  constructor(private edgeService: EdgeService) {}

  @Get('cameras')
  @UseGuards(EdgeAuthGuard)
  @ApiHeader({ name: 'x-edge-api-key', required: true })
  @ApiOperation({ summary: 'List cameras for authenticated site (mini-PC)' })
  getCameras(@Req() req: EdgeAuthenticatedRequest) {
    const site = this.edgeService.requireSiteFromApiKey(req.site ?? null);
    return this.edgeService.getCamerasForSite(site.uid);
  }
}
