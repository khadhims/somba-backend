import {
  ForbiddenException,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Membership } from '../entities/membership.entity';
import { Organization } from '../../tenants/entities/organization.entity';
import { Account } from '../../tenants/entities/account.entity';
import { Team } from '../../tenants/entities/team.entity';
import { Site } from '../../infrastructure/entities/site.entity';
import {
  isWritableRole,
  MembershipRole,
} from '../../../common/constants/membership-role.enum';

type MembershipScope = Partial<
  Pick<Membership, 'organization_uid' | 'account_uid' | 'team_uid'>
>;

type MembershipWithRole = Pick<
  Membership,
  'organization_uid' | 'account_uid' | 'team_uid' | 'role'
>;

@Injectable()
export class AuthorizationService {
  constructor(
    @InjectRepository(Membership)
    private membershipRepository: Repository<Membership>,
    @InjectRepository(Organization)
    private orgRepository: Repository<Organization>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(Site)
    private siteRepository: Repository<Site>,
  ) {}

  private async getMemberships(userUid: string): Promise<Membership[]> {
    return this.membershipRepository.find({ where: { user_uid: userUid } });
  }

  private hasWritableMembership(
    memberships: MembershipWithRole[],
    predicate: (membership: MembershipWithRole) => boolean,
  ): boolean {
    return memberships.some(
      (membership) => predicate(membership) && isWritableRole(membership.role),
    );
  }

  async getAccessibleOrganizationUids(userUid: string): Promise<string[]> {
    const memberships = await this.getMemberships(userUid);
    const orgUids = new Set<string>();

    const ownedOrgs = await this.orgRepository.find({
      where: { created_by: userUid },
      select: { uid: true },
    });
    ownedOrgs.forEach((org) => orgUids.add(org.uid));

    for (const membership of memberships) {
      if (membership.organization_uid) {
        orgUids.add(membership.organization_uid);
      }
      if (membership.account_uid) {
        const account = await this.accountRepository.findOne({
          where: { uid: membership.account_uid },
          select: { organization_uid: true },
        });
        if (account) {
          orgUids.add(account.organization_uid);
        }
      }
      if (membership.team_uid) {
        const team = await this.teamRepository.findOne({
          where: { uid: membership.team_uid },
          relations: { account: true },
        });
        if (team?.account) {
          orgUids.add(team.account.organization_uid);
        }
      }
    }

    return Array.from(orgUids);
  }

  async getAccessibleAccountUids(
    userUid: string,
    organizationUid?: string,
  ): Promise<string[]> {
    const memberships = await this.getMemberships(userUid);
    const accountUids = new Set<string>();

    for (const membership of memberships) {
      if (membership.organization_uid) {
        const accounts = await this.accountRepository.find({
          where: { organization_uid: membership.organization_uid },
          select: { uid: true },
        });
        accounts.forEach((account) => accountUids.add(account.uid));
      }
      if (membership.account_uid) {
        accountUids.add(membership.account_uid);
      }
      if (membership.team_uid) {
        const team = await this.teamRepository.findOne({
          where: { uid: membership.team_uid },
          select: { account_uid: true },
        });
        if (team) {
          accountUids.add(team.account_uid);
        }
      }
    }

    if (organizationUid) {
      const org = await this.orgRepository.findOne({
        where: { uid: organizationUid },
        select: { uid: true, created_by: true },
      });
      if (org?.created_by === userUid) {
        const accounts = await this.accountRepository.find({
          where: { organization_uid: organizationUid },
          select: { uid: true },
        });
        accounts.forEach((account) => accountUids.add(account.uid));
      }
    }

    let result = Array.from(accountUids);
    if (organizationUid) {
      const orgAccounts = await this.accountRepository.find({
        where: { organization_uid: organizationUid },
        select: { uid: true },
      });
      const orgAccountSet = new Set(orgAccounts.map((account) => account.uid));
      result = result.filter((uid) => orgAccountSet.has(uid));
    }

    return result;
  }

