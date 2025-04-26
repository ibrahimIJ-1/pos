import { getRequestConfig } from "next-intl/server";
import Cookies from "js-cookie";
import { getUserLanguage } from "@/actions/users/language";

export default getRequestConfig(async () => {
  // Provide a static locale, fetch a user setting,
  // read from `cookies()`, `headers()`, etc.

  const locale = (await getUserLanguage()) ?? "en";

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
