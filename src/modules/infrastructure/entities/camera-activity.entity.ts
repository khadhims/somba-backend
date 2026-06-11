import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Camera } from './camera.entity';
import { Activity } from './activity.entity';

@Entity('camera_activities')
@Unique(['camera_uid', 'activity_uid'])
export class CameraActivity {
  @PrimaryGeneratedColumn('uuid')
  uid: string;

  @Column()
  camera_uid: string;

  @Column()
  activity_uid: string;

  @Column({ default: true })
  enabled: boolean;

  @ManyToOne(() => Camera, (camera) => camera.activity_assignments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'camera_uid' })
  camera: Camera;

  @ManyToOne(() => Activity, (activity) => activity.camera_assignments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'activity_uid' })
  activity: Activity;
}
