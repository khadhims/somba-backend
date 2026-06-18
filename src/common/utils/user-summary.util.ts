import { User } from '../../modules/users/entities/user.entity';

export type UserSummary = {
  uid: string;
  email: string;
  first_name: string;
  last_name: string;
};

export function toUserSummary(
  user: User | null | undefined,
): UserSummary | null {
  if (!user) {
    return null;
  }

  return {
    uid: user.uid,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
  };
}
