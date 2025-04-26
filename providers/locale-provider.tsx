"use client";

import { useLocale, NextIntlClientProvider } from "next-intl";
import { ReactNode } from "react";
import { useMessages } from "next-intl";

export default function LocaleProvider({ children }: { children: ReactNode }) {
  const locale = useLocale();

  return (
    <NextIntlClientProvider messages={{}} locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
}
