import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Providers } from "./providers";
import PaperFilters from "./_components/paper/_filters";
import { paperFontVariables } from "@/lib/paper-fonts";
import { readLedgerSettings, settingsToHtmlAttrs } from "@/lib/settings";
import "./globals.css";

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
      className={`${paperFontVariables} h-full antialiased`}
      {...settingsToHtmlAttrs(settings)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <PaperFilters />
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
