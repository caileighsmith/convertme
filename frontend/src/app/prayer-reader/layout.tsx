// Prayer reader gets its own layout so the Footer doesn't render —
// it's a full-height immersive reading UI.
export default function PrayerReaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
