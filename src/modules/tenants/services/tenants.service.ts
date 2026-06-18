import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Organization } from '../entities/organization.entity';
import { Account } from '../entities/account.entity';
import { Team } from '../entities/team.entity';
import { CreateOrganizationDto } from '../dtos/create-organization.dto';
import { CreateAccountDto } from '../dtos/create-account.dto';
import { CreateTeamDto } from '../dtos/create-team.dto';
import { UpdateOrganizationDto } from '../dtos/update-organization.dto';
import { UpdateAccountDto } from '../dtos/update-account.dto';
import { UpdateTeamDto } from '../dtos/update-team.dto';
import { AuthorizationService } from '../../users/services/authorization.service';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Organization)
    private orgRepository: Repository<Organization>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    private authorizationService: AuthorizationService,
  ) {}

  async createOrganization(
    data: CreateOrganizationDto,
    userUid: string,
  ): Promise<Organization> {
    const org = this.orgRepository.create({
      ...data,
      created_by: userUid,
    });
    const saved = await this.orgRepository.save(org);
    await this.authorizationService.createOwnerMembership(userUid, {
      organization_uid: saved.uid,
    });
    return saved;
  }

  async findAllOrganizations(userUid: string): Promise<Organization[]> {
    const uids = await this.authorizationService.getAccessibleOrganizationUids(
      userUid,
    );
    if (uids.length === 0) {
      return [];
    }
    return this.orgRepository.find({ where: { uid: In(uids) } });
  }

  async findOrganizationByUid(
    uid: string,
    userUid: string,
  ): Promise<Organization | null> {
    await this.authorizationService.assertCanReadOrganization(userUid, uid);
    return this.orgRepository.findOne({
      where: { uid },
      relations: { accounts: true },
    });
  }

  async updateOrganization(
    uid: string,
    data: UpdateOrganizationDto,
    userUid: string,
  ): Promise<Organization> {
    await this.authorizationService.assertCanWriteOrganization(userUid, uid);
    const org = await this.orgRepository.findOne({ where: { uid } });
    if (!org) {
      throw new NotFoundException(`Organization with UID ${uid} not found`);
    }
    const {
      uid: _uid,
      created_at: _createdAt,
      updated_at: _updatedAt,
      created_by: _createdBy,
      description: _description,
      ...writable
    } = data as UpdateOrganizationDto & {
      uid?: string;
      created_at?: Date;
      updated_at?: Date;
      created_by?: string;
      description?: string;
    };
    Object.assign(org, writable);
    return this.orgRepository.save(org);
  }

  async removeOrganization(uid: string, userUid: string): Promise<void> {
    await this.authorizationService.assertCanWriteOrganization(userUid, uid);
    const result = await this.orgRepository.delete(uid);
    if (result.affected === 0) {
      throw new NotFoundException(`Organization with UID ${uid} not found`);
    }
  }

  async createAccount(
    data: CreateAccountDto,
    userUid: string,
  ): Promise<Account> {
    if (!data.organization_uid) {
      throw new NotFoundException('organization_uid is required');
    }
    await this.authorizationService.assertCanWriteOrganization(
      userUid,
      data.organization_uid,
    );
    const account = this.accountRepository.create(data);
    return this.accountRepository.save(account);
  }

  async findAccountsByOrg(
    orgUid: string,
    userUid: string,
  ): Promise<Account[]> {
    await this.authorizationService.assertCanReadOrganization(userUid, orgUid);
    const accessibleAccountUids =
      await this.authorizationService.getAccessibleAccountUids(userUid, orgUid);
    if (accessibleAccountUids.length === 0) {
      return [];
    }
    return this.accountRepository.find({
      where: { uid: In(accessibleAccountUids) },
      relations: { teams: true },
    });
  }

  async findAccountByUid(
    uid: string,
    userUid: string,
  ): Promise<Account | null> {
    await this.authorizationService.assertCanReadAccount(userUid, uid);
    return this.accountRepository.findOne({ where: { uid } });
  }

  async updateAccount(
    uid: string,
    data: UpdateAccountDto,
    userUid: string,
  ): Promise<Account> {
    await this.authorizationService.assertCanWriteAccount(userUid, uid);
    const account = await this.accountRepository.findOne({ where: { uid } });
    if (!account) {
      throw new NotFoundException(`Account with UID ${uid} not found`);
    }
    Object.assign(account, data);
    return this.accountRepository.save(account);
  }

  async removeAccount(uid: string, userUid: string): Promise<void> {
    await this.authorizationService.assertCanWriteAccount(userUid, uid);
    const result = await this.accountRepository.delete(uid);
    if (result.affected === 0) {
      throw new NotFoundException(`Account with UID ${uid} not found`);
    }
  }

  async createTeam(data: CreateTeamDto, userUid: string): Promise<Team> {
    if (!data.account_uid) {
      throw new NotFoundException('account_uid is required');
    }
    await this.authorizationService.assertCanWriteAccount(
      userUid,
      data.account_uid,
    );
    const team = this.teamRepository.create({
      ...data,
      created_by: userUid,
    });
    return this.teamRepository.save(team);
  }

  async findTeamsByAccount(
    accountUid: string,
    userUid: string,
  ): Promise<Team[]> {
    await this.authorizationService.assertCanReadAccount(userUid, accountUid);
    const accessibleTeamUids =
      await this.authorizationService.getAccessibleTeamUids(userUid, accountUid);
    if (accessibleTeamUids.length === 0) {
      return [];
    }
    return this.teamRepository.find({
      where: { uid: In(accessibleTeamUids) },
      relations: { sites: true },
    });
  }

  async findTeamByUid(uid: string, userUid: string): Promise<Team | null> {
    await this.authorizationService.assertCanReadTeam(userUid, uid);
    return this.teamRepository.findOne({ where: { uid } });
  }

  async updateTeam(
    uid: string,
    data: UpdateTeamDto,
    userUid: string,
  ): Promise<Team> {
    await this.authorizationService.assertCanWriteTeam(userUid, uid);
    const team = await this.teamRepository.findOne({ where: { uid } });
    if (!team) {
      throw new NotFoundException(`Team with UID ${uid} not found`);
    }
    Object.assign(team, data);
    return this.teamRepository.save(team);
  }

  async removeTeam(uid: string, userUid: string): Promise<void> {
    await this.authorizationService.assertCanWriteTeam(userUid, uid);
    const result = await this.teamRepository.delete(uid);
    if (result.affected === 0) {
      throw new NotFoundException(`Team with UID ${uid} not found`);
    }
  }
}
