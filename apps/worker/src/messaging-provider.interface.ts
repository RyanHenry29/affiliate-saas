export interface MessagingProvider {
  sendMessage(instanceId: string, to: string, message: string): Promise<{ ok: boolean; error?: string }>;
  sendMedia(instanceId: string, to: string, url: string, caption?: string): Promise<{ ok: boolean; error?: string }>;
}
