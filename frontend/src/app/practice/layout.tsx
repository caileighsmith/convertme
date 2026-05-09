import { AuthGuard } from "@/components/layout/AuthGuard";

export default function PracticeLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
