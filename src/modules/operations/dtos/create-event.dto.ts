import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  IsEnum,
  IsDateString,
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

  @ApiProperty({ example: 'Motion Detected' })
  @IsString()
  @IsNotEmpty()
  event_name: string;

  @ApiProperty({
    example: 'low',
    enum: ['low', 'medium', 'high', 'critical'],
    required: false,
  })
  @IsEnum(['low', 'medium', 'high', 'critical'])
  @IsOptional()
  severity?: string;

  @ApiProperty({ example: '2026-06-09T10:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  event_start: string;
}
