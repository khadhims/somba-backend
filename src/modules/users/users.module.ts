import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Membership } from './entities/membership.entity';
import { Organization } from '../tenants/entities/organization.entity';
import { Account } from '../tenants/entities/account.entity';
import { Team } from '../tenants/entities/team.entity';
import { Site } from '../infrastructure/entities/site.entity';
import { UsersService } from './services/users.service';
import { MembershipService } from './services/membership.service';
import { AuthorizationService } from './services/authorization.service';
import { MembershipController } from './controller/membership.controller';
import { UsersController } from './controller/users.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Membership,
      Organization,
      Account,
      Team,
      Site,
    ]),
  ],
  providers: [UsersService, MembershipService, AuthorizationService],
  controllers: [MembershipController, UsersController],
  exports: [TypeOrmModule, UsersService, AuthorizationService],
})
export class UsersModule {}
