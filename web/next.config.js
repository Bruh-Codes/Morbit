/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(process.env.STATIC_EXPORT === 'true' ? { output: 'export' } : {}),
  trailingSlash: true,

  experimental: {
    optimizePackageImports: ['@tanstack/react-query'],
  },

  transpilePackages: ['@mui/material', '@mui/icons-material', '@mui/lab'],

  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

module.exports = nextConfig;
