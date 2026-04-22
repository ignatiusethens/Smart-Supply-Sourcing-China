import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Prefer modern formats for smaller file sizes
    formats: ['image/avif', 'image/webp'],
    // Responsive image sizes matching our breakpoints
    deviceSizes: [640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Minimise layout shift with lazy loading by default
    minimumCacheTTL: 60,
  },
  serverExternalPackages: ['pg'], // For PostgreSQL
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  },
  // Compress responses
  compress: true,
  // Power-user: enable React strict mode for catching issues early
  reactStrictMode: true,
  // Reduce JS bundle size by removing console.* in production
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? { exclude: ['error', 'warn'] }
        : false,
  },
};

export default nextConfig;
