export interface LlmProvider {
  generate(prompt: string, systemPrompt?: string): Promise<string>;
}

export interface LlmConfig {
  provider: string;
  apiKey?: string;
  baseUrl?: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}
