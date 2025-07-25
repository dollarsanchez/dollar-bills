/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  typescript: {
    // เปิดใช้ TypeScript checking
    ignoreBuildErrors: false,
  },
  eslint: {
    // เปิดใช้ ESLint checking
    ignoreDuringBuilds: false,
  },
  images: {
    // กำหนดค่าสำหรับ Image optimization (ถ้าจำเป็น)
    domains: [],
  },
}

module.exports = nextConfig