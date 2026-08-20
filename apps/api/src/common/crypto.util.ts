import { createHash, randomBytes, createCipheriv, createDecipheriv } from 'node:crypto';

export interface ConfigLike {
  get: (key: string, defaultValue?: string) => string | undefined;
}

/**
 * Resolve a chave de criptografia de secrets. Em produção, ENCRYPTION_KEY é
 * obrigatório: um fallback conhecido tornaria a criptografia inútil (qualquer um
 * poderia descriptografar credenciais armazenadas).
 */
export function resolveEncryptionKey(config: ConfigLike): string {
  const key = config.get('ENCRYPTION_KEY');
  if (key) return key;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('ENCRYPTION_KEY é obrigatório em produção');
  }
  return 'dev-encryption-key-change-in-production';
}

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
