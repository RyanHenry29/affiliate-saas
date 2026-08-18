import { Injectable, Logger } from '@nestjs/common';
import { LlmProvider, LlmConfig } from './llm.interface';

@Injectable()
export class AnthropicProvider implements LlmProvider {
  private readonly logger = new Logger(AnthropicProvider.name);
  private readonly config: LlmConfig;

  constructor(config: LlmConfig) {
    this.config = config;
  }

  async generate(prompt: string, systemPrompt?: string): Promise<string> {
    const model = this.config.model || 'claude-3-5-sonnet-20241022';

    const body: Record<string, unknown> = {
      model,
      max_tokens: this.config.maxTokens ?? 2048,
      messages: [{ role: 'user', content: prompt }],
    };

    if (systemPrompt) {
      body.system = systemPrompt;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey ?? '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Anthropic API error ${response.status}: ${text}`);
    }

    const data = await response.json() as {
      content: Array<{ type: string; text: string }>;
    };
    return data.content?.[0]?.text ?? '';
  }
}
