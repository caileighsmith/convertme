"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface Stats {
  total_users: number;
  users_this_week: number;
  total_threads: number;
  total_posts: number;
  total_fluency_sessions: number;
  onboarded_users: number;
}

interface AdminUser {
  id: number;
  email: string;
  created_at: string;
  is_admin: boolean;
  journey_stage: string | null;
  tradition: string | null;
  hebrew_level: number | null;
  fluency_sessions: number;
  posts_count: number;
  threads_count: number;
}

async function adminFetch<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json() as Promise<T>;
}

function StatCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="rounded-xl border border-parchment-400 bg-parchment-50 p-5">
      <p className="font-ui text-xs text-navy-600 uppercase tracking-wide">{label}</p>
      <p className="font-ui text-3xl font-bold text-navy-900 mt-1">{value.toLocaleString()}</p>
      {sub && <p className="font-ui text-xs text-navy-600 mt-0.5">{sub}</p>}
    </div>
  );
}

const STAGE_LABELS: Record<string, string> = {
  considering: "Considering",
  in_process: "In Process",
  recent_convert: "Recent Convert",
  established: "Established",
};

const TRADITION_LABELS: Record<string, string> = {
  orthodox: "Orthodox",
  conservative: "Conservative",
  reform: "Reform",
  reconstructionist: "Reconstructionist",
  renewal: "Renewal",
  open: "Open",
};

function hebrewLevelLabel(n: number | null) {
  if (n === null) return "—";
  if (n <= 25) return "Beginner";
  if (n <= 50) return "Elementary";
  if (n <= 75) return "Intermediate";
  return "Advanced";
}

export default function AdminPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user || !user.is_admin) {
      router.replace("/");
      return;
    }
    if (!token) return;

    Promise.all([
      adminFetch<Stats>("/api/admin/stats", token),
      adminFetch<AdminUser[]>("/api/admin/users", token),
    ])
      .then(([s, u]) => {
        setStats(s);
        setUsers(u);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, [loading, user, token, router]);

  if (loading) return null;
  if (!user?.is_admin) return null;

  const filtered = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-parchment-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        <div className="mb-8">
          <h1 className="font-ui text-2xl font-bold text-navy-900">Admin Dashboard</h1>
          <p className="font-ui text-sm text-navy-600 mt-1">Logged in as {user.email}</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 font-ui text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
            <StatCard label="Total Users" value={stats.total_users} />
            <StatCard label="New This Week" value={stats.users_this_week} />
            <StatCard
              label="Onboarded"
              value={stats.onboarded_users}
              sub={`${Math.round((stats.onboarded_users / Math.max(stats.total_users, 1)) * 100)}% of users`}
            />
            <StatCard label="Threads" value={stats.total_threads} />
            <StatCard label="Posts" value={stats.total_posts} />
            <StatCard label="Fluency Sessions" value={stats.total_fluency_sessions} />
          </div>
        )}

        {/* User table */}
        <div className="rounded-xl border border-parchment-400 bg-parchment-50 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-parchment-400">
            <h2 className="font-ui text-sm font-semibold text-navy-900">
              Users ({users.length})
            </h2>
            <input
              type="search"
              placeholder="Search by email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-56 rounded-lg border border-parchment-400 bg-white px-3 py-1.5 font-ui text-sm text-navy-900 placeholder:text-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-900/20"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm font-ui">
              <thead>
                <tr className="border-b border-parchment-400 bg-parchment-100 text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-navy-600 uppercase tracking-wide">ID</th>
                  <th className="px-4 py-3 text-xs font-semibold text-navy-600 uppercase tracking-wide">Email</th>
                  <th className="px-4 py-3 text-xs font-semibold text-navy-600 uppercase tracking-wide">Joined</th>
                  <th className="px-4 py-3 text-xs font-semibold text-navy-600 uppercase tracking-wide">Stage</th>
                  <th className="px-4 py-3 text-xs font-semibold text-navy-600 uppercase tracking-wide">Tradition</th>
                  <th className="px-4 py-3 text-xs font-semibold text-navy-600 uppercase tracking-wide">Hebrew</th>
                  <th className="px-4 py-3 text-xs font-semibold text-navy-600 uppercase tracking-wide text-right">Fluency</th>
                  <th className="px-4 py-3 text-xs font-semibold text-navy-600 uppercase tracking-wide text-right">Posts</th>
                  <th className="px-4 py-3 text-xs font-semibold text-navy-600 uppercase tracking-wide text-right">Threads</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-navy-500">
                      No users found.
                    </td>
                  </tr>
                )}
                {filtered.map((u, i) => (
                  <tr
                    key={u.id}
                    className={`border-b border-parchment-300 ${i % 2 === 0 ? "" : "bg-parchment-100/40"} hover:bg-parchment-200/50 transition-colors`}
                  >
                    <td className="px-4 py-3 text-navy-500">{u.id}</td>
                    <td className="px-4 py-3 text-navy-900 font-medium">
                      {u.email}
                      {u.is_admin && (
                        <span className="ml-2 rounded px-1.5 py-0.5 bg-navy-900 text-parchment-50 text-[10px] font-semibold">
                          admin
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-navy-600">
                      {new Date(u.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-navy-700">
                      {u.journey_stage ? (STAGE_LABELS[u.journey_stage] ?? u.journey_stage) : <span className="text-navy-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-navy-700">
                      {u.tradition ? (TRADITION_LABELS[u.tradition] ?? u.tradition) : <span className="text-navy-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-navy-700">{hebrewLevelLabel(u.hebrew_level)}</td>
                    <td className="px-4 py-3 text-navy-700 text-right">{u.fluency_sessions}</td>
                    <td className="px-4 py-3 text-navy-700 text-right">{u.posts_count}</td>
                    <td className="px-4 py-3 text-navy-700 text-right">{u.threads_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