  async getAccessibleTeamUids(
    userUid: string,
    accountUid?: string,
  ): Promise<string[]> {
    const memberships = await this.getMemberships(userUid);
    const teamUids = new Set<string>();

    const ownedTeams = await this.teamRepository.find({
      where: { created_by: userUid },
      select: { uid: true, account_uid: true },
    });
    ownedTeams.forEach((team) => teamUids.add(team.uid));

    for (const membership of memberships) {
      if (membership.organization_uid) {
        const accounts = await this.accountRepository.find({
          where: { organization_uid: membership.organization_uid },
          select: { uid: true },
        });
        for (const account of accounts) {
          const teams = await this.teamRepository.find({
            where: { account_uid: account.uid },
            select: { uid: true },
          });
          teams.forEach((team) => teamUids.add(team.uid));
        }
      }
      if (membership.account_uid) {
        const teams = await this.teamRepository.find({
          where: { account_uid: membership.account_uid },
          select: { uid: true },
        });
        teams.forEach((team) => teamUids.add(team.uid));
      }
      if (membership.team_uid) {
        teamUids.add(membership.team_uid);
      }
    }

    let result = Array.from(teamUids);
    if (accountUid) {
      const accountTeams = await this.teamRepository.find({
        where: { account_uid: accountUid },
        select: { uid: true },
      });
      const accountTeamSet = new Set(accountTeams.map((team) => team.uid));
      result = result.filter((uid) => accountTeamSet.has(uid));
    }

    return result;
  }

  async getAccessibleSiteUids(
    userUid: string,
    teamUid?: string,
  ): Promise<string[]> {
    const siteUids = new Set<string>();

    const ownedSites = await this.siteRepository.find({
      where: { created_by: userUid },
      select: { uid: true, team_uid: true },
    });
    ownedSites.forEach((site) => siteUids.add(site.uid));

    const accessibleTeamUids = await this.getAccessibleTeamUids(userUid);
    if (accessibleTeamUids.length > 0) {
      const sites = await this.siteRepository.find({
        where: { team_uid: In(accessibleTeamUids) },
        select: { uid: true },
      });
      sites.forEach((site) => siteUids.add(site.uid));
    }

    let result = Array.from(siteUids);
    if (teamUid) {
      const teamSites = await this.siteRepository.find({
        where: { team_uid: teamUid },
        select: { uid: true },
      });
      const teamSiteSet = new Set(teamSites.map((site) => site.uid));
      result = result.filter((uid) => teamSiteSet.has(uid));
    }

    return result;
  }

  async canReadOrganization(userUid: string, orgUid: string): Promise<boolean> {
    const accessible = await this.getAccessibleOrganizationUids(userUid);
    return accessible.includes(orgUid);
  }

  async canWriteOrganization(userUid: string, orgUid: string): Promise<boolean> {
    const org = await this.orgRepository.findOne({
      where: { uid: orgUid },
      select: { uid: true, created_by: true },
    });
    if (!org) {
      return false;
    }
    if (org.created_by === userUid) {
      return true;
    }

    const memberships = await this.getMemberships(userUid);
    return this.hasWritableMembership(
      memberships,
      (membership) => membership.organization_uid === orgUid,
    );
  }

  async canReadAccount(userUid: string, accountUid: string): Promise<boolean> {
    const account = await this.accountRepository.findOne({
      where: { uid: accountUid },
      select: { uid: true, organization_uid: true },
    });
    if (!account) {
      return false;
    }

    const accessible = await this.getAccessibleAccountUids(
      userUid,
      account.organization_uid,
    );
    return accessible.includes(accountUid);
  }

  async canWriteAccount(userUid: string, accountUid: string): Promise<boolean> {
    const account = await this.accountRepository.findOne({
      where: { uid: accountUid },
      select: { uid: true, organization_uid: true },
    });
    if (!account) {
      return false;
    }

    if (await this.canWriteOrganization(userUid, account.organization_uid)) {
      return true;
    }

    const memberships = await this.getMemberships(userUid);
    return this.hasWritableMembership(
      memberships,
      (membership) => membership.account_uid === accountUid,
    );
  }

  async canReadTeam(userUid: string, teamUid: string): Promise<boolean> {
    const team = await this.teamRepository.findOne({
      where: { uid: teamUid },
      select: { uid: true, account_uid: true },
    });
    if (!team) {
      return false;
    }

    const accessible = await this.getAccessibleTeamUids(userUid, team.account_uid);
    return accessible.includes(teamUid);
  }

