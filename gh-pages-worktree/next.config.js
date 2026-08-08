/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  basePath: '/women-in-chess-analysis',
  assetPrefix: '/women-in-chess-analysis/',
  images: { unoptimized: true },
};

module.exports = nextConfig;
