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

  @IsString()
  @IsNotEmpty()
  activity_type: string;

  @IsDateString()
  @IsNotEmpty()
  event_start: string;

  @IsDateString()
  @IsNotEmpty()
  event_end: string;

  @IsNumber({ maxDecimalPlaces: 1 })
  duration_minutes: number;

  @IsString()
  @IsOptional()
  recording_url?: string;
}
