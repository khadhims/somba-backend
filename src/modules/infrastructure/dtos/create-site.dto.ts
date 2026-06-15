import {
  IsNotEmpty,
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

  @ApiProperty({ example: 'Jl. Example No. 1', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    example: 'active',
    required: false,
    description: 'Site operational status: active | inactive',
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({
    example: 'Asia/Jakarta',
    required: false,
    description: 'IANA timezone from client browser',
  })
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

  @ApiProperty({
    example: '73216f48-d62a-412b-95ce-d211a4fee00',
    required: false,
    description: 'Plain API key for Mini-PC; auto-generated when omitted',
  })
  @IsUUID()
  @IsOptional()
  api_key?: string;
}
