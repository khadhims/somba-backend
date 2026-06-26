import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { Alert } from './entities/alert.entity';
import { OperationsService } from './services/operations.service';
import { OperationsController } from './controller/operations.controller';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { MediaUrlService } from '../../common/services/media-url.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, Alert]),
    InfrastructureModule,
  ],
  exports: [TypeOrmModule, OperationsService],
  providers: [OperationsService, MediaUrlService],
  controllers: [OperationsController],
})
export class OperationsModule {}
