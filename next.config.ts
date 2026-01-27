import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb", // Set your desired limit (e.g., 10MB)
    },
  },
  images: {
    domains: ["freetire.s3.eu-north-1.amazonaws.com"],
  },
};
const withNextIntl = createNextIntlPlugin();

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

export default withPWA(withNextIntl(nextConfig));
nextConfig;
