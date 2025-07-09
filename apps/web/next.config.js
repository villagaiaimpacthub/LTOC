/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@ltoc/database', '@ltoc/ui', '@ltoc/utils'],
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['localhost', 'avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
  },
}

module.exports = nextConfig