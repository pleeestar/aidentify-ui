import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*experimental: {
    serverExternalPackages: ['zustand'],
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false, // クライアントサイドでcanvasを無効化
    };
    return config;
  },*/
  serverActions: {
    bodySizeLimit: '10mb', // Increase to 10 MB (adjust as needed)
  },
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Increase for API routes
    },
  },
};

export default nextConfig;
