import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from './entities/organization.entity';
import { Account } from './entities/account.entity';
import { Team } from './entities/team.entity';
import { TenantsService } from './services/tenants.service';
import { TenantsController } from './controller/tenants.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Organization, Account, Team])],
  exports: [TypeOrmModule],
  providers: [TenantsService],
  controllers: [TenantsController],
})
export class TenantsModule {}
