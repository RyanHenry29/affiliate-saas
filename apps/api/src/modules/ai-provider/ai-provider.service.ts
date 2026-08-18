import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { UpsertProviderDto } from './dto/upsert-provider.dto';
import { encryptSecret, decryptSecret } from '../../common/crypto.util';

const AI_CATALOG = [
  { id: 'openai', name: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'] },
  { id: 'anthropic', name: 'Anthropic', models: ['claude-sonnet-4-20250514', 'claude-3-haiku-20240307'] },
  { id: 'google', name: 'Google AI', models: ['gemini-1.5-pro', 'gemini-1.5-flash'] },
  { id: 'deepseek', name: 'DeepSeek', models: ['deepseek-chat', 'deepseek-coder'] },
  { id: 'groq', name: 'Groq', models: ['llama3-70b-8192', 'mixtral-8x7b-32768'] },
];

@Injectable()
export class AiProviderService {
  private encryptionKey: string;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.encryptionKey = this.config.get<string>('ENCRYPTION_KEY', 'dev-encryption-key-change-in-production');
  }

  catalog() {
    return AI_CATALOG;
  }

  async list(tenantId: string) {
    return this.prisma.aiProvider.findMany({
      where: { tenantId },
      select: { id: true, provider: true, model: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async upsert(tenantId: string, dto: UpsertProviderDto) {
    const encrypted = encryptSecret(dto.apiKey, this.encryptionKey);
    const existing = await this.prisma.aiProvider.findFirst({
      where: { tenantId, provider: dto.provider, model: dto.model },
    });

    if (existing) {
      return this.prisma.aiProvider.update({
        where: { id: existing.id },
        data: { apiKeyEncrypted: encrypted, isActive: dto.isActive ?? true },
      });
    }

    return this.prisma.aiProvider.create({
      data: {
        provider: dto.provider,
        model: dto.model,
        apiKeyEncrypted: encrypted,
        tenantId,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    const provider = await this.prisma.aiProvider.findFirst({ where: { id, tenantId } });
    if (!provider) throw new NotFoundException('Provider não encontrado');
    return this.prisma.aiProvider.delete({ where: { id } });
  }

  async test(tenantId: string, id: string) {
    const provider = await this.prisma.aiProvider.findFirst({ where: { id, tenantId } });
    if (!provider) throw new NotFoundException('Provider não encontrado');

    const apiKey = decryptSecret(provider.apiKeyEncrypted, this.encryptionKey);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: provider.model,
          messages: [{ role: 'user', content: 'Hello, this is a test.' }],
          max_tokens: 10,
        }),
      });

      return { success: response.ok, status: response.status };
    } catch {
      return { success: false, error: 'Connection failed' };
    }
  }

  async generate(tenantId: string, id: string, prompt: string, systemPrompt?: string) {
    const provider = await this.prisma.aiProvider.findFirst({
      where: { id, tenantId, isActive: true },
    });
    if (!provider) throw new NotFoundException('Provider não encontrado ou inativo');

    const apiKey = decryptSecret(provider.apiKeyEncrypted, this.encryptionKey);
    const messages: Array<{ role: string; content: string }> = [];

    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: prompt });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model: provider.model, messages }),
    });

    if (!response.ok) {
      throw new Error(`AI generation failed: ${response.status}`);
    }

    const data = await response.json();
    return { content: data.choices?.[0]?.message?.content || '' };
  }
}
