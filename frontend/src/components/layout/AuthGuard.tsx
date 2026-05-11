"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, onboardingComplete } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push(`/login?from=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!onboardingComplete) {
      router.push("/onboarding");
    }
  }, [user, loading, onboardingComplete, router, pathname]);

  if (loading || !user || !onboardingComplete) return null;
  return <>{children}</>;
}
