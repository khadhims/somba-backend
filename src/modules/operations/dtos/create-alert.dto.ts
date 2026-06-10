import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  IsInt,
  IsDateString,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAlertDto {
  @ApiProperty({ example: 'camera-uuid' })
  @IsUUID()
  @IsNotEmpty()
  camera_uid: string;

  @ApiProperty({ example: 'No Hairnet' })
  @IsString()
  @IsNotEmpty()
  violation_name: string;

  @ApiProperty({ example: 'high', required: false })
  @IsString()
  @IsOptional()
  severity?: string;

  @ApiProperty({ example: '2026-06-09T10:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  detected_at: string;

  @ApiProperty({
    example: 'notResolved',
    enum: ['notResolved', 'resolved', 'falseAlarm'],
    required: false,
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ example: 'http://storage.com/image.jpg', required: false })
  @IsString()
  @IsOptional()
  image_url?: string;

  @ApiProperty({ example: 1, required: false })
  @IsInt()
  @IsOptional()
  total_detections?: number;

  @ApiProperty({ example: [100, 200, 300, 400], required: false })
  @IsArray()
  @IsOptional()
  bbox?: number[];

  @ApiProperty({ example: 'recording-event-uuid', required: false })
  @IsUUID()
  @IsOptional()
  recording_event_id?: string;
}
