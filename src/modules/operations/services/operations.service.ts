import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Event } from '../entities/event.entity';
import { Alert } from '../entities/alert.entity';
import { CreateEventDto } from '../dtos/create-event.dto';
import { CreateAlertDto } from '../dtos/create-alert.dto';
import { QueryPageSearchDto } from '../../../common/queryPaginateSearch.dto';
import {
  applyDateRange,
  buildPaginatedResult,
  PaginatedResult,
  resolvePagination,
} from '../../../common/utils/pagination.util';
import { MediaUrlService } from '../../../common/services/media-url.service';

const EVENT_SORT_FIELDS: Record<string, string> = {
  event_name: 'event.activity_type',
  camera: 'camera.name',
  timestamp: 'event.event_start',
  duration: 'event.duration_minutes',
  activity: 'event.activity_type',
};

const ALERT_SORT_FIELDS: Record<string, string> = {
  alert_name: 'alert.violation_name',
  timestamp: 'alert.detected_at',
  detections: 'alert.total_detections',
  status: 'alert.status',
};

@Injectable()
export class OperationsService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(Alert)
    private alertRepository: Repository<Alert>,
    private mediaUrlService: MediaUrlService,
  ) {}

  private applyEventMediaUrls(event: Event): Event {
    if (event.recording_url) {
      event.recording_url =
        this.mediaUrlService.toProxyUrl(event.recording_url) ??
        event.recording_url;
    }
    return event;
  }

  private applyAlertMediaUrls(alert: Alert): Alert {
    if (alert.image_url) {
      alert.image_url =
        this.mediaUrlService.toProxyUrl(alert.image_url) ?? alert.image_url;
    }
    if (alert.recording_event) {
      this.applyEventMediaUrls(alert.recording_event);
    }
    return alert;
  }

  async createRecordingEvent(data: CreateEventDto): Promise<Event> {
    const event = this.eventRepository.create({
      site_uid: data.site_uid,
      camera_uid: data.camera_uid,
      activity_type: data.activity_type ?? 'activity',
      event_end: data.event_end ? new Date(data.event_end) : undefined,
      event_start: new Date(data.event_start),
      duration_minutes: data.duration_minutes,
      recording_url: data.recording_url
        ? (this.mediaUrlService.normalize(data.recording_url) ??
          data.recording_url)
        : data.recording_url,
    });
    return this.eventRepository.save(event);
  }

  async findActivitiesBySite(
    siteUid: string,
    query: QueryPageSearchDto = new QueryPageSearchDto(),
  ): Promise<PaginatedResult<Event>> {
    const { skip, perPage } = resolvePagination(query);
    const params: Record<string, unknown> = { siteUid };
    const qb = this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.camera', 'camera')
      .where('event.site_uid = :siteUid', { siteUid });

    if (query.camera_uuid) {
      params.cameraUuid = query.camera_uuid;
      qb.andWhere('event.camera_uid = :cameraUuid', {
        cameraUuid: query.camera_uuid,
      });
    }

    for (const clause of applyDateRange('event.event_start', query, params)) {
      qb.andWhere(clause, params);
    }

    if (query.search?.trim()) {
      const search = `%${query.search.trim()}%`;
      qb.andWhere(
        new Brackets((expr) => {
          expr
            .where('event.activity_type ILIKE :search', { search })
            .orWhere('camera.name ILIKE :search', { search });
        }),
      );
    }

    const sortColumn =
      EVENT_SORT_FIELDS[query.sort_by ?? 'timestamp'] ?? 'event.event_start';
    const sortDirection = query.sort_order === 'asc' ? 'ASC' : 'DESC';
    qb.orderBy(sortColumn, sortDirection).addOrderBy('event.event_id', 'DESC');

    const totalItems = await qb.getCount();
    const items = (await qb.skip(skip).take(perPage).getMany()).map((event) =>
      this.applyEventMediaUrls(event),
    );

    return buildPaginatedResult(items, totalItems, query);
  }

  async findLiveActivitiesBySite(siteUid: string) {
    const events = await this.eventRepository
      .createQueryBuilder('event')
      .where('event.site_uid = :siteUid', { siteUid })
      .distinctOn(['event.activity_type'])
      .orderBy('event.activity_type', 'ASC')
      .addOrderBy('event.event_start', 'DESC')
      .getMany();

    return events
      .map((event) => ({
        activity_uid: event.activity_type,
        activity_name: event.activity_type,
        last_activity_timestamp: event.event_start,
        currently_active: event.event_end == null,
      }))
      .sort(
        (a, b) =>
          new Date(b.last_activity_timestamp).getTime() -
          new Date(a.last_activity_timestamp).getTime(),
      );
  }

  async createAlert(data: CreateAlertDto): Promise<Alert> {
    const alert = this.alertRepository.create({
      ...data,
      detected_at: new Date(data.detected_at),
      image_url: data.image_url
        ? (this.mediaUrlService.normalize(data.image_url) ?? data.image_url)
        : data.image_url,
      severity: data.severity ?? 'high',
    });
    return this.alertRepository.save(alert);
  }

  async findAlertsBySite(
    siteUid: string,
    query: QueryPageSearchDto = new QueryPageSearchDto(),
  ): Promise<PaginatedResult<Alert>> {
    const { skip, perPage } = resolvePagination(query);
    const params: Record<string, unknown> = { siteUid };
    const qb = this.alertRepository
      .createQueryBuilder('alert')
      .leftJoinAndSelect('alert.camera', 'camera')
      .leftJoinAndSelect('alert.recording_event', 'recording_event')
      .where('camera.site_uid = :siteUid', { siteUid });

    if (query.camera_uuid) {
      params.cameraUuid = query.camera_uuid;
      qb.andWhere('alert.camera_uid = :cameraUuid', {
        cameraUuid: query.camera_uuid,
      });
    }

    for (const clause of applyDateRange('alert.detected_at', query, params)) {
      qb.andWhere(clause, params);
    }

    if (query.search?.trim()) {
      const search = `%${query.search.trim()}%`;
      qb.andWhere(
        new Brackets((expr) => {
          expr
            .where('alert.violation_name ILIKE :search', { search })
            .orWhere('camera.name ILIKE :search', { search });
        }),
      );
    }

    const sortColumn =
      ALERT_SORT_FIELDS[query.sort_by ?? 'timestamp'] ?? 'alert.detected_at';
    const sortDirection = query.sort_order === 'asc' ? 'ASC' : 'DESC';
    qb.orderBy(sortColumn, sortDirection).addOrderBy('alert.alert_id', 'DESC');

    const totalItems = await qb.getCount();
    const items = (await qb.skip(skip).take(perPage).getMany()).map((alert) =>
      this.applyAlertMediaUrls(alert),
    );

    return buildPaginatedResult(items, totalItems, query);
  }

  async findAlertsSummaryBySite(siteUid: string) {
    const alerts = await this.alertRepository
      .createQueryBuilder('alert')
      .leftJoin('alert.camera', 'camera')
      .where('camera.site_uid = :siteUid', { siteUid })
      .select(['alert.status'])
      .getMany();
    const statusCounts = {
      not_resolved: 0,
      resolved: 0,
      false_alarm: 0,
    };

    for (const alert of alerts) {
      const key = alert.status?.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (key === 'not_resolved' || key === 'notresolved') {
        statusCounts.not_resolved += 1;
      } else if (key === 'resolved') {
        statusCounts.resolved += 1;
      } else if (key === 'false_alarm' || key === 'falsealarm') {
        statusCounts.false_alarm += 1;
      }
    }

    return {
      total_alerts: alerts.length,
      status_counts: statusCounts,
    };
  }

  async updateAlertById(
    alertId: string,
    status: string,
    comment?: string,
  ): Promise<Alert> {
    const alert = await this.alertRepository.findOne({
      where: { alert_id: alertId },
    });
    if (!alert) {
      throw new NotFoundException(`Alert ${alertId} not found`);
    }
    alert.status = status;
    if (comment !== undefined) {
      alert.comment = comment;
    }
    const saved = await this.alertRepository.save(alert);
    return this.applyAlertMediaUrls(saved);
  }
}
