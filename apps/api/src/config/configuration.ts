export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret',
  encryptionKey: process.env.ENCRYPTION_KEY ?? 'dev-encryption-key-change-in-production',
  evolutionApiUrl: process.env.EVOLUTION_API_URL ?? 'http://localhost:8080',
  evolutionApiKey: process.env.EVOLUTION_API_KEY ?? '',
});
