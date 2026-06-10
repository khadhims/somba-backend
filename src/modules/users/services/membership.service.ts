import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Membership } from '../entities/membership.entity';
import { CreateMembershipDto } from '../dtos/create-membership.dto';
import { UpdateMembershipDto } from '../dtos/update-membership.dto';
import { UsersService } from './users.service';

@Injectable()
export class MembershipService {
  constructor(
    @InjectRepository(Membership)
    private membershipRepository: Repository<Membership>,
    private usersService: UsersService,
  ) {}

  async create(data: CreateMembershipDto): Promise<Membership> {
    let userUid = data.user_uid;

    if (!userUid && data.email) {
      const user = await this.usersService.findByEmail(data.email);
      if (!user) {
        throw new NotFoundException(`User with email ${data.email} not found`);
      }
      userUid = user.uid;
    }

    if (!userUid) {
      throw new BadRequestException('email or user_uid is required');
    }

    const membership = this.membershipRepository.create({
      user_uid: userUid,
      organization_uid: data.organization_uid,
      account_uid: data.account_uid,
      team_uid: data.team_uid,
      role: data.role,
    });
    return this.membershipRepository.save(membership);
  }

  async findByOrganization(orgUid: string): Promise<Membership[]> {
    return this.membershipRepository.find({
      where: { organization_uid: orgUid },
      relations: { user: true },
    });
  }

  async findByAccount(accountUid: string): Promise<Membership[]> {
    return this.membershipRepository.find({
      where: { account_uid: accountUid },
      relations: { user: true },
    });
  }

  async findByTeam(teamUid: string): Promise<Membership[]> {
    return this.membershipRepository.find({
      where: { team_uid: teamUid },
      relations: { user: true },
    });
  }

  async findByUser(userUid: string): Promise<Membership[]> {
    return this.membershipRepository.find({
      where: { user_uid: userUid },
      relations: {
        organization: true,
        account: true,
        team: true,
      },
    });
  }

  async findOne(uid: string): Promise<Membership | null> {
    return this.membershipRepository.findOne({ where: { uid } });
  }

  async update(uid: string, data: UpdateMembershipDto): Promise<Membership> {
    const membership = await this.findOne(uid);
    if (!membership)
      throw new NotFoundException(`Membership with UID ${uid} not found`);
    Object.assign(membership, data);
    return this.membershipRepository.save(membership);
  }

  async remove(uid: string): Promise<void> {
    const result = await this.membershipRepository.delete(uid);
    if (result.affected === 0)
      throw new NotFoundException(`Membership with UID ${uid} not found`);
  }
}
