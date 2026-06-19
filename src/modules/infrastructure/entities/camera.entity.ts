import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Site } from './site.entity';
import { Event } from '../../operations/entities/event.entity';
import { Alert } from '../../operations/entities/alert.entity';

@Entity('cameras')
export class Camera {
  @PrimaryGeneratedColumn('uuid')
  uid: string;

  @Column()
  name: string;

  @Column()
  site_uid: string;

  @ManyToOne(() => Site, (site) => site.cameras)
  @JoinColumn({ name: 'site_uid' })
  site: Site;

  @Column({ nullable: true })
  activity: string | null;

  @Column({ default: false })
  alert: boolean;

  @Column({ nullable: true })
  room: string;

  /** RTSP source — referensi; dikonfigurasi manual di go2rtc.yaml di edge */
  @Column({ nullable: true })
  rtsp_url: string;

  /** URL HLS (.m3u8) dari go2rtc — dipakai langsung oleh Web UI */
  @Column({ nullable: true })
  stream_url: string;

  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true })
  model: string;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true })
  cam_resolution: string;

  @Column({ nullable: true })
  channels: number;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'simple-json', nullable: true })
  camera_config: Record<string, unknown>;

  @Column({ default: 'online' })
  status: string;

  @OneToMany(() => Event, (event) => event.camera)
  events: Event[];

  @OneToMany(() => Alert, (alert) => alert.camera)
  alerts: Alert[];
}
