"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setError("");
    setLoading(true);
    try {
      await register(email, password);
      router.push("/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-60px)] bg-parchment-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="inline-flex w-10 h-10 rounded-xl bg-navy-900 text-parchment-50 items-center justify-center font-hebrew text-2xl mb-4" lang="he">א</span>
          <h1 className="font-heading text-2xl font-normal tracking-tight text-navy-900">Begin your journey</h1>
          <p className="font-ui text-sm text-navy-700 mt-1">Create your Convertme account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-parchment-100 border border-parchment-400 rounded-2xl p-7 flex flex-col gap-4">
          <div>
            <label className="font-ui text-xs uppercase tracking-[0.1em] text-navy-700 block mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="w-full bg-parchment-50 border border-parchment-400 rounded-lg px-3 py-2.5 font-ui text-sm text-navy-900 placeholder-navy-600 focus:outline-none focus:border-navy-900 transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="font-ui text-xs uppercase tracking-[0.1em] text-navy-700 block mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-parchment-50 border border-parchment-400 rounded-lg px-3 py-2.5 font-ui text-sm text-navy-900 placeholder-navy-600 focus:outline-none focus:border-navy-900 transition-colors"
              placeholder="At least 8 characters"
            />
          </div>

          {error && (
            <p className="font-ui text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-navy-900 text-parchment-50 font-ui text-sm font-medium hover:bg-navy-900/90 disabled:opacity-50 transition-colors"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-center font-ui text-sm text-navy-700 mt-5">
          Already have an account?{" "}
          <Link href="/login" className="text-navy-900 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
