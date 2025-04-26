"use client";

import { useTranslations } from "next-intl";


const MacNotFound = () => {
  const t = useTranslations();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">403</h1>
        <p className="text-xl text-gray-600 mb-4">{t("Oops! SN not found")}</p>
      </div>
    </div>
  );
};

export default MacNotFound;
