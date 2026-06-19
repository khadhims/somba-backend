import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Site } from '../../infrastructure/entities/site.entity';
import { Camera } from '../../infrastructure/entities/camera.entity';

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

  @Column({ default: 'activity' })
  activity_type: string;

  @Column()
  event_start: Date;

  @Column({ nullable: true })
  event_end: Date;

  @Column({ type: 'float', nullable: true })
  duration_minutes: number;

  @Column({ nullable: true })
  recording_url: string;
}
