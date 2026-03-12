/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: [
    "@prisma/client",
    "@prisma/adapter-mariadb",
    "prisma",
    "mariadb",
  ],
}

export default nextConfig
