import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Membership } from './membership.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  uid: string;

  @Column({ unique: true })
  email: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ select: false })
  @Exclude()
  password_hash: string;

  @OneToMany(() => Membership, (membership) => membership.user)
  memberships: Membership[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
