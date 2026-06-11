import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../entities/event.entity';
import { Alert } from '../entities/alert.entity';
import { CreateEventDto } from '../dtos/create-event.dto';
import { CreateAlertDto } from '../dtos/create-alert.dto';

@Injectable()
export class OperationsService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(Alert)
    private alertRepository: Repository<Alert>,
  ) {}

  async createRecordingEvent(data: CreateEventDto): Promise<Event> {
    const event = this.eventRepository.create({
      site_uid: data.site_uid,
      camera_uid: data.camera_uid,
      activity_uid: data.activity_uid,
      activity_type: data.activity_type ?? 'activity',
      event_start: new Date(data.event_start),
      event_end: data.event_end ? new Date(data.event_end) : undefined,
      duration_minutes: data.duration_minutes,
      recording_url: data.recording_url,
    });
    return this.eventRepository.save(event);
  }

  async findEventsBySite(siteUid: string): Promise<Event[]> {
    return this.eventRepository.find({
      where: { site_uid: siteUid },
      relations: { camera: true, activity: true },
      order: { event_start: 'DESC' },
    });
  }

  async findActivitiesBySite(siteUid: string): Promise<Event[]> {
    return this.findEventsBySite(siteUid);
  }

  async findLiveActivitiesBySite(siteUid: string) {
    const events = await this.eventRepository.find({
      where: { site_uid: siteUid },
      order: { event_start: 'DESC' },
      take: 20,
    });

    return events.map((event) => ({
      activity_uid: event.event_id,
      activity_name: event.activity_type,
      last_activity_timestamp: event.event_start,
      currently_active: !event.event_end,
    }));
  }

  async createAlert(data: CreateAlertDto): Promise<Alert> {
    const alert = this.alertRepository.create({
      ...data,
      detected_at: new Date(data.detected_at),
      severity: data.severity ?? 'high',
    });
    return this.alertRepository.save(alert);
  }

  async findAlertsBySite(siteUid: string): Promise<Alert[]> {
    return this.alertRepository.find({
      where: { camera: { site_uid: siteUid } },
      relations: { recording_event: true, camera: true },
      order: { detected_at: 'DESC' },
    });
  }

  async findAlertsSummaryBySite(siteUid: string) {
    const alerts = await this.findAlertsBySite(siteUid);
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
    return this.alertRepository.save(alert);
  }

  async updateAlertByEventId(
    alertId: string,
    status: string,
    comment?: string,
  ): Promise<Alert | null> {
    return this.updateAlertById(alertId, status, comment);
  }
}
