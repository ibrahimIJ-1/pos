"use client";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { FormControl } from "../ui/form";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { setUserLanguage } from "@/actions/users/language";

export default function LanguageSwitcher() {
  const t = useTranslations();
  const [locale, setLocale] = useState(Cookies.get("NEXT_LOCALE") ?? "en");
  const router = useRouter();

  async function changeLocale(locale: string) {
    Cookies.set("NEXT_LOCALE", locale);
    setLocale(locale);
    await setUserLanguage(locale)
    router.refresh(); // Re-render page with new locale
  }

  return (
    <div>
      <Select onValueChange={changeLocale} defaultValue={locale}>
        <SelectTrigger>
          <SelectValue placeholder={t("Select language")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="ar">العربية</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
