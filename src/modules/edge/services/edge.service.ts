import {
  Inject,
  Injectable,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Site } from '../../infrastructure/entities/site.entity';
import { Camera } from '../../infrastructure/entities/camera.entity';
import { buildEdgeStreamConfig } from '../../../common/utils/rtsp.util';
import {
  hashApiKey,
  isHashedApiKey,
  verifyApiKey,
} from '../../../common/utils/api-key.util';
import { EdgeGateway } from '../edge.gateway';

@Injectable()
export class EdgeService {
  constructor(
    @InjectRepository(Site)
    private siteRepository: Repository<Site>,
    @InjectRepository(Camera)
    private cameraRepository: Repository<Camera>,
    @Inject(forwardRef(() => EdgeGateway))
    private edgeGateway: EdgeGateway,
  ) {}

  notifyConfigUpdated(siteUid: string) {
    this.edgeGateway.notifyConfigUpdated(siteUid);
  }

  async findByApiKey(apiKey: string): Promise<Site | null> {
    if (!apiKey) {
      return null;
    }

    const sites = await this.siteRepository.find();
    for (const site of sites) {
      const matches = await verifyApiKey(apiKey, site.api_key_hash);
      if (!matches) {
        continue;
      }

      if (!isHashedApiKey(site.api_key_hash)) {
        site.api_key_hash = await hashApiKey(apiKey);
        await this.siteRepository.save(site);
      }

      return site;
    }

    return null;
  }

  async markOnline(uid: string): Promise<void> {
    await this.siteRepository.update(uid, {
      status: 'online',
      last_seen_at: new Date(),
    });
  }

  async markOffline(uid: string): Promise<void> {
    await this.siteRepository.update(uid, {
      status: 'offline',
    });
  }

  async checkCameraOwnership(
    siteUid: string,
    cameraUuid: string,
  ): Promise<boolean> {
    const camera = await this.cameraRepository.findOne({
      where: { uid: cameraUuid, site_uid: siteUid },
    });
    return Boolean(camera);
  }

  async getCamerasForSite(siteUid: string) {
    const cameras = await this.cameraRepository.find({
      where: { site_uid: siteUid },
      order: { name: 'ASC' },
    });

    return cameras
      .filter((camera) => camera.master_rtsp_url || camera.ipAddress)
      .map((camera) => {
        const masterRtsp = camera.master_rtsp_url ?? camera.ipAddress ?? '';
        const recordingConfig =
          (camera.camera_config?.recording as Record<string, unknown>) ?? {};

        return {
          name: camera.name,
          brand: camera.brand,
          recording: {
            enabled: recordingConfig.enabled !== false,
            post_buffer_sec: Number(recordingConfig.post_buffer_sec ?? 10),
            max_segment_sec: Number(recordingConfig.max_segment_sec ?? 300),
            activity_class: String(recordingConfig.activity_class ?? 'person'),
          },
          ...buildEdgeStreamConfig(camera.uid, masterRtsp, camera.brand),
        };
      });
  }

  requireSiteFromApiKey(site: Site | null): Site {
    if (!site) {
      throw new UnauthorizedException(
        'Per-site API key required for this operation',
      );
    }
    return site;
  }
}
