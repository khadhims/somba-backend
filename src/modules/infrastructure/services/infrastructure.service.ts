import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Site } from '../entities/site.entity';
import { Camera } from '../entities/camera.entity';
import { CreateSiteDto } from '../dtos/create-site.dto';
import { CreateCameraDto } from '../dtos/create-camera.dto';
import { UpdateSiteDto } from '../dtos/update-site.dto';
import { UpdateCameraDto } from '../dtos/update-camera.dto';

@Injectable()
export class InfrastructureService {
  constructor(
    @InjectRepository(Site)
    private siteRepository: Repository<Site>,
    @InjectRepository(Camera)
    private cameraRepository: Repository<Camera>,
  ) {}

  // Sites
  async findAllSites(): Promise<Site[]> {
    return this.siteRepository.find();
  }

  async createSite(data: CreateSiteDto): Promise<Site> {
    const site = this.siteRepository.create(data);
    return this.siteRepository.save(site);
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

  async removeSite(uid: string): Promise<void> {
    const result = await this.siteRepository.delete(uid);
    if (result.affected === 0)
      throw new NotFoundException(`Site with UID ${uid} not found`);
  }

  // Cameras
  private normalizeCameraPayload(data: CreateCameraDto | UpdateCameraDto) {
    const { public_endpoint_url, cam_type, ipAddress, type, ...rest } = data;
    const { room_id: _legacyRoomId, ...cameraData } = rest as typeof rest & {
      room_id?: number;
    };

    return {
      ...cameraData,
      ipAddress: ipAddress ?? public_endpoint_url,
      type: type ?? cam_type,
    };
  }

  async createCamera(data: CreateCameraDto): Promise<Camera> {
    const camera = this.cameraRepository.create(
      this.normalizeCameraPayload(data),
    );
    return this.cameraRepository.save(camera);
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
    return this.cameraRepository.save(camera);
  }

  async removeCamera(uid: string): Promise<void> {
    const result = await this.cameraRepository.delete(uid);
    if (result.affected === 0)
      throw new NotFoundException(`Camera with UID ${uid} not found`);
  }
}
