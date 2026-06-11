import { IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignCameraActivitiesDto {
  @ApiProperty({ type: [String], example: ['activity-uuid-1'] })
  @IsArray()
  @IsUUID('4', { each: true })
  activity_uids: string[];
}
