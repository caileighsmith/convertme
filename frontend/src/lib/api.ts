const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const TOKEN_KEY = "cm_token";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

async function apiFetch<T>(path: string): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { headers });
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
