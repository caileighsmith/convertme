"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { useAuth } from "@/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const TOPICS = [
  { id: "all",      label: "All topics" },
  { id: "journey",  label: "On the journey" },
  { id: "halacha",  label: "Halacha questions" },
  { id: "shabbat",  label: "Shabbat & holidays" },
  { id: "hebrew",   label: "Hebrew & prayer" },
  { id: "rabbi",    label: "Working with a rabbi" },
  { id: "beitdin",  label: "Beit din & mikveh" },
  { id: "family",   label: "Family & relationships" },
];

const TOPIC_LABELS: Record<string, string> = Object.fromEntries(TOPICS.map((t) => [t.id, t.label]));

const SORT_OPTIONS = [
  { id: "recent", label: "Recent" },
  { id: "top",    label: "Most active" },
];

interface TopicCount { id: string; label: string; count: number; }
interface ThreadSummary {
  id: number; title: string; excerpt: string; topic: string;
  is_pinned: boolean; is_anonymous: boolean;
  author_display: string; author_initials: string;
  view_count: number; reply_count: number;
  last_reply_at: string | null; created_at: string;
}
interface Stats { members: number; threads: number; }

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

function Avatar({ initials, isMod = false, size = 36 }: { initials: string; isMod?: boolean; size?: number }) {
  const isAnon = initials === "··";
  return (
    <span
      className={`rounded-full grid place-items-center flex-shrink-0 font-ui font-semibold border ${
        isMod
          ? "bg-navy-900 text-parchment-50 border-navy-900"
          : "bg-parchment-200 text-navy-800 border-parchment-400"
      }`}
      style={{
        width: size, height: size,
        fontSize: size < 30 ? 10 : 11,
        letterSpacing: isAnon ? 0 : "-0.01em",
      }}
    >
      {initials}
    </span>
  );
}

