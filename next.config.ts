import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb", // Set your desired limit (e.g., 10MB)
    },
  },
};

export default nextConfig;
