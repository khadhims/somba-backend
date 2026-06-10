import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMembershipDto {
  @ApiProperty({ example: 'user@example.com', required: false })
  @ValidateIf((o: CreateMembershipDto) => !o.user_uid)
  @IsEmail()
  @IsNotEmpty()
  email?: string;

  @ApiProperty({ example: 'user-uuid', required: false })
  @ValidateIf((o: CreateMembershipDto) => !o.email)
  @IsUUID()
  @IsNotEmpty()
  user_uid?: string;

  @ApiProperty({ example: 'ADMIN' })
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiProperty({ example: 'organization-uuid', required: false })
  @IsUUID()
  @IsOptional()
  organization_uid?: string;

  @ApiProperty({ example: 'account-uuid', required: false })
  @IsUUID()
  @IsOptional()
  account_uid?: string;

  @ApiProperty({ example: 'team-uuid', required: false })
  @IsUUID()
  @IsOptional()
  team_uid?: string;
}
