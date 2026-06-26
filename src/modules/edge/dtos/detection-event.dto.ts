import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class DetectionEventDto {
  @IsNumber()
  edge_id: number;

  @IsUUID()
  camera_uuid: string;

  @IsString()
  @IsNotEmpty()
  violation_name: string;

  @IsString()
  @IsNotEmpty()
  severity: string;

  @IsString()
  @IsNotEmpty()
  detected_at: string;

  @IsArray()
  bbox: number[];

  @IsString()
  @IsOptional()
  image_url?: string;

  @IsString()
  @IsOptional()
  event_code?: string;

  @IsString()
  @IsOptional()
  event_start?: string;

  @IsString()
  @IsOptional()
  event_end?: string;

  @IsNumber()
  @IsOptional()
  total_detections?: number;
}
