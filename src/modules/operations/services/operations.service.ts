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

  // Events
  async createEvent(data: CreateEventDto): Promise<Event> {
    const event = this.eventRepository.create({
      ...data,
      event_start: new Date(data.event_start),
    });
    return this.eventRepository.save(event);
  }

  async findEventsBySite(siteUid: string): Promise<Event[]> {
    return this.eventRepository.find({
      where: { site_uid: siteUid },
      relations: { camera: true, alert: true },
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
      activity_name: event.event_name,
      last_activity_timestamp: event.event_start,
      currently_active: !event.event_end,
    }));
  }

  // Alerts
  async createAlert(data: CreateAlertDto): Promise<Alert> {
    const alert = this.alertRepository.create(data);
    return this.alertRepository.save(alert);
  }

  async findAlertsBySite(siteUid: string): Promise<Alert[]> {
    return this.alertRepository.find({
      where: { camera: { site_uid: siteUid } },
      relations: { event: true, camera: true },
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

  async updateAlertByEventId(
    eventId: string,
    status: string,
    comment?: string,
  ): Promise<Alert> {
    const alert = await this.alertRepository.findOne({
      where: { event_id: eventId },
    });
    if (!alert) {
      throw new NotFoundException(`Alert for event ${eventId} not found`);
    }
    alert.status = status;
    if (comment !== undefined) {
      alert.comment = comment;
    }
    return this.alertRepository.save(alert);
  }

  async updateAlertStatus(
    alertId: string,
    status: string,
    comment?: string,
  ): Promise<Alert | null> {
    return this.updateAlertByEventId(alertId, status, comment);
  }
}
