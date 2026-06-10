import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Organization } from '../../tenants/entities/organization.entity';
import { Account } from '../../tenants/entities/account.entity';
import { Team } from '../../tenants/entities/team.entity';

@Entity('memberships')
export class Membership {
  @PrimaryGeneratedColumn('uuid')
  uid: string;

  @Column()
  user_uid: string;

  @ManyToOne(() => User, (user) => user.memberships)
  @JoinColumn({ name: 'user_uid' })
  user: User;

  @Column({ nullable: true })
  organization_uid: string;

  @ManyToOne(() => Organization, (org) => org.memberships, { nullable: true })
  @JoinColumn({ name: 'organization_uid' })
  organization: Organization;

  @Column({ nullable: true })
  account_uid: string;

  @ManyToOne(() => Account, (acc) => acc.memberships, { nullable: true })
  @JoinColumn({ name: 'account_uid' })
  account: Account;

  @Column({ nullable: true })
  team_uid: string;

  @ManyToOne(() => Team, (team) => team.memberships, { nullable: true })
  @JoinColumn({ name: 'team_uid' })
  team: Team;

  @Column()
  role: string; // Admin, Viewer, etc.

  @CreateDateColumn()
  joined_at: Date;
}
