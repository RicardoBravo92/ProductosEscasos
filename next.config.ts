import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'res.cloudinary.com',
      // ... otros dominios si existen ...
    ],
  },
};

export default nextConfig;
