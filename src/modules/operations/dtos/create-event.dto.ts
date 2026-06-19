import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  IsDateString,
  IsNumber,
  IsUrl,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({ example: 'site-uuid' })
  @IsUUID()
  @IsNotEmpty()
  site_uid: string;

  @ApiProperty({ example: 'camera-uuid' })
  @IsUUID()
  @IsNotEmpty()
  camera_uid: string;

  @ApiProperty({ example: 'memasak', required: false })
  @IsString()
  @IsOptional()
  activity_type?: string;

  @ApiProperty({ example: '2026-06-09T10:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  event_start: string;

  @ApiProperty({ example: '2026-06-09T10:02:15Z', required: false })
  @IsDateString()
  @IsOptional()
  event_end?: string;

  @ApiProperty({ example: 2.25, required: false })
  @IsNumber()
  @IsOptional()
  duration_minutes?: number;

  @ApiProperty({ example: 'https://storage/recordings/cam.mp4', required: false })
  @IsString()
  @IsOptional()
  recording_url?: string;
}