function ThreadRow({ thread }: { thread: ThreadSummary }) {
  return (
    <Link
      href={`/community/${thread.id}`}
      className="grid gap-4 px-5 py-5 border-b border-parchment-400 last:border-0 hover:bg-parchment-50 transition-colors"
      style={{ gridTemplateColumns: "auto 1fr auto" }}
    >
      <Avatar initials={thread.author_initials} size={36} />

      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          {thread.is_pinned && (
            <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-gold-400 bg-gold-400/10 px-1.5 py-0.5 rounded">
              Pinned
            </span>
          )}
          <span className="font-ui text-[11px] text-navy-700 uppercase tracking-[0.08em]">
            {TOPIC_LABELS[thread.topic] ?? thread.topic}
          </span>
        </div>

        <h3 className="font-ui text-base font-semibold tracking-tight text-navy-900 leading-snug mb-1.5">
          {thread.title}
        </h3>

        <p className="font-ui text-[13px] text-navy-800 leading-[1.55] mb-2.5 line-clamp-2">
          {thread.excerpt}
        </p>

        <div className="flex gap-3 items-center font-ui text-xs text-navy-700">
          <span className={`font-medium ${thread.is_anonymous ? "italic text-navy-700" : "text-navy-800"}`}>
            {thread.author_display}
          </span>
          <span className="text-navy-600">·</span>
          {thread.last_reply_at ? (
            <span>Last reply {timeAgo(thread.last_reply_at)} ago</span>
          ) : (
            <span>{timeAgo(thread.created_at)} ago</span>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end gap-1.5 pt-1 font-ui text-xs text-navy-700 tabular-nums flex-shrink-0">
        <div className="flex items-baseline gap-1">
          <span className="font-heading text-lg text-navy-900">{thread.reply_count}</span>
          <span>replies</span>
        </div>
        <div>{thread.view_count} views</div>
      </div>
    </Link>
  );
}

function NewThreadModal({
  token,
  onClose,
  onCreated,
}: {
  token: string;
  onClose: () => void;
  onCreated: (t: ThreadSummary) => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [topic, setTopic] = useState("journey");
  const [isAnon, setIsAnon] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) { setError("Title and body are required"); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/community/threads`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, body, topic, is_anonymous: isAnon }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { detail?: string }).detail ?? "Failed to create thread");
      }
      const created: ThreadSummary = await res.json();
      onCreated(created);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/40 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-parchment-100 border border-parchment-400 rounded-2xl shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-parchment-400">
          <h2 className="font-ui text-base font-semibold text-navy-900 tracking-tight">New thread</h2>
          <button onClick={onClose} className="text-navy-700 hover:text-navy-900 transition-colors">
            <Icon name="x" size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <label className="font-ui text-xs uppercase tracking-[0.1em] text-navy-700 block mb-1.5">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              maxLength={300}
              className="w-full bg-parchment-50 border border-parchment-400 rounded-lg px-3 py-2.5 font-ui text-sm text-navy-900 focus:outline-none focus:border-navy-900 transition-colors"
              placeholder="What's your question or topic?"
            />
          </div>

          <div>
            <label className="font-ui text-xs uppercase tracking-[0.1em] text-navy-700 block mb-1.5">Topic</label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-parchment-50 border border-parchment-400 rounded-lg px-3 py-2.5 font-ui text-sm text-navy-900 focus:outline-none focus:border-navy-900 transition-colors"
            >
              {TOPICS.filter((t) => t.id !== "all").map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-ui text-xs uppercase tracking-[0.1em] text-navy-700 block mb-1.5">Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              className="w-full bg-parchment-50 border border-parchment-400 rounded-lg px-3 py-2.5 font-ui text-sm text-navy-900 focus:outline-none focus:border-navy-900 transition-colors resize-none"
              placeholder="Share your thoughts…"
            />
          </div>

          <label className="flex items-center gap-3 font-ui text-sm text-navy-800 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isAnon}
              onChange={(e) => setIsAnon(e.target.checked)}
              className="w-4 h-4 rounded border-parchment-500 accent-navy-900"
            />
            Post anonymously
          </label>

          {error && (
            <p className="font-ui text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-parchment-500 font-ui text-sm text-navy-800 hover:bg-parchment-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-navy-900 text-parchment-50 font-ui text-sm font-medium hover:bg-navy-900/90 disabled:opacity-50 transition-colors"
            >
              {saving ? "Posting…" : "Post thread"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CommunityPage() {
  const { token } = useAuth();
  const [activeTopic, setActiveTopic] = useState("all");
  const [sort, setSort] = useState("recent");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [topicCounts, setTopicCounts] = useState<TopicCount[]>([]);
  const [stats, setStats] = useState<Stats>({ members: 0, threads: 0 });
  const [showNewThread, setShowNewThread] = useState(false);
  const [loadingThreads, setLoadingThreads] = useState(true);

  // Fetch stats + topics once
  useEffect(() => {
    fetch(`${API}/api/community/stats`)
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
    fetch(`${API}/api/community/topics`)
      .then((r) => r.json())
      .then(setTopicCounts)
      .catch(() => {});
  }, []);

  const fetchThreads = useCallback(async () => {
    setLoadingThreads(true);
    try {
      const params = new URLSearchParams({
        topic: activeTopic,
        sort,
        page: String(page),
        ...(search ? { search } : {}),
      });
      const res = await fetch(`${API}/api/community/threads?${params}`);
      const data = await res.json();
      setThreads(data.threads);
      setTotal(data.total);
    } finally {
      setLoadingThreads(false);
    }
  }, [activeTopic, sort, page, search]);

  useEffect(() => { fetchThreads(); }, [fetchThreads]);

  // Reset page when filter/sort/search changes
  useEffect(() => { setPage(0); }, [activeTopic, sort, search]);

  function countFor(id: string) {
    return topicCounts.find((t) => t.id === id)?.count ?? 0;
  }

  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="min-h-[calc(100vh-60px)] bg-parchment-50">
      {/* Hero */}
      <section className="border-b border-parchment-400 bg-parchment-50 px-6 sm:px-14 py-11">
        <div className="max-w-[1200px] mx-auto grid gap-10 sm:gap-12 sm:grid-cols-[1.4fr_1fr] items-end">
          <div>
            <p className="font-ui text-[11px] uppercase tracking-[0.14em] text-navy-700 mb-3">Community</p>
            <h1 className="font-heading text-[42px] font-normal leading-[1.05] tracking-tight text-navy-900 mb-3">
              Questions, stories,<br />
              <span className="text-navy-800 italic">and a few quiet places to land.</span>
            </h1>
            <p className="font-ui text-[15px] text-navy-800 max-w-[540px] leading-[1.55]">
              A small, moderated forum for people converting to Judaism — and the rabbis,
              friends, and family walking alongside them. Real names optional. Kindness required.
            </p>
          </div>

          <div className="grid grid-cols-3 border border-parchment-400 rounded-xl bg-parchment-100 overflow-hidden">
            {[
              [stats.members.toLocaleString(), "members"],
              [stats.threads.toLocaleString(), "threads"],
              ["Soon", "rabbis"],
            ].map(([n, l], i) => (
              <div
                key={l}
                className={`px-5 py-4 ${i < 2 ? "border-r border-parchment-400" : ""}`}
              >
                <div className="font-heading text-2xl text-navy-900">{n}</div>
                <div className="font-ui text-xs text-navy-700 mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="px-6 sm:px-14 py-8 pb-20">
        <div
          className="max-w-[1200px] mx-auto grid gap-9"
          style={{ gridTemplateColumns: "208px 1fr 272px" }}
        >
          {/* Left — topics */}
          <aside>
            <p className="font-ui text-[11px] uppercase tracking-[0.14em] text-navy-700 mb-3">Topics</p>
            <div className="flex flex-col gap-0.5">
              {TOPICS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTopic(t.id)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg font-ui text-[13.5px] transition-colors ${
                    activeTopic === t.id
                      ? "bg-parchment-200 text-navy-900 font-semibold"
                      : "text-navy-800 hover:bg-parchment-100 font-medium"
                  }`}
                >
                  <span>{t.label}</span>
                  <span className="text-[11px] text-navy-700 tabular-nums">
                    {countFor(t.id)}
                  </span>
                </button>
              ))}
            </div>

            <p className="font-ui text-[11px] uppercase tracking-[0.14em] text-navy-700 mt-7 mb-3">House rules</p>
            <ul className="flex flex-col gap-0 font-ui text-xs text-navy-800 leading-[1.65]">
              {[
                "Speak to people as if they were across the table.",
                "Ask your rabbi for halacha that affects you.",
                "No proselytising — in either direction.",
                "Anonymity is honoured. Don't out anyone.",
              ].map((rule, i) => (
                <li
                  key={i}
                  className={`${i > 0 ? "border-t border-parchment-400 mt-2 pt-2" : ""}`}
                >
                  {rule}
                </li>
              ))}
            </ul>
          </aside>

          {/* Centre — threads */}
          <main>
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-0.5 p-0.5 rounded-lg bg-parchment-200">
                {SORT_OPTIONS.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => setSort(s.id)}
                    className={`px-3 py-1.5 rounded-[6px] font-ui text-[12.5px] transition-colors ${
                      sort === s.id
                        ? "bg-parchment-50 text-navy-900 font-semibold shadow-sm"
                        : "text-navy-800 font-medium"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-2 bg-parchment-100 border border-parchment-400 rounded-lg font-ui text-sm text-navy-700 w-48">
                  <Icon name="search" size={13} />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search threads…"
                    className="flex-1 bg-transparent outline-none text-navy-900 placeholder-navy-700 text-[13px]"
                  />
                </div>
                <button
                  onClick={() => setShowNewThread(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-navy-900 text-parchment-50 font-ui text-[13px] font-medium hover:bg-navy-900/90 transition-colors"
                >
                  <Icon name="spark" size={13} /> New thread
                </button>
              </div>
            </div>

            {/* Thread list */}
            <div className="border border-parchment-400 rounded-xl bg-parchment-100 overflow-hidden">
              {loadingThreads ? (
                <div className="py-16 text-center font-ui text-sm text-navy-700">Loading…</div>
              ) : threads.length === 0 ? (
                <div className="py-16 text-center font-ui text-sm text-navy-700">
                  No threads yet.{" "}
                  <button
                    onClick={() => setShowNewThread(true)}
                    className="text-navy-900 font-semibold border-b border-parchment-500"
                  >
                    Start the first one.
                  </button>
                </div>
              ) : (
                threads.map((t) => <ThreadRow key={t.id} thread={t} />)
              )}
            </div>

            {/* Pagination */}
            {total > pageSize && (
              <div className="flex items-center justify-between mt-4 font-ui text-sm text-navy-700">
                <span>
                  Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, total)} of {total.toLocaleString()} threads
                </span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-parchment-500 font-ui text-xs text-navy-800 hover:bg-parchment-200 disabled:opacity-40 transition-colors"
                  >
                    <Icon name="chevL" size={12} /> Prev
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-parchment-500 font-ui text-xs text-navy-800 hover:bg-parchment-200 disabled:opacity-40 transition-colors"
                  >
                    Next <Icon name="chevR" size={12} />
                  </button>
                </div>
              </div>
            )}
          </main>

          {/* Right rail */}
          <aside className="flex flex-col gap-6">
            {/* Ask a rabbi */}
            <div className="bg-parchment-50 border border-gold-400/30 rounded-xl p-5">
              <p className="font-ui text-[11px] uppercase tracking-[0.14em] text-gold-400 mb-2.5">Ask a rabbi</p>
              <p className="font-ui text-[13px] text-navy-800 leading-[1.55] mb-4">
                Tag your thread{" "}
                <span className="text-navy-900 font-semibold">#ask-rabbi</span> in the title
                and a participating rabbi will reply within the week.
              </p>
              <button
                onClick={() => setActiveTopic("rabbi")}
                className="w-full py-2 rounded-lg border border-parchment-500 font-ui text-[12.5px] text-navy-800 hover:bg-parchment-200 transition-colors"
              >
                Browse rabbi replies
              </button>
            </div>

            {/* This week */}
            <div>
              <p className="font-ui text-[11px] uppercase tracking-[0.14em] text-navy-700 mb-3">Community norms</p>
              <ul className="flex flex-col gap-3 font-ui">
                {[
                  { icon: "book",    head: "Be patient",          sub: "Everyone is somewhere different on the path." },
                  { icon: "compass", head: "Ask questions freely", sub: "No question is too small or obvious here." },
                  { icon: "users",   head: "Support one another",  sub: "You're all walking the same road." },
                ].map(({ icon, head, sub }) => (
                  <li key={head} className="flex gap-3 items-start">
                    <span className="mt-0.5 text-navy-700">
                      <Icon name={icon as Parameters<typeof Icon>[0]["name"]} size={14} />
                    </span>
                    <div>
                      <div className="text-[13px] font-semibold text-navy-900 tracking-tight">{head}</div>
                      <div className="text-[12px] text-navy-700 mt-0.5 leading-snug">{sub}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {showNewThread && token && (
        <NewThreadModal
          token={token}
          onClose={() => setShowNewThread(false)}
          onCreated={(t) => {
            setThreads((prev) => [t, ...prev]);
            setTotal((n) => n + 1);
            setStats((s) => ({ ...s, threads: s.threads + 1 }));
          }}
        />
      )}
    </div>
  );
}
