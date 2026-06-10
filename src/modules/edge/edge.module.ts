import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Site } from '../infrastructure/entities/site.entity';
import { Camera } from '../infrastructure/entities/camera.entity';
import { EdgeService } from './services/edge.service';
import { EdgeApiController } from './controller/edge-api.controller';
import { EdgeGateway } from './edge.gateway';
import { OperationsModule } from '../operations/operations.module';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { EdgeAuthGuard } from '../../common/guards/edge-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Site, Camera]),
    OperationsModule,
    InfrastructureModule,
  ],
  providers: [EdgeService, EdgeGateway, EdgeAuthGuard],
  exports: [EdgeService, EdgeGateway, EdgeAuthGuard, TypeOrmModule],
  controllers: [EdgeApiController],
})
export class EdgeModule {}
