import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../entities/organization.entity';
import { Account } from '../entities/account.entity';
import { Team } from '../entities/team.entity';
import { CreateOrganizationDto } from '../dtos/create-organization.dto';
import { CreateAccountDto } from '../dtos/create-account.dto';
import { CreateTeamDto } from '../dtos/create-team.dto';
import { UpdateOrganizationDto } from '../dtos/update-organization.dto';
import { UpdateAccountDto } from '../dtos/update-account.dto';
import { UpdateTeamDto } from '../dtos/update-team.dto';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Organization)
    private orgRepository: Repository<Organization>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
  ) {}

  // Organizations
  async createOrganization(data: CreateOrganizationDto): Promise<Organization> {
    const org = this.orgRepository.create(data);
    return this.orgRepository.save(org);
  }

  async findAllOrganizations(): Promise<Organization[]> {
    return this.orgRepository.find();
  }

  async findOrganizationByUid(uid: string): Promise<Organization | null> {
    return this.orgRepository.findOne({
      where: { uid },
      relations: { accounts: true },
    });
  }

  async updateOrganization(
    uid: string,
    data: UpdateOrganizationDto,
  ): Promise<Organization> {
    const org = await this.findOrganizationByUid(uid);
    if (!org)
      throw new NotFoundException(`Organization with UID ${uid} not found`);
    const {
      uid: _uid,
      created_at: _createdAt,
      updated_at: _updatedAt,
      created_by: _createdBy,
      description: _description,
      ...writable
    } = data;
    Object.assign(org, writable);
    return this.orgRepository.save(org);
  }

  async removeOrganization(uid: string): Promise<void> {
    const result = await this.orgRepository.delete(uid);
    if (result.affected === 0)
      throw new NotFoundException(`Organization with UID ${uid} not found`);
  }

  // Accounts
  async createAccount(data: CreateAccountDto): Promise<Account> {
    const account = this.accountRepository.create(data);
    return this.accountRepository.save(account);
  }

  async findAccountsByOrg(orgUid: string): Promise<Account[]> {
    return this.accountRepository.find({
      where: { organization_uid: orgUid },
      relations: { teams: true },
    });
  }

  async findAccountByUid(uid: string): Promise<Account | null> {
    return this.accountRepository.findOne({ where: { uid } });
  }

  async updateAccount(uid: string, data: UpdateAccountDto): Promise<Account> {
    const account = await this.findAccountByUid(uid);
    if (!account)
      throw new NotFoundException(`Account with UID ${uid} not found`);
    Object.assign(account, data);
    return this.accountRepository.save(account);
  }

  async removeAccount(uid: string): Promise<void> {
    const result = await this.accountRepository.delete(uid);
    if (result.affected === 0)
      throw new NotFoundException(`Account with UID ${uid} not found`);
  }

  // Teams
  async createTeam(data: CreateTeamDto): Promise<Team> {
    const team = this.teamRepository.create(data);
    return this.teamRepository.save(team);
  }

  async findTeamsByAccount(accountUid: string): Promise<Team[]> {
    return this.teamRepository.find({
      where: { account_uid: accountUid },
      relations: { sites: true },
    });
  }

  async findTeamByUid(uid: string): Promise<Team | null> {
    return this.teamRepository.findOne({ where: { uid } });
  }

  async updateTeam(uid: string, data: UpdateTeamDto): Promise<Team> {
    const team = await this.findTeamByUid(uid);
    if (!team) throw new NotFoundException(`Team with UID ${uid} not found`);
    Object.assign(team, data);
    return this.teamRepository.save(team);
  }

  async removeTeam(uid: string): Promise<void> {
    const result = await this.teamRepository.delete(uid);
    if (result.affected === 0)
      throw new NotFoundException(`Team with UID ${uid} not found`);
  }
}
