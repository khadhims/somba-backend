import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EdgeService } from '../../modules/edge/services/edge.service';
import { Site } from '../../modules/infrastructure/entities/site.entity';

export type EdgeAuthenticatedRequest = {
  site?: Site;
  headers: Record<string, string | string[] | undefined>;
};

@Injectable()
export class EdgeAuthGuard implements CanActivate {
  constructor(
    private configService: ConfigService,
    private edgeService: EdgeService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<EdgeAuthenticatedRequest>();
    const apiKey = request.headers['x-edge-api-key'] as string | undefined;

    if (!apiKey) {
      throw new UnauthorizedException('Invalid Edge API Key');
    }

    const site = await this.edgeService.findByApiKey(apiKey);
    if (site) {
      request.site = site;
      return true;
    }

    const legacyApiKey = this.configService.get<string>('EDGE_API_KEY');
    if (legacyApiKey && apiKey === legacyApiKey) {
      return true;
    }

    throw new UnauthorizedException('Invalid Edge API Key');
  }
}
