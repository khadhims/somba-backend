import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from './entities/organization.entity';
import { Account } from './entities/account.entity';
import { Team } from './entities/team.entity';
import { Camera } from '../infrastructure/entities/camera.entity';
import { TenantsService } from './services/tenants.service';
import { TenantsController } from './controller/tenants.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organization, Account, Team, Camera]),
    UsersModule,
  ],
  exports: [TypeOrmModule],
  providers: [TenantsService],
  controllers: [TenantsController],
})
export class TenantsModule {}
