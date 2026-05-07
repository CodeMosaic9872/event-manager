import type { Metadata } from "next";
import { Assistant } from "next/font/google";
import "./globals.css";
import { Providers } from "@/store/providers";
import { MainNav } from "@/shared/components/main-nav";

const assistant = Assistant({
  variable: "--font-assistant",
  subsets: ["hebrew", "latin"],
});

export const metadata: Metadata = {
  title: "ספקים לאירועים",
  description: "פלטפורמת מרקטפלייס חכמה למציאת ספקים לאירועים",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={`${assistant.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900" suppressHydrationWarning>
        <Providers>
          <MainNav />
          <main className="flex w-full flex-1 flex-col">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
