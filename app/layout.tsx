import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/providers/AppProviders";
import { Toaster } from "sonner";
import { getMessages, getLocale } from "next-intl/server";
import LocaleProvider from "@/providers/locale-provider";
import { NextIntlClientProvider } from "next-intl";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flash-PRO",
  description: "POS & store management",
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html
      lang={locale ?? "ar"}
      suppressHydrationWarning
      dir={locale == "ar" ? "rtl" : "ltr"}
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased neon-card`}
      >
        <NextIntlClientProvider locale={locale}>
          <AppProviders>
            <div className="dark:bg-black">{children}</div>
          </AppProviders>
          <Toaster richColors />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
