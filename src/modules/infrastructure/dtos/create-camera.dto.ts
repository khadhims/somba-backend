import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsObject,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCameraDto {
  @ApiProperty({ example: 'Camera 01' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'DS-2CD2143G0-I', required: false })
  @IsString()
  @IsOptional()
  model?: string;

  @ApiProperty({
    example: 'rtsp://admin:pass@192.168.1.64:554/cam/realmonitor?channel=1&subtype=0',
    description: 'RTSP URL referensi (dikonfigurasi manual di go2rtc.yaml edge)',
  })
  @IsString()
  @IsNotEmpty()
  rtsp_url: string;

  @ApiProperty({
    example: 'http://103.53.184.186:1984/api/stream.m3u8?src=camera-uuid_main',
    description: 'URL HLS (.m3u8) dari go2rtc — dipakai Web UI untuk live view',
  })
  @IsString()
  @IsNotEmpty()
  stream_url: string;

  @ApiProperty({ example: 'Dahua', required: false })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiProperty({ example: 'Dome', required: false })
  @IsString()
  @IsOptional()
  cam_type?: string;

  @ApiProperty({ example: '1080P (2MP)', required: false })
  @IsString()
  @IsOptional()
  cam_resolution?: string;

  @ApiProperty({ example: 1, required: false })
  @IsInt()
  @IsOptional()
  channels?: number;

  @ApiProperty({ example: 'Kitchen entrance', required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ example: 'Main entrance camera', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  camera_config?: Record<string, unknown>;

  @ApiProperty({
    example: 'site-uuid',
    required: false,
    description: 'Provided via URL path when omitted from body',
  })
  @IsUUID()
  @IsOptional()
  site_uid?: string;

  @ApiProperty({ example: 'Kitchen', required: false })
  @IsString()
  @IsOptional()
  room?: string;

  @ApiProperty({ example: 'Bullet', required: false })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({ example: 'online', required: false })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({
    example: 'memasak',
    description: 'Activity label for edge worker recording',
    required: false,
  })
  @IsString()
  @IsOptional()
  activity?: string;

  @ApiProperty({
    example: false,
    description: 'Enable violation detection (best.pt) on edge worker',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  alert?: boolean;
}
