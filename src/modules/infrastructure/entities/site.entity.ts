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
import { User } from '../../users/entities/user.entity';
import { Camera } from './camera.entity';
import { Event } from '../../operations/entities/event.entity';
import { CreatedByUserExpose } from '../../../common/decorator/created-by-user.transform';

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

  @Column({ default: 'active' })
  status: string;

  @Column({ default: 'offline' })
  connection_status: string;

  @Column({ type: 'timestamptz', nullable: true })
  last_seen_at: Date | null;

  @Column({ nullable: true })
  timezone: string;

  @Column()
  team_uid: string;

  @Exclude({ toPlainOnly: true })
  @Column({ nullable: true })
  created_by: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  @CreatedByUserExpose()
  creator: User;

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
