import * as bcrypt from 'bcrypt';

const API_KEY_SALT_ROUNDS = 10;

export async function hashApiKey(plainKey: string): Promise<string> {
  return bcrypt.hash(plainKey, API_KEY_SALT_ROUNDS);
}

export async function verifyApiKey(
  plainKey: string,
  stored: string,
): Promise<boolean> {
  if (!plainKey || !stored) {
    return false;
  }

  if (stored.startsWith('$2')) {
    return bcrypt.compare(plainKey, stored);
  }

  return plainKey === stored;
}

export function isHashedApiKey(stored: string): boolean {
  return stored.startsWith('$2');
}
