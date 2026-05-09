import type { Metadata } from "next";
import { PrayerReader } from "@/components/prayer-reader/PrayerReader";

export const metadata: Metadata = {
  title: "Prayer Reader — ConvertMe",
  description: "Follow along with daily Jewish prayers word by word. Shacharit, Mincha, and Maariv with Ashkenazi transliteration and English meanings.",
};

export default function PrayerReaderPage() {
  return <PrayerReader />;
}
