import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Organization } from './organization.entity';
import { Team } from './team.entity';
import { Membership } from '../../users/entities/membership.entity';

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn('uuid')
  uid: string;

  @Column()
  name: string;

  @Column()
  organization_uid: string;

  @ManyToOne(() => Organization, (organization) => organization.accounts)
  @JoinColumn({ name: 'organization_uid' })
  organization: Organization;

  @OneToMany(() => Team, (team) => team.account)
  teams: Team[];

  @OneToMany(() => Membership, (membership) => membership.account)
  memberships: Membership[];

  @CreateDateColumn()
  created_at: Date;
}
