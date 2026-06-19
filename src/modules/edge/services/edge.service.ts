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
      connection_status: 'online',
      last_seen_at: new Date(),
    });
  }

  async markOffline(uid: string): Promise<void> {
    await this.siteRepository.update(uid, {
      connection_status: 'offline',
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

  async getCameraForSite(siteUid: string, cameraUuid: string) {
    return this.cameraRepository.findOne({
      where: { uid: cameraUuid, site_uid: siteUid },
    });
  }

  async getCamerasForSite(siteUid: string) {
    const cameras = await this.cameraRepository.find({
      where: { site_uid: siteUid },
      order: { name: 'ASC' },
    });

    return cameras
      .filter((camera) => camera.activity?.trim())
      .map((camera) => ({
        camera_uuid: camera.uid,
        name: camera.name,
        rtsp_url: camera.rtsp_url,
        stream_url: camera.stream_url,
        activity: camera.activity,
        alert: camera.alert,
      }));
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
