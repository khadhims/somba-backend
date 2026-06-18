import { Exclude } from 'class-transformer';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Account } from './account.entity';
import { Membership } from '../../users/entities/membership.entity';
import { User } from '../../users/entities/user.entity';
import { CreatedByUserExpose } from '../../../common/decorator/created-by-user.transform';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  uid: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  legalName: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  country: string;

  @Column({ default: 'active' })
  status: string; // active | inactive

  @Exclude({ toPlainOnly: true })
  @Column({ nullable: true })
  created_by: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  @CreatedByUserExpose()
  creator: User;

  @OneToMany(() => Account, (account) => account.organization)
  accounts: Account[];

  @OneToMany(() => Membership, (membership) => membership.organization)
  memberships: Membership[];

  @CreateDateColumn()
  created_at: Date;
}
