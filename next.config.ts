import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
    ],
  },
  eslint: {
    // Allow production builds to successfully complete even if there are ESLint errors.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
