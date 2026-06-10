import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
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
  code: string;

  @Column({ nullable: true })
  address: string;

  @Column({ type: 'float', nullable: true })
  latitude: number;

  @Column({ type: 'float', nullable: true })
  longitude: number;

  @Column({ nullable: true })
  contact_person: string;

  @Column({ nullable: true })
  contact_phone: string;

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
}
