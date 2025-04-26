import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb", // Set your desired limit (e.g., 10MB)
    },
  },
};
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);nextConfig;
