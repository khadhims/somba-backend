import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Site } from './site.entity';
import { CameraActivity } from './camera-activity.entity';

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  uid: string;

  @Column()
  site_uid: string;

  @ManyToOne(() => Site)
  @JoinColumn({ name: 'site_uid' })
  site: Site;

  @Column()
  code: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  ai_model: string;

  @Column({ type: 'simple-json' })
  target_classes: string[];

  @Column({ type: 'float', default: 0.5 })
  min_confidence: number;

  @Column({ type: 'simple-json', nullable: true })
  recording_config: Record<string, unknown>;

  @Column({ default: true })
  is_active: boolean;

  @OneToMany(() => CameraActivity, (assignment) => assignment.activity)
  camera_assignments: CameraActivity[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
