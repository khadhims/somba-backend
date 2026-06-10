import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTeamDto {
  @ApiProperty({ example: 'Operations Team' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'account-uuid',
    required: false,
    description: 'Provided via URL path when omitted from body',
  })
  @IsUUID()
  @IsOptional()
  account_uid?: string;
}
