import { getRequestConfig } from "next-intl/server";
import Cookies from "js-cookie";
import { getUserLanguage } from "@/actions/users/language";

export default getRequestConfig(async () => {
  // Provide a static locale, fetch a user setting,
  // read from `cookies()`, `headers()`, etc.
  let locale = "en";
  try {
    locale = (await getUserLanguage()) ?? "en";
  } catch (error) {
    locale = "en";
  }
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
