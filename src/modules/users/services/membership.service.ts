import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Membership } from '../entities/membership.entity';
import { CreateMembershipDto } from '../dtos/create-membership.dto';
import { UpdateMembershipDto } from '../dtos/update-membership.dto';
import { UsersService } from './users.service';
import { AuthorizationService } from './authorization.service';
import {
  INVITABLE_MEMBERSHIP_ROLES,
  MembershipRole,
} from '../../../common/constants/membership-role.enum';

@Injectable()
export class MembershipService {
  constructor(
    @InjectRepository(Membership)
    private membershipRepository: Repository<Membership>,
    private usersService: UsersService,
    private authorizationService: AuthorizationService,
  ) {}

  async create(
    data: CreateMembershipDto,
    requesterUid: string,
  ): Promise<Membership> {
    await this.authorizationService.assertCanManageMembers(requesterUid, {
      organization_uid: data.organization_uid,
      account_uid: data.account_uid,
      team_uid: data.team_uid,
    });

    if (!INVITABLE_MEMBERSHIP_ROLES.includes(data.role)) {
      throw new BadRequestException(
        'Only ADMIN or VIEWER roles can be assigned when inviting members',
      );
    }

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

  async findByOrganization(
    orgUid: string,
    requesterUid: string,
  ): Promise<Membership[]> {
    await this.authorizationService.assertCanReadOrganization(
      requesterUid,
      orgUid,
    );
    return this.membershipRepository.find({
      where: { organization_uid: orgUid },
      relations: { user: true },
    });
  }

  async findByAccount(
    accountUid: string,
    requesterUid: string,
  ): Promise<Membership[]> {
    await this.authorizationService.assertCanReadAccount(requesterUid, accountUid);
    return this.membershipRepository.find({
      where: { account_uid: accountUid },
      relations: { user: true },
    });
  }

  async findByTeam(teamUid: string, requesterUid: string): Promise<Membership[]> {
    await this.authorizationService.assertCanReadTeam(requesterUid, teamUid);
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

  async update(
    uid: string,
    data: UpdateMembershipDto,
    requesterUid: string,
  ): Promise<Membership> {
    const membership = await this.findOne(uid);
    if (!membership) {
      throw new NotFoundException(`Membership with UID ${uid} not found`);
    }

    if (membership.role === MembershipRole.OWNER) {
      throw new ForbiddenException('Owner membership cannot be modified');
    }

    if (
      data.role &&
      !INVITABLE_MEMBERSHIP_ROLES.includes(data.role)
    ) {
      throw new BadRequestException(
        'Only ADMIN or VIEWER roles can be assigned to members',
      );
    }

    await this.authorizationService.assertCanManageMembers(requesterUid, {
      organization_uid: membership.organization_uid,
      account_uid: membership.account_uid,
      team_uid: membership.team_uid,
    });

    Object.assign(membership, data);
    return this.membershipRepository.save(membership);
  }

  async remove(uid: string, requesterUid: string): Promise<void> {
    const membership = await this.findOne(uid);
    if (!membership) {
      throw new NotFoundException(`Membership with UID ${uid} not found`);
    }

    if (membership.role === MembershipRole.OWNER) {
      throw new ForbiddenException('Owner membership cannot be removed');
    }

    await this.authorizationService.assertCanManageMembers(requesterUid, {
      organization_uid: membership.organization_uid,
      account_uid: membership.account_uid,
      team_uid: membership.team_uid,
    });

    const result = await this.membershipRepository.delete(uid);
    if (result.affected === 0) {
      throw new NotFoundException(`Membership with UID ${uid} not found`);
    }
  }
}
