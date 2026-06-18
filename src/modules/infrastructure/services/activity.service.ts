import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Activity } from '../entities/activity.entity';
import { Camera } from '../entities/camera.entity';
import { CreateActivityDto } from '../dtos/create-activity.dto';
import { UpdateActivityDto } from '../dtos/update-activity.dto';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
    @InjectRepository(Camera)
    private cameraRepository: Repository<Camera>,
  ) {}

  async findBySite(siteUid: string): Promise<any[]> {
    const activities = await this.activityRepository.find({
      where: { site_uid: siteUid },
      relations: { cameras: true },
      order: { name: 'ASC' },
    });

    return activities.map((activity) => {
      const { cameras, ...rest } = activity;
      return {
        ...rest,
        camera_uids: cameras?.map((c) => c.uid) || [],
      };
    });
  }

  async findByUid(siteUid: string, activityUid: string): Promise<Activity> {
    const activity = await this.activityRepository.findOne({
      where: { uid: activityUid, site_uid: siteUid },
    });
    if (!activity) {
      throw new NotFoundException(
        `Activity ${activityUid} not found in site ${siteUid}`,
      );
    }
    return activity;
  }

  async create(siteUid: string, data: CreateActivityDto): Promise<Activity> {
    const code =
      data.code?.trim() ||
      (await this.uniqueCodeForSite(siteUid, this.slugifyName(data.name)));

    const existing = await this.activityRepository.findOne({
      where: { site_uid: siteUid, code },
    });
    if (existing) {
      throw new BadRequestException(
        `Activity code "${code}" already exists for this site`,
      );
    }

    const { camera_uids, ...activityData } = data;

    const activity = this.activityRepository.create({
      ...activityData,
      code,
      ai_model: this.normalizeAiModel(data.ai_model),
      site_uid: siteUid,
      min_confidence: data.min_confidence ?? 0.5,
      recording_config: data.recording_config ?? {
        post_buffer_sec: 10,
        max_segment_sec: 300,
      },
      is_active: data.is_active ?? true,
    });
    
    const saved = await this.activityRepository.save(activity);
    
    if (camera_uids !== undefined) {
      await this.assignCamerasToActivity(siteUid, saved.uid, camera_uids);
    }
    
    return saved;
  }

  async update(
    siteUid: string,
    activityUid: string,
    data: UpdateActivityDto,
  ): Promise<Activity> {
    const activity = await this.findByUid(siteUid, activityUid);

    if (data.code && data.code !== activity.code) {
      const duplicate = await this.activityRepository.findOne({
        where: { site_uid: siteUid, code: data.code },
      });
      if (duplicate) {
        throw new BadRequestException(
          `Activity code "${data.code}" already exists for this site`,
        );
      }
    }

    const { camera_uids, ...updateData } = data;

    if (updateData.ai_model !== undefined) {
      updateData.ai_model = this.normalizeAiModel(updateData.ai_model);
    }

    Object.assign(activity, updateData);
    const saved = await this.activityRepository.save(activity);
    
    if (camera_uids !== undefined) {
      await this.assignCamerasToActivity(siteUid, saved.uid, camera_uids);
    }
    
    return saved;
  }

  async remove(siteUid: string, activityUid: string): Promise<void> {
    const activity = await this.findByUid(siteUid, activityUid);
    await this.activityRepository.remove(activity);
  }

  async getAssignmentsForCamera(
    siteUid: string,
    cameraUid: string,
  ): Promise<Activity[]> {
    const camera = await this.assertCameraInSite(siteUid, cameraUid);
    
    if (camera.activity_uid) {
      const activity = await this.activityRepository.findOne({ where: { uid: camera.activity_uid, is_active: true } });
      if (activity) {
        return [activity];
      }
    }
    return [];
  }

  async listAssignmentsForCamera(siteUid: string, cameraUid: string) {
    const camera = await this.assertCameraInSite(siteUid, cameraUid);
    if (!camera.activity_uid) return [];
    
    const activity = await this.activityRepository.findOne({ where: { uid: camera.activity_uid } });
    if (!activity) return [];
    
    return [{
      activity: activity,
      enabled: true
    }];
  }

  async assignActivitiesToCamera(
    siteUid: string,
    cameraUid: string,
    activityUids: string[],
  ): Promise<Activity[]> {
    const camera = await this.assertCameraInSite(siteUid, cameraUid);

    const uniqueUids = [...new Set(activityUids)];
    
    if (uniqueUids.length > 1) {
      throw new BadRequestException('A camera can only be assigned to a maximum of 1 activity.');
    }

    if (uniqueUids.length === 1) {
      const activityUid = uniqueUids[0];
      const activity = await this.activityRepository.findOne({
        where: { uid: activityUid, site_uid: siteUid },
      });
      if (!activity) {
        throw new BadRequestException('Activity does not belong to this site or does not exist');
      }
      
      await this.cameraRepository.update({ uid: cameraUid }, { activity_uid: activityUid });
    } else {
      await this.cameraRepository.update({ uid: cameraUid }, { activity_uid: null });
    }

    return this.getAssignmentsForCamera(siteUid, cameraUid);
  }

  async assignCamerasToActivity(
    siteUid: string,
    activityUid: string,
    cameraUids: string[],
  ): Promise<void> {
    await this.findByUid(siteUid, activityUid);

    const uniqueCameraUids = [...new Set(cameraUids)];
    for (const cameraUid of uniqueCameraUids) {
      await this.assertCameraInSite(siteUid, cameraUid);
    }

    await this.cameraRepository.update(
      { site_uid: siteUid, activity_uid: activityUid },
      { activity_uid: null }
    );

    if (uniqueCameraUids.length > 0) {
      await this.cameraRepository.update(
        { uid: In(uniqueCameraUids) },
        { activity_uid: activityUid }
      );
    }
  }

  async buildEdgeActivitiesForCamera(cameraUid: string): Promise<
    Array<{
      activity_uid: string;
      code: string;
      name: string;
      ai_model: string;
      target_classes: string[];
      min_confidence: number;
      recording: {
        post_buffer_sec: number;
        max_segment_sec: number;
      };
    }>
  > {
    const camera = await this.cameraRepository.findOne({ where: { uid: cameraUid } });
    if (!camera || !camera.activity_uid) return [];
    
    const activity = await this.activityRepository.findOne({ where: { uid: camera.activity_uid, is_active: true } });
    if (!activity) return [];

    const recordingConfig =
      (activity.recording_config as Record<string, unknown>) ?? {};

    return [{
      activity_uid: activity.uid,
      code: activity.code,
      name: activity.name,
      ai_model: activity.ai_model,
      target_classes: activity.target_classes ?? [],
      min_confidence: activity.min_confidence ?? 0.5,
      recording: {
        post_buffer_sec: Number(recordingConfig.post_buffer_sec ?? 10),
        max_segment_sec: Number(recordingConfig.max_segment_sec ?? 300),
      },
    }];
  }

  private slugifyName(name: string): string {
    const slug = name
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 64);

    return slug || 'activity';
  }

  private async uniqueCodeForSite(
    siteUid: string,
    base: string,
  ): Promise<string> {
    let code = base;
    let suffix = 2;

    while (
      await this.activityRepository.findOne({
        where: { site_uid: siteUid, code },
      })
    ) {
      code = `${base}-${suffix}`;
      suffix += 1;
    }

    return code;
  }

  private normalizeAiModel(value: string): string {
    return value.trim().replace(/\.pt$/i, '');
  }

  private async assertCameraInSite(
    siteUid: string,
    cameraUid: string,
  ): Promise<Camera> {
    const camera = await this.cameraRepository.findOne({
      where: { uid: cameraUid, site_uid: siteUid },
    });
    if (!camera) {
      throw new NotFoundException(
        `Camera ${cameraUid} not found in site ${siteUid}`,
      );
    }
    return camera;
  }
}
