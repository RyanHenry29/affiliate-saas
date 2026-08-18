const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

if (typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_API_URL) {
  console.error(
    'CRITICAL: NEXT_PUBLIC_API_URL não está definido. Configure no Vercel ou .env.local',
  );
}

export { API_URL };

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let token: string | null = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

// AI Provider API methods
export const aiProviderApi = {
  list: () => api.get<any[]>('/ai-provider'),
  catalog: () => api.get<any[]>('/ai-provider/catalog'),
  upsert: (data: { provider: string; apiKey: string; model: string }) =>
    api.post<any>('/ai-provider', data),
  remove: (provider: string) => api.delete<void>(`/ai-provider/${provider}`),
  test: (provider: string) => api.post<any>(`/ai-provider/${provider}/test`, {}),
};
