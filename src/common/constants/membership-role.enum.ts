export enum MembershipRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  VIEWER = 'VIEWER',
}

export const WRITABLE_MEMBERSHIP_ROLES: MembershipRole[] = [
  MembershipRole.OWNER,
  MembershipRole.ADMIN,
];

export const INVITABLE_MEMBERSHIP_ROLES: MembershipRole[] = [
  MembershipRole.ADMIN,
  MembershipRole.VIEWER,
];

export function isWritableRole(role: string): boolean {
  return WRITABLE_MEMBERSHIP_ROLES.includes(role as MembershipRole);
}

export function isOwnerRole(role: string): boolean {
  return role === MembershipRole.OWNER;
}
