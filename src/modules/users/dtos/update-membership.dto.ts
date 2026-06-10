import { PickType } from '@nestjs/swagger';
import { CreateMembershipDto } from './create-membership.dto';

export class UpdateMembershipDto extends PickType(CreateMembershipDto, [
  'role',
] as const) {}
