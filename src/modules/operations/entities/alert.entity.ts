import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Event } from './event.entity';
import { Camera } from '../../infrastructure/entities/camera.entity';

@Entity('alerts')
export class Alert {
  @PrimaryGeneratedColumn('uuid')
  alert_id: string;

  @Column({ nullable: true })
  recording_event_id: string;

  @ManyToOne(() => Event, { nullable: true })
  @JoinColumn({ name: 'recording_event_id' })
  recording_event: Event;

  @Column()
  camera_uid: string;

  @ManyToOne(() => Camera, (camera) => camera.alerts)
  @JoinColumn({ name: 'camera_uid' })
  camera: Camera;

  @Column()
  violation_name: string;

  @Column({ default: 'high' })
  severity: string;

  @Column({ default: 'notResolved' })
  status: string;

  @Column({ nullable: true })
  image_url: string;

  @Column({ nullable: true })
  comment: string;

  @Column({ type: 'json', nullable: true })
  bbox: number[];

  @Column({ default: 0 })
  total_detections: number;

  @Column({ type: 'timestamptz' })
  detected_at: Date;
}
