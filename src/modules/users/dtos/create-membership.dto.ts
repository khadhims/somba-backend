import {
  IsEmail,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  INVITABLE_MEMBERSHIP_ROLES,
  MembershipRole,
} from '../../../common/constants/membership-role.enum';

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

  @ApiProperty({
    enum: INVITABLE_MEMBERSHIP_ROLES,
    example: MembershipRole.ADMIN,
    description: 'ADMIN: full access, VIEWER: read-only',
  })
  @IsEnum(MembershipRole)
  @IsIn(INVITABLE_MEMBERSHIP_ROLES)
  @IsNotEmpty()
  role: MembershipRole;

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
