// Suppress footer for immersive session experience — same pattern as /prayer-reader
import type { ReactNode } from 'react';

export default function FluencyLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
