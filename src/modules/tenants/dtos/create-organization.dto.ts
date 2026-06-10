import { IsNotEmpty, IsString, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'Acme Corp' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Acme Corporation Ltd.', required: false })
  @IsString()
  @IsOptional()
  legalName?: string;

  @ApiProperty({ example: 'contact@acme.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'https://acme.com', required: false })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiProperty({ example: '123 Main St', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: 'Indonesia', required: false })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({ example: 'active', required: false })
  @IsString()
  @IsOptional()
  status?: string;
}
