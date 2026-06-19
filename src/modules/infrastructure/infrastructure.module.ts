import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Site } from './entities/site.entity';
import { Camera } from './entities/camera.entity';
import { InfrastructureService } from './services/infrastructure.service';
import { InfrastructureController } from './controller/infrastructure.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Site, Camera]), UsersModule],
  exports: [TypeOrmModule, InfrastructureService],
  providers: [InfrastructureService],
  controllers: [InfrastructureController],
})
export class InfrastructureModule {}
