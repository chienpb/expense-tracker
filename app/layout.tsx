import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Providers } from "./providers";
import { paperFontVariables } from "@/lib/paper-fonts";
import { readLedgerSettings, settingsToHtmlAttrs } from "@/lib/settings";
import "./globals.css";

// Geist is kept loaded through Phase 5 so shadcn chrome using
// `font-sans` / `font-mono` renders as designed while we migrate
// page by page. Once every Swiss page is gone, remove both imports.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ledger",
  description:
    "A paper ledger for daily expenses — kept in ink, stamped when settled.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await readLedgerSettings();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${paperFontVariables} h-full antialiased`}
      {...settingsToHtmlAttrs(settings)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          value={{ light: "day", dark: "night" }}
          enableSystem
          disableTransitionOnChange
        >
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
