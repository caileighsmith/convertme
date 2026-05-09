const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function getServices() {
  return apiFetch("/api/prayers/services");
}

export async function getService(serviceId: string) {
  return apiFetch(`/api/prayers/services/${serviceId}`);
}

export async function getPrayerSection(ref: string) {
  return apiFetch(`/api/prayers/section?ref=${encodeURIComponent(ref)}`);
}

export async function getWordDefinition(word: string, ref: string) {
  return apiFetch(
    `/api/prayers/word?word=${encodeURIComponent(word)}&ref=${encodeURIComponent(ref)}`
  );
}
