import type { CurriculumItem, ExerciseObject, SessionResult, ProgressSummary } from "@/types/fluency";

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

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
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

// ── Fluency ──────────────────────────────────────────────────────────────────

export async function getFluencyCurriculum(): Promise<CurriculumItem[]> {
  return apiFetch<CurriculumItem[]>("/api/fluency/curriculum");
}

export async function getFluencySession(
  prayerId: string
): Promise<{ prayer_id: string; exercises: ExerciseObject[] }> {
  return apiFetch<{ prayer_id: string; exercises: ExerciseObject[] }>(
    `/api/fluency/session/${encodeURIComponent(prayerId)}`
  );
}

export async function submitFluencySession(
  prayerId: string,
  results: { exercise_id: string; correct: boolean }[]
): Promise<SessionResult> {
  return apiPost<SessionResult>(`/api/fluency/session/${encodeURIComponent(prayerId)}`, {
    results,
  });
}

export async function getFluencyProgress(): Promise<ProgressSummary> {
  return apiFetch<ProgressSummary>("/api/fluency/progress");
}
