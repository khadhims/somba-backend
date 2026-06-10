import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  IsInt,
  IsUrl,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAlertDto {
  @ApiProperty({ example: 'event-uuid' })
  @IsUUID()
  @IsNotEmpty()
  event_id: string;

  @ApiProperty({ example: 'camera-uuid' })
  @IsUUID()
  @IsNotEmpty()
  camera_uid: string;

  @ApiProperty({ example: 'No Hairnet' })
  @IsString()
  @IsNotEmpty()
  violation_name: string;

  @ApiProperty({
    example: 'notResolved',
    enum: ['notResolved', 'resolved', 'falseAlarm'],
    required: false,
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ example: 'http://storage.com/image.jpg', required: false })
  @IsUrl()
  @IsOptional()
  image_url?: string;

  @ApiProperty({ example: 1, required: false })
  @IsInt()
  @IsOptional()
  total_detections?: number;
}
