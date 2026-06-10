import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsObject,
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

  @ApiProperty({ example: '192.168.1.10', required: false })
  @IsString()
  @IsOptional()
  public_endpoint_url?: string;

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

  @ApiProperty({ example: '192.168.1.10', required: false })
  @IsString()
  @IsOptional()
  ipAddress?: string;

  @ApiProperty({ example: 'Bullet', required: false })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({ example: 'online', required: false })
  @IsString()
  @IsOptional()
  status?: string;
}
