"use client";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function LanguageSwitcher() {
  const router = useRouter();

  function changeLocale(locale: string) {
    Cookies.set("NEXT_LOCALE", locale);
    router.refresh(); // Re-render page with new locale
  }

  return (
    <div>
      <button onClick={() => changeLocale("en")}>English</button>
      <button onClick={() => changeLocale("ar")}>العربية</button>
    </div>
  );
}
