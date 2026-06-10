import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Membership } from './entities/membership.entity';
import { UsersService } from './services/users.service';
import { MembershipService } from './services/membership.service';
import { MembershipController } from './controller/membership.controller';
import { UsersController } from './controller/users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Membership])],
  providers: [UsersService, MembershipService],
  controllers: [MembershipController, UsersController],
  exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}
