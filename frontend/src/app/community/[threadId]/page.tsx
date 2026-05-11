"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { useAuth } from "@/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const TOPIC_LABELS: Record<string, string> = {
  journey: "On the journey",
  halacha: "Halacha questions",
  shabbat: "Shabbat & holidays",
  hebrew:  "Hebrew & prayer",
  rabbi:   "Working with a rabbi",
  beitdin: "Beit din & mikveh",
  family:  "Family & relationships",
};

interface PostResponse {
  id: number;
  author_display: string;
  author_initials: string;
  is_anonymous: boolean;
  body: string;
  created_at: string;
}

interface ThreadDetail {
  id: number;
  title: string;
  body: string;
  topic: string;
  is_pinned: boolean;
  is_anonymous: boolean;
  author_display: string;
  author_initials: string;
  view_count: number;
  reply_count: number;
  created_at: string;
  posts: PostResponse[];
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function Avatar({ initials, size = 36 }: { initials: string; size?: number }) {
  return (
    <span
      className="rounded-full grid place-items-center flex-shrink-0 font-ui font-semibold bg-parchment-200 text-navy-800 border border-parchment-400"
      style={{ width: size, height: size, fontSize: size < 30 ? 10 : 11 }}
    >
      {initials}
    </span>
  );
}

function PostCard({ post, isOp = false }: { post: PostResponse; isOp?: boolean }) {
  return (
    <div className={`flex gap-4 p-5 ${isOp ? "bg-parchment-100 border-b border-parchment-400" : "border-b border-parchment-400 last:border-0"}`}>
      <Avatar initials={post.author_initials} size={36} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className={`font-ui text-sm font-semibold text-navy-900 ${post.is_anonymous ? "italic font-normal text-navy-700" : ""}`}>
            {post.author_display}
          </span>
          {isOp && (
            <span className="font-ui text-[10px] uppercase tracking-[0.1em] text-gold-400 bg-gold-400/10 px-1.5 py-0.5 rounded font-semibold">
              OP
            </span>
          )}
          <span className="font-ui text-xs text-navy-700">{timeAgo(post.created_at)}</span>
        </div>
        <p className="font-ui text-sm text-navy-900 leading-[1.65] whitespace-pre-wrap">{post.body}</p>
      </div>
    </div>
  );
}

export default function ThreadPage() {
  const { threadId } = useParams<{ threadId: string }>();
  const { token } = useAuth();
  const [thread, setThread] = useState<ThreadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyBody, setReplyBody] = useState("");
  const [replyAnon, setReplyAnon] = useState(false);
  const [replying, setReplying] = useState(false);
  const [replyError, setReplyError] = useState("");

  useEffect(() => {
    if (!threadId) return;
    setLoading(true);
    fetch(`${API}/api/community/threads/${threadId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(setThread)
      .catch(() => setThread(null))
      .finally(() => setLoading(false));
  }, [threadId]);

  async function handleReply(e: FormEvent) {
    e.preventDefault();
    if (!replyBody.trim() || !token) return;
    setReplying(true);
    setReplyError("");
    try {
      const res = await fetch(`${API}/api/community/threads/${threadId}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ body: replyBody, is_anonymous: replyAnon }),
      });
      if (!res.ok) throw new Error("Failed to post reply");
      const post: PostResponse = await res.json();
      setThread((t) => t ? { ...t, posts: [...t.posts, post], reply_count: t.reply_count + 1 } : t);
      setReplyBody("");
    } catch (err) {
      setReplyError(err instanceof Error ? err.message : "Failed");
    } finally {
      setReplying(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-60px)] bg-parchment-50 flex items-center justify-center">
        <p className="font-ui text-sm text-navy-700">Loading…</p>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="min-h-[calc(100vh-60px)] bg-parchment-50 flex flex-col items-center justify-center gap-4">
        <p className="font-ui text-sm text-navy-700">Thread not found.</p>
        <Link href="/community" className="font-ui text-sm text-navy-900 font-semibold border-b border-parchment-500">
          Back to community
        </Link>
      </div>
    );
  }

  const opPost: PostResponse = {
    id: 0,
    author_display: thread.author_display,
    author_initials: thread.author_initials,
    is_anonymous: thread.is_anonymous,
    body: thread.body,
    created_at: thread.created_at,
  };

  return (
    <div className="min-h-[calc(100vh-60px)] bg-parchment-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Back */}
        <Link
          href="/community"
          className="inline-flex items-center gap-1.5 font-ui text-sm text-navy-700 hover:text-navy-900 transition-colors mb-6"
        >
          <Icon name="chevL" size={13} /> Community
        </Link>

        {/* Thread header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            {thread.is_pinned && (
              <span className="font-ui text-[10px] font-semibold uppercase tracking-[0.1em] text-gold-400 bg-gold-400/10 px-1.5 py-0.5 rounded">
                Pinned
              </span>
            )}
            <span className="font-ui text-[11px] uppercase tracking-[0.08em] text-navy-700">
              {TOPIC_LABELS[thread.topic] ?? thread.topic}
            </span>
          </div>
          <h1 className="font-ui text-2xl font-semibold tracking-tight text-navy-900 leading-snug mb-2">
            {thread.title}
          </h1>
          <div className="flex items-center gap-3 font-ui text-xs text-navy-700">
            <span>{thread.reply_count} {thread.reply_count === 1 ? "reply" : "replies"}</span>
            <span className="text-navy-600">·</span>
            <span>{thread.view_count} views</span>
            <span className="text-navy-600">·</span>
            <span>{timeAgo(thread.created_at)}</span>
          </div>
        </div>

        {/* Posts */}
        <div className="border border-parchment-400 rounded-xl bg-parchment-100 overflow-hidden mb-6">
          <PostCard post={opPost} isOp />
          {thread.posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          {thread.posts.length === 0 && (
            <div className="px-5 py-8 text-center font-ui text-sm text-navy-700">
              No replies yet — be the first.
            </div>
          )}
        </div>

        {/* Reply form */}
        <div className="bg-parchment-100 border border-parchment-400 rounded-xl p-5">
          <h2 className="font-ui text-sm font-semibold text-navy-900 tracking-tight mb-4">Reply</h2>
          <form onSubmit={handleReply} className="flex flex-col gap-3">
            <textarea
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              rows={4}
              className="w-full bg-parchment-50 border border-parchment-400 rounded-lg px-3 py-2.5 font-ui text-sm text-navy-900 focus:outline-none focus:border-navy-900 transition-colors resize-none"
              placeholder="Share your thoughts…"
            />

            <label className="flex items-center gap-3 font-ui text-sm text-navy-800 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={replyAnon}
                onChange={(e) => setReplyAnon(e.target.checked)}
                className="w-4 h-4 rounded border-parchment-500 accent-navy-900"
              />
              Reply anonymously
            </label>

            {replyError && (
              <p className="font-ui text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {replyError}
              </p>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={replying || !replyBody.trim()}
                className="px-4 py-2 rounded-lg bg-navy-900 text-parchment-50 font-ui text-sm font-medium hover:bg-navy-900/90 disabled:opacity-50 transition-colors"
              >
                {replying ? "Posting…" : "Post reply"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
