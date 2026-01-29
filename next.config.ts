// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
     domains: ["images.unsplash.com", "plus.unsplash.com", "github.com", ], // Add all domains you will use
  },
};

module.exports = nextConfig;
