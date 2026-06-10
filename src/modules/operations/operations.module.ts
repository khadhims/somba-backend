import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { Alert } from './entities/alert.entity';
import { OperationsService } from './services/operations.service';
import { OperationsController } from './controller/operations.controller';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, Alert]),
    InfrastructureModule,
  ],
  exports: [TypeOrmModule, OperationsService],
  providers: [OperationsService],
  controllers: [OperationsController],
})
export class OperationsModule {}
