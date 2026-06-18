import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateActivityDto {
  @ApiProperty({
    example: 'memasak',
    required: false,
    description: 'Auto-generated from name when omitted',
  })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ example: 'Memasak' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 'memasak',
    description: 'Model filename stem; edge loads models/{ai_model}.pt',
  })
  @IsString()
  @IsNotEmpty()
  ai_model: string;

  @ApiProperty({ example: ['person', 'pot'] })
  @IsArray()
  @IsString({ each: true })
  target_classes: string[];

  @ApiProperty({ example: 0.5, required: false })
  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  min_confidence?: number;

  @ApiProperty({
    required: false,
    example: { post_buffer_sec: 10, max_segment_sec: 300 },
  })
  @IsObject()
  @IsOptional()
  recording_config?: Record<string, unknown>;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  site_uid?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  camera_uids?: string[];
}
