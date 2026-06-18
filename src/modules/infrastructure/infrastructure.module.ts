import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Site } from './entities/site.entity';
import { Camera } from './entities/camera.entity';
import { Activity } from './entities/activity.entity';
import { CameraActivity } from './entities/camera-activity.entity';
import { InfrastructureService } from './services/infrastructure.service';
import { ActivityService } from './services/activity.service';
import { InfrastructureController } from './controller/infrastructure.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Site, Camera, Activity, CameraActivity]),
    UsersModule,
  ],
  exports: [TypeOrmModule, InfrastructureService, ActivityService],
  providers: [InfrastructureService, ActivityService],
  controllers: [InfrastructureController],
})
export class InfrastructureModule {}
