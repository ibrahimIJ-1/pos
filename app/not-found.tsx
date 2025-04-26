"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";

const NotFound = () => {
const t = useTranslations();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">
          {t("Oops! Page not found")}
        </p>
        <Link href="/" className="text-blue-500 hover:text-blue-700 underline">
          {t("Return to Home")}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
