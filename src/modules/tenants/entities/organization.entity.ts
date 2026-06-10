import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Account } from './account.entity';
import { Membership } from '../../users/entities/membership.entity';

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

  @OneToMany(() => Account, (account) => account.organization)
  accounts: Account[];

  @OneToMany(() => Membership, (membership) => membership.organization)
  memberships: Membership[];

  @CreateDateColumn()
  created_at: Date;
}
