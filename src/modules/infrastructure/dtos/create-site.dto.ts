import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSiteDto {
  @ApiProperty({ example: 'Kitchen Site A' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Main central kitchen', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'KITCH_1234', required: false })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ example: 'Jl. Example No. 1', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: -6.2, required: false })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty({ example: 106.8, required: false })
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsString()
  @IsOptional()
  contact_person?: string;

  @ApiProperty({ example: '+628123456789', required: false })
  @IsString()
  @IsOptional()
  contact_phone?: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @ApiProperty({ example: 'WIB', required: false })
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiProperty({
    example: 'team-uuid',
    required: false,
    description: 'Provided via URL path when omitted from body',
  })
  @IsUUID()
  @IsOptional()
  team_uid?: string;
}
