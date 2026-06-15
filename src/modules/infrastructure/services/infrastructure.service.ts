import { Injectable, NotFoundException } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { Site } from '../entities/site.entity';
import { Camera } from '../entities/camera.entity';
import { CreateSiteDto } from '../dtos/create-site.dto';
import { CreateCameraDto } from '../dtos/create-camera.dto';
import { UpdateSiteDto } from '../dtos/update-site.dto';
import { UpdateCameraDto } from '../dtos/update-camera.dto';
import { hashApiKey } from '../../../common/utils/api-key.util';
import { SiteWithOneTimeApiKey } from '../entities/site.entity';

@Injectable()
export class InfrastructureService {
  constructor(
    @InjectRepository(Site)
    private siteRepository: Repository<Site>,
    @InjectRepository(Camera)
    private cameraRepository: Repository<Camera>,
    private moduleRef: ModuleRef,
  ) {}

  notifySiteConfigUpdated(siteUid: string | null | undefined) {
    if (!siteUid) {
      return;
    }
    try {
      const { EdgeService } = require('../../edge/services/edge.service') as {
        EdgeService: new (...args: unknown[]) => {
          notifyConfigUpdated: (siteUid: string) => void;
        };
      };
      const edgeService = this.moduleRef.get(EdgeService, { strict: false });
      edgeService.notifyConfigUpdated(siteUid);
    } catch {
      // EdgeModule may not be initialized yet during bootstrap
    }
  }

  // Sites
  async findAllSites(): Promise<Site[]> {
    return this.siteRepository.find();
  }

  async createSite(data: CreateSiteDto): Promise<SiteWithOneTimeApiKey> {
    const plainApiKey = data.api_key?.trim() || randomUUID();
    const site = this.siteRepository.create({
      ...data,
      api_key_hash: await hashApiKey(plainApiKey),
      status: data.status ?? 'active',
      connection_status: 'offline',
      timezone:
        data.timezone ??
        Intl.DateTimeFormat().resolvedOptions().timeZone ??
        'UTC',
    });
    const saved = await this.siteRepository.save(site);
    return Object.assign(saved, { api_key: plainApiKey });
  }

  async findSitesByTeam(teamUid: string): Promise<Site[]> {
    return this.siteRepository.find({ where: { team_uid: teamUid } });
  }

  async findSiteByUid(uid: string): Promise<Site | null> {
    return this.siteRepository.findOne({ where: { uid } });
  }

  async updateSite(uid: string, data: UpdateSiteDto): Promise<Site> {
    const site = await this.findSiteByUid(uid);
    if (!site) throw new NotFoundException(`Site with UID ${uid} not found`);
    Object.assign(site, data);
    return this.siteRepository.save(site);
  }

  async regenerateSiteApiKey(uid: string): Promise<SiteWithOneTimeApiKey> {
    const site = await this.findSiteByUid(uid);
    if (!site) {
      throw new NotFoundException(`Site with UID ${uid} not found`);
    }
    const plainApiKey = randomUUID();
    site.api_key_hash = await hashApiKey(plainApiKey);
    site.connection_status = 'offline';
    const saved = await this.siteRepository.save(site);
    return Object.assign(saved, { api_key: plainApiKey });
  }

  async removeSite(uid: string): Promise<void> {
    const result = await this.siteRepository.delete(uid);
    if (result.affected === 0)
      throw new NotFoundException(`Site with UID ${uid} not found`);
  }

  // Cameras
  private normalizeCameraPayload(data: CreateCameraDto | UpdateCameraDto) {
    const { cam_type, type, ...rest } = data;
    const { room_id: _legacyRoomId, ...cameraData } = rest as typeof rest & {
      room_id?: number;
    };

    return {
      ...cameraData,
      type: type ?? cam_type,
    };
  }

  async createCamera(data: CreateCameraDto): Promise<Camera> {
    const camera = this.cameraRepository.create(
      this.normalizeCameraPayload(data),
    );
    const saved = await this.cameraRepository.save(camera);
    this.notifySiteConfigUpdated(saved.site_uid);
    return saved;
  }

  async findCamerasBySite(siteUid: string): Promise<Camera[]> {
    return this.cameraRepository.find({
      where: { site_uid: siteUid },
    });
  }

  async findCameraByUid(uid: string): Promise<Camera | null> {
    return this.cameraRepository.findOne({
      where: { uid },
      relations: { site: true },
    });
  }

  async findCameraBySite(
    siteUid: string,
    cameraUid: string,
  ): Promise<Camera | null> {
    const camera = await this.findCameraByUid(cameraUid);
    if (!camera || camera.site_uid !== siteUid) {
      throw new NotFoundException(
        `Camera with UID ${cameraUid} not found in site ${siteUid}`,
      );
    }
    return camera;
  }

  async updateCamera(uid: string, data: UpdateCameraDto): Promise<Camera> {
    const camera = await this.findCameraByUid(uid);
    if (!camera)
      throw new NotFoundException(`Camera with UID ${uid} not found`);
    Object.assign(camera, this.normalizeCameraPayload(data));
    const saved = await this.cameraRepository.save(camera);
    this.notifySiteConfigUpdated(saved.site_uid);
    return saved;
  }

  async removeCamera(uid: string): Promise<void> {
    const camera = await this.findCameraByUid(uid);
    if (!camera)
      throw new NotFoundException(`Camera with UID ${uid} not found`);

    const siteUid = camera.site_uid;
    const result = await this.cameraRepository.delete(uid);
    if (result.affected === 0)
      throw new NotFoundException(`Camera with UID ${uid} not found`);

    this.notifySiteConfigUpdated(siteUid);
  }
}
