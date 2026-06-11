import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  IsDateString,
} from 'class-validator';

export class RecordingEventDto {
  @IsNumber()
  edge_id: number;

  @IsUUID()
  camera_uuid: string;

  @IsUUID()
  @IsOptional()
  activity_uid?: string;

  @IsString()
  @IsNotEmpty()
  activity_type: string;

  @IsDateString()
  @IsNotEmpty()
  event_start: string;

  @IsDateString()
  @IsNotEmpty()
  event_end: string;

  @IsNumber()
  duration_minutes: number;

  @IsString()
  @IsOptional()
  recording_url?: string;
}
