import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAccountDto {
  @ApiProperty({ example: 'Main Account' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'organization-uuid',
    required: false,
    description: 'Provided via URL path when omitted from body',
  })
  @IsUUID()
  @IsOptional()
  organization_uid?: string;
}
