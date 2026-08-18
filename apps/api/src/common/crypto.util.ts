import { createHash, randomBytes, createCipheriv, createDecipheriv } from 'node:crypto';

export function encryptSecret(plaintext: string, key: string): string {
  const keyHash = createHash('sha256').update(key).digest();
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', keyHash, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64')}.${tag.toString('base64')}.${encrypted.toString('base64')}`;
}

export function decryptSecret(ciphertext: string, key: string): string {
  const [ivB64, tagB64, dataB64] = ciphertext.split('.');
  const keyHash = createHash('sha256').update(key).digest();
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const data = Buffer.from(dataB64, 'base64');
  const decipher = createDecipheriv('aes-256-gcm', keyHash, iv);
  decipher.setAuthTag(tag);
  return decipher.update(data) + decipher.final('utf8');
}
