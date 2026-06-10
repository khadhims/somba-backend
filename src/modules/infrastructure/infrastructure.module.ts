import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Site } from './entities/site.entity';
import { Camera } from './entities/camera.entity';
import { InfrastructureService } from './services/infrastructure.service';
import { InfrastructureController } from './controller/infrastructure.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Site, Camera])],
  exports: [TypeOrmModule, InfrastructureService],
  providers: [InfrastructureService],
  controllers: [InfrastructureController],
})
export class InfrastructureModule {}
