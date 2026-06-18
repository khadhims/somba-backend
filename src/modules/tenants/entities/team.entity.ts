import { Exclude } from 'class-transformer';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Account } from './account.entity';
import { Membership } from '../../users/entities/membership.entity';
import { Site } from '../../infrastructure/entities/site.entity';
import { User } from '../../users/entities/user.entity';
import { CreatedByUserExpose } from '../../../common/decorator/created-by-user.transform';

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn('uuid')
  uid: string;

  @Column()
  name: string;

  @Column()
  account_uid: string;

  @Exclude({ toPlainOnly: true })
  @Column({ nullable: true })
  created_by: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  @CreatedByUserExpose()
  creator: User;

  @ManyToOne(() => Account, (account) => account.teams)
  @JoinColumn({ name: 'account_uid' })
  account: Account;

  @OneToMany(() => Membership, (membership) => membership.team)
  memberships: Membership[];

  @OneToMany(() => Site, (site) => site.team)
  sites: Site[];

  @CreateDateColumn()
  created_at: Date;
}
