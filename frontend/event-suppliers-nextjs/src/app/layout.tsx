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
      <body
        className="min-h-full flex flex-col text-slate-900"
        style={{
          backgroundImage: "url('/background-1.png'), url('/background-2.png')",
          backgroundSize: "cover",
          backgroundPosition: "top center",
          backgroundRepeat: "no-repeat",
        }}
        suppressHydrationWarning
      >
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
