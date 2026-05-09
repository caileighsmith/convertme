import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { LocationProvider } from "@/context/LocationContext";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "ConvertMe — Your Journey to Judaism",
  description:
    "A beautiful guide for people converting to Judaism. Follow daily prayers word by word, with Ashkenazi transliteration and English meanings.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <LocationProvider>
            <Navbar />
            <div className="flex-1">{children}</div>
          </LocationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
