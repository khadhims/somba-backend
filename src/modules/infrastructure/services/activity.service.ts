import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Activity } from '../entities/activity.entity';
import { CameraActivity } from '../entities/camera-activity.entity';
import { Camera } from '../entities/camera.entity';
import { CreateActivityDto } from '../dtos/create-activity.dto';
import { UpdateActivityDto } from '../dtos/update-activity.dto';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
    @InjectRepository(CameraActivity)
    private cameraActivityRepository: Repository<CameraActivity>,
    @InjectRepository(Camera)
    private cameraRepository: Repository<Camera>,
  ) {}

  async findBySite(siteUid: string): Promise<Activity[]> {
    return this.activityRepository.find({
      where: { site_uid: siteUid },
      order: { name: 'ASC' },
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
    const existing = await this.activityRepository.findOne({
      where: { site_uid: siteUid, code: data.code },
    });
    if (existing) {
      throw new BadRequestException(
        `Activity code "${data.code}" already exists for this site`,
      );
    }

    const activity = this.activityRepository.create({
      ...data,
      site_uid: siteUid,
      min_confidence: data.min_confidence ?? 0.5,
      recording_config: data.recording_config ?? {
        post_buffer_sec: 10,
        max_segment_sec: 300,
      },
      is_active: data.is_active ?? true,
    });
    return this.activityRepository.save(activity);
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

    Object.assign(activity, data);
    return this.activityRepository.save(activity);
  }

  async remove(siteUid: string, activityUid: string): Promise<void> {
    const activity = await this.findByUid(siteUid, activityUid);
    await this.activityRepository.remove(activity);
  }

  async getAssignmentsForCamera(
    siteUid: string,
    cameraUid: string,
  ): Promise<Activity[]> {
    await this.assertCameraInSite(siteUid, cameraUid);

    const assignments = await this.cameraActivityRepository.find({
      where: { camera_uid: cameraUid, enabled: true },
      relations: { activity: true },
    });

    return assignments
      .map((assignment) => assignment.activity)
      .filter((activity) => activity.is_active);
  }

  async listAssignmentsForCamera(siteUid: string, cameraUid: string) {
    await this.assertCameraInSite(siteUid, cameraUid);

    return this.cameraActivityRepository.find({
      where: { camera_uid: cameraUid },
      relations: { activity: true },
      order: { activity: { name: 'ASC' } },
    });
  }

  async assignActivitiesToCamera(
    siteUid: string,
    cameraUid: string,
    activityUids: string[],
  ): Promise<Activity[]> {
    await this.assertCameraInSite(siteUid, cameraUid);

    const uniqueUids = [...new Set(activityUids)];
    if (uniqueUids.length > 0) {
      const activities = await this.activityRepository.find({
        where: { uid: In(uniqueUids), site_uid: siteUid },
      });
      if (activities.length !== uniqueUids.length) {
        throw new BadRequestException(
          'One or more activities do not belong to this site',
        );
      }
    }

    await this.cameraActivityRepository.delete({ camera_uid: cameraUid });

    if (uniqueUids.length > 0) {
      const rows = uniqueUids.map((activityUid) =>
        this.cameraActivityRepository.create({
          camera_uid: cameraUid,
          activity_uid: activityUid,
          enabled: true,
        }),
      );
      await this.cameraActivityRepository.save(rows);
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

    await this.cameraActivityRepository.delete({ activity_uid: activityUid });

    if (uniqueCameraUids.length > 0) {
      const rows = uniqueCameraUids.map((cameraUid) =>
        this.cameraActivityRepository.create({
          camera_uid: cameraUid,
          activity_uid: activityUid,
          enabled: true,
        }),
      );
      await this.cameraActivityRepository.save(rows);
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
    const assignments = await this.cameraActivityRepository.find({
      where: { camera_uid: cameraUid, enabled: true },
      relations: { activity: true },
    });

    return assignments
      .filter((assignment) => assignment.activity?.is_active)
      .map((assignment) => {
        const activity = assignment.activity;
        const recordingConfig =
          (activity.recording_config as Record<string, unknown>) ?? {};

        return {
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
        };
      });
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
