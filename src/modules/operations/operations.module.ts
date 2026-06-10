import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { Alert } from './entities/alert.entity';
import { OperationsService } from './services/operations.service';
import { OperationsController } from './controller/operations.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Event, Alert])],
  exports: [TypeOrmModule],
  providers: [OperationsService],
  controllers: [OperationsController],
})
export class OperationsModule {}
