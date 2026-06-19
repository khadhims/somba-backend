import { Injectable, NotFoundException } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Brackets, In, Repository } from 'typeorm';
import { Site } from '../entities/site.entity';
import { Camera } from '../entities/camera.entity';
import { CreateSiteDto } from '../dtos/create-site.dto';
import { CreateCameraDto } from '../dtos/create-camera.dto';
import { UpdateSiteDto } from '../dtos/update-site.dto';
import { UpdateCameraDto } from '../dtos/update-camera.dto';
import { hashApiKey } from '../../../common/utils/api-key.util';
import { SiteWithOneTimeApiKey } from '../entities/site.entity';
import { AuthorizationService } from '../../users/services/authorization.service';
import { PaginatedQueryDto } from '../../../common/dtos/paginated-query.dto';
import {
  buildPaginatedResult,
  PaginatedResult,
  resolvePagination,
} from '../../../common/utils/pagination.util';

const CAMERA_SORT_FIELDS: Record<string, string> = {
  name: 'camera.name',
  location: 'camera.room',
  rtspUrl: 'camera.rtsp_url',
  activity: 'camera.activity',
  alert: 'camera.alert',
  status: 'camera.status',
};

const SITE_CREATOR_RELATIONS = { creator: true } as const;

@Injectable()
export class InfrastructureService {
  constructor(
    @InjectRepository(Site)
    private siteRepository: Repository<Site>,
    @InjectRepository(Camera)
    private cameraRepository: Repository<Camera>,
    private moduleRef: ModuleRef,
    private authorizationService: AuthorizationService,
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

  async findAllSites(userUid: string): Promise<Site[]> {
    const uids = await this.authorizationService.getAccessibleSiteUids(userUid);
    if (uids.length === 0) {
      return [];
    }
    return this.siteRepository.find({
      where: { uid: In(uids) },
      relations: SITE_CREATOR_RELATIONS,
    });
  }

  async createSite(
    data: CreateSiteDto,
    userUid: string,
  ): Promise<SiteWithOneTimeApiKey> {
    if (!data.team_uid) {
      throw new NotFoundException('team_uid is required');
    }
    await this.authorizationService.assertCanWriteTeam(userUid, data.team_uid);
    const plainApiKey = data.api_key?.trim() || randomUUID();
    const site = this.siteRepository.create({
      ...data,
      created_by: userUid,
      api_key_hash: await hashApiKey(plainApiKey),
      status: data.status ?? 'active',
      connection_status: 'offline',
      timezone:
        data.timezone ??
        Intl.DateTimeFormat().resolvedOptions().timeZone ??
        'UTC',
    });
    const saved = await this.siteRepository.save(site);
    const withCreator = await this.siteRepository.findOne({
      where: { uid: saved.uid },
      relations: SITE_CREATOR_RELATIONS,
    });
    return Object.assign(withCreator ?? saved, { api_key: plainApiKey });
  }

  async findSitesByTeam(teamUid: string, userUid: string): Promise<Site[]> {
    await this.authorizationService.assertCanReadTeam(userUid, teamUid);
    const accessibleSiteUids =
      await this.authorizationService.getAccessibleSiteUids(userUid, teamUid);
    if (accessibleSiteUids.length === 0) {
      return [];
    }
    return this.siteRepository.find({
      where: { uid: In(accessibleSiteUids) },
      relations: SITE_CREATOR_RELATIONS,
    });
  }

  async findSiteByUid(uid: string, userUid: string): Promise<Site | null> {
    await this.authorizationService.assertCanReadSite(userUid, uid);
    return this.siteRepository.findOne({
      where: { uid },
      relations: SITE_CREATOR_RELATIONS,
    });
  }

  async updateSite(
    uid: string,
    data: UpdateSiteDto,
    userUid: string,
  ): Promise<Site> {
    await this.authorizationService.assertCanWriteSite(userUid, uid);
    const site = await this.siteRepository.findOne({ where: { uid } });
    if (!site) {
      throw new NotFoundException(`Site with UID ${uid} not found`);
    }
    Object.assign(site, data);
    const saved = await this.siteRepository.save(site);
    const reloaded = await this.siteRepository.findOne({
      where: { uid: saved.uid },
      relations: SITE_CREATOR_RELATIONS,
    });
    return reloaded ?? saved;
  }

  async regenerateSiteApiKey(
    uid: string,
    userUid: string,
  ): Promise<SiteWithOneTimeApiKey> {
    await this.authorizationService.assertCanWriteSite(userUid, uid);
    const site = await this.siteRepository.findOne({ where: { uid } });
    if (!site) {
      throw new NotFoundException(`Site with UID ${uid} not found`);
    }
    const plainApiKey = randomUUID();
    site.api_key_hash = await hashApiKey(plainApiKey);
    site.connection_status = 'offline';
    const saved = await this.siteRepository.save(site);
    const withCreator = await this.siteRepository.findOne({
      where: { uid: saved.uid },
      relations: SITE_CREATOR_RELATIONS,
    });
    return Object.assign(withCreator ?? saved, { api_key: plainApiKey });
  }

  async removeSite(uid: string, userUid: string): Promise<void> {
    await this.authorizationService.assertCanWriteSite(userUid, uid);
    const result = await this.siteRepository.delete(uid);
    if (result.affected === 0) {
      throw new NotFoundException(`Site with UID ${uid} not found`);
    }
  }

  private normalizeCameraPayload(data: CreateCameraDto | UpdateCameraDto) {
    const { cam_type, type, activity, ...rest } = data;
    const { room_id: _legacyRoomId, ...cameraData } = rest as typeof rest & {
      room_id?: number;
    };

    return {
      ...cameraData,
      type: type ?? cam_type,
      ...(activity !== undefined
        ? { activity: activity.trim().toLowerCase() }
        : {}),
    };
  }

  async createCamera(data: CreateCameraDto, userUid: string): Promise<Camera> {
    if (!data.site_uid) {
      throw new NotFoundException('site_uid is required');
    }
    await this.authorizationService.assertCanWriteSite(userUid, data.site_uid);
    const camera = this.cameraRepository.create(
      this.normalizeCameraPayload(data),
    );
    const saved = await this.cameraRepository.save(camera);
    this.notifySiteConfigUpdated(saved.site_uid);
    return saved;
  }

  async findCamerasBySite(
    siteUid: string,
    userUid: string,
    query: PaginatedQueryDto = new PaginatedQueryDto(),
  ): Promise<PaginatedResult<Camera>> {
    await this.authorizationService.assertCanReadSite(userUid, siteUid);

    const { skip, perPage } = resolvePagination(query);
    const qb = this.cameraRepository
      .createQueryBuilder('camera')
      .where('camera.site_uid = :siteUid', { siteUid });

    if (query.search?.trim()) {
      const search = `%${query.search.trim()}%`;
      qb.andWhere(
        new Brackets((expr) => {
          expr
            .where('camera.name ILIKE :search', { search })
            .orWhere('camera.brand ILIKE :search', { search })
            .orWhere('camera.room ILIKE :search', { search })
            .orWhere('camera.location ILIKE :search', { search })
            .orWhere('camera.rtsp_url ILIKE :search', { search })
            .orWhere('camera.stream_url ILIKE :search', { search })
            .orWhere('camera.activity ILIKE :search', { search });
        }),
      );
    }

    const sortColumn =
      CAMERA_SORT_FIELDS[query.sort_by ?? 'name'] ?? 'camera.name';
    const sortDirection = query.sort_order === 'desc' ? 'DESC' : 'ASC';
    qb.orderBy(sortColumn, sortDirection).addOrderBy('camera.uid', 'ASC');

    const totalItems = await qb.getCount();
    const items = await qb.skip(skip).take(perPage).getMany();

    return buildPaginatedResult(items, totalItems, query);
  }

  async findCameraByUid(
    uid: string,
    userUid?: string,
  ): Promise<Camera | null> {
    const camera = await this.cameraRepository.findOne({
      where: { uid },
      relations: { site: true },
    });
    if (!camera) {
      return null;
    }
    if (userUid) {
      await this.authorizationService.assertCanReadSite(userUid, camera.site_uid);
    }
    return camera;
  }

  async findCameraBySite(
    siteUid: string,
    cameraUid: string,
    userUid: string,
  ): Promise<Camera | null> {
    await this.authorizationService.assertCanReadSite(userUid, siteUid);
    const camera = await this.findCameraByUid(cameraUid, userUid);
    if (!camera || camera.site_uid !== siteUid) {
      throw new NotFoundException(
        `Camera with UID ${cameraUid} not found in site ${siteUid}`,
      );
    }
    return camera;
  }

  async updateCamera(
    uid: string,
    data: UpdateCameraDto,
    userUid: string,
  ): Promise<Camera> {
    const camera = await this.cameraRepository.findOne({ where: { uid } });
    if (!camera) {
      throw new NotFoundException(`Camera with UID ${uid} not found`);
    }
    await this.authorizationService.assertCanWriteSite(userUid, camera.site_uid);
    Object.assign(camera, this.normalizeCameraPayload(data));
    const saved = await this.cameraRepository.save(camera);
    this.notifySiteConfigUpdated(saved.site_uid);
    return saved;
  }

  async removeCamera(uid: string, userUid: string): Promise<void> {
    const camera = await this.cameraRepository.findOne({ where: { uid } });
    if (!camera) {
      throw new NotFoundException(`Camera with UID ${uid} not found`);
    }
    await this.authorizationService.assertCanWriteSite(userUid, camera.site_uid);

    const siteUid = camera.site_uid;
    const result = await this.cameraRepository.delete(uid);
    if (result.affected === 0) {
      throw new NotFoundException(`Camera with UID ${uid} not found`);
    }

    this.notifySiteConfigUpdated(siteUid);
  }
}
