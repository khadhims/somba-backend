import { Exclude } from 'class-transformer';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Team } from '../../tenants/entities/team.entity';
import { Camera } from './camera.entity';
import { Event } from '../../operations/entities/event.entity';

@Entity('sites')
export class Site {
  @PrimaryGeneratedColumn('uuid')
  uid: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  address: string;

  @Exclude()
  @Column({ unique: true })
  api_key_hash: string;

  @Column({ default: 'offline' })
  status: string;

  @Column({ type: 'timestamptz', nullable: true })
  last_seen_at: Date | null;

  @Column({ default: true })
  is_active: boolean;

  @Column({ nullable: true })
  timezone: string;

  @Column()
  team_uid: string;

  @ManyToOne(() => Team, (team) => team.sites)
  @JoinColumn({ name: 'team_uid' })
  team: Team;

  @OneToMany(() => Camera, (camera) => camera.site)
  cameras: Camera[];

  @OneToMany(() => Event, (event) => event.site)
  events: Event[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export type SiteWithOneTimeApiKey = Site & { api_key: string };
