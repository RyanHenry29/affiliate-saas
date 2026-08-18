import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LlmConfig } from './llm.interface';

@Injectable()
export class LlmConfigService {
  constructor(private readonly config: ConfigService) {}

  getDefaultConfig(): LlmConfig {
    return {
      provider: this.config.get<string>('LLM_PROVIDER', 'groq'),
      apiKey: this.config.get<string>('LLM_API_KEY'),
      baseUrl: this.config.get<string>('LLM_BASE_URL'),
      model: this.config.get<string>('LLM_MODEL', 'llama-3.3-70b-versatile'),
      temperature: parseFloat(this.config.get<string>('LLM_TEMPERATURE', '0.7')),
      maxTokens: parseInt(this.config.get<string>('LLM_MAX_TOKENS', '2048'), 10),
    };
  }
}
