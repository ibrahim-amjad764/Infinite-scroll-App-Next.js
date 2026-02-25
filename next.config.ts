import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },

  // **Webpack Customization (if needed)**
  webpack: (config, { dev }) => {
    if (dev) {
      console.log("[next.config.js] Using Webpack instead of Turbopack for development");
    }
    return config;
  },
};

export default nextConfig;