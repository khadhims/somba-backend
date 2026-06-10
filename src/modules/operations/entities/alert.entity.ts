import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Event } from './event.entity';
import { Camera } from '../../infrastructure/entities/camera.entity';

@Entity('alerts')
export class Alert {
  @PrimaryGeneratedColumn('uuid')
  alert_id: string;

  @Column()
  event_id: string;

  @OneToOne(() => Event, (event) => event.alert)
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column()
  camera_uid: string;

  @ManyToOne(() => Camera, (camera) => camera.alerts)
  @JoinColumn({ name: 'camera_uid' })
  camera: Camera;

  @Column()
  violation_name: string;

  @Column({ default: 'notResolved' })
  status: string; // notResolved | resolved | falseAlarm

  @Column({ nullable: true })
  image_url: string;

  @Column({ nullable: true })
  comment: string;

  @Column({ default: 0 })
  total_detections: number;
}