  async canWriteTeam(userUid: string, teamUid: string): Promise<boolean> {
    const team = await this.teamRepository.findOne({
      where: { uid: teamUid },
      select: { uid: true, account_uid: true, created_by: true },
    });
    if (!team) {
      return false;
    }
    if (team.created_by === userUid) {
      return true;
    }
    if (await this.canWriteAccount(userUid, team.account_uid)) {
      return true;
    }

    const memberships = await this.getMemberships(userUid);
    return this.hasWritableMembership(
      memberships,
      (membership) => membership.team_uid === teamUid,
    );
  }

  async canReadSite(userUid: string, siteUid: string): Promise<boolean> {
    const site = await this.siteRepository.findOne({
      where: { uid: siteUid },
      select: { uid: true, team_uid: true, created_by: true },
    });
    if (!site) {
      return false;
    }
    if (site.created_by === userUid) {
      return true;
    }

    const accessible = await this.getAccessibleSiteUids(userUid, site.team_uid);
    return accessible.includes(siteUid);
  }

  async canWriteSite(userUid: string, siteUid: string): Promise<boolean> {
    const site = await this.siteRepository.findOne({
      where: { uid: siteUid },
      select: { uid: true, team_uid: true, created_by: true },
    });
    if (!site) {
      return false;
    }
    if (site.created_by === userUid) {
      return true;
    }
    if (await this.canWriteTeam(userUid, site.team_uid)) {
      return true;
    }

    return false;
  }

  async assertCanReadOrganization(userUid: string, orgUid: string): Promise<void> {
    if (!(await this.canReadOrganization(userUid, orgUid))) {
      throw new ForbiddenException('You do not have access to this organization');
    }
  }

  async assertCanWriteOrganization(userUid: string, orgUid: string): Promise<void> {
    if (!(await this.canWriteOrganization(userUid, orgUid))) {
      throw new ForbiddenException(
        'You do not have permission to modify this organization',
      );
    }
  }

  async assertCanReadAccount(userUid: string, accountUid: string): Promise<void> {
    if (!(await this.canReadAccount(userUid, accountUid))) {
      throw new ForbiddenException('You do not have access to this account');
    }
  }

  async assertCanWriteAccount(userUid: string, accountUid: string): Promise<void> {
    if (!(await this.canWriteAccount(userUid, accountUid))) {
      throw new ForbiddenException('You do not have permission to modify this account');
    }
  }

  async assertCanReadTeam(userUid: string, teamUid: string): Promise<void> {
    if (!(await this.canReadTeam(userUid, teamUid))) {
      throw new ForbiddenException('You do not have access to this team');
    }
  }

  async assertCanWriteTeam(userUid: string, teamUid: string): Promise<void> {
    if (!(await this.canWriteTeam(userUid, teamUid))) {
      throw new ForbiddenException('You do not have permission to modify this team');
    }
  }

  async assertCanReadSite(userUid: string, siteUid: string): Promise<void> {
    if (!(await this.canReadSite(userUid, siteUid))) {
      throw new ForbiddenException('You do not have access to this site');
    }
  }

  async assertCanWriteSite(userUid: string, siteUid: string): Promise<void> {
    if (!(await this.canWriteSite(userUid, siteUid))) {
      throw new ForbiddenException('You do not have permission to modify this site');
    }
  }

  async assertCanManageMembers(
    userUid: string,
    scope: MembershipScope,
  ): Promise<void> {
    if (scope.organization_uid) {
      await this.assertCanWriteOrganization(userUid, scope.organization_uid);
      return;
    }
    if (scope.account_uid) {
      await this.assertCanWriteAccount(userUid, scope.account_uid);
      return;
    }
    if (scope.team_uid) {
      await this.assertCanWriteTeam(userUid, scope.team_uid);
      return;
    }

    throw new BadRequestException('Membership scope is required');
  }

  async createOwnerMembership(
    userUid: string,
    scope: MembershipScope,
  ): Promise<Membership> {
    const membership = this.membershipRepository.create({
      user_uid: userUid,
      role: MembershipRole.OWNER,
      ...scope,
    });
    return this.membershipRepository.save(membership);
  }
}
