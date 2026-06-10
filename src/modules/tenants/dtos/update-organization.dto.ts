import { PartialType } from '@nestjs/swagger';
import {
  Allow,
  IsDateString,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { CreateOrganizationDto } from './create-organization.dto';

export class UpdateOrganizationDto extends PartialType(
  CreateOrganizationDto,
) {
  @Allow()
  @IsOptional()
  @IsUUID()
  uid?: string;

  @Allow()
  @IsOptional()
  @IsDateString()
  created_at?: string;

  @Allow()
  @IsOptional()
  @IsDateString()
  updated_at?: string;

  @Allow()
  @IsOptional()
  @IsObject()
  created_by?: Record<string, unknown>;

  @Allow()
  @IsOptional()
  @IsString()
  description?: string;
}
