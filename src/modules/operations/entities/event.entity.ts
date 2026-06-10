import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Site } from '../../infrastructure/entities/site.entity';
import { Camera } from '../../infrastructure/entities/camera.entity';
import { Alert } from './alert.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  event_id: string;

  @Column()
  site_uid: string;

  @ManyToOne(() => Site, (site) => site.events)
  @JoinColumn({ name: 'site_uid' })
  site: Site;

  @Column()
  camera_uid: string;

  @ManyToOne(() => Camera, (camera) => camera.events)
  @JoinColumn({ name: 'camera_uid' })
  camera: Camera;

  @Column()
  event_name: string;

  @Column({ default: 'low' })
  severity: string; // low | medium | high | critical

  @Column()
  event_start: Date;

  @Column({ nullable: true })
  event_end: Date;

  @Column({ nullable: true })
  duration_minutes: number;

  @OneToOne(() => Alert, (alert) => alert.event)
  alert: Alert;
}
