/** @type {import('next').NextConfig} */
const nextConfig = {
  // TypeScript errors are now caught at build time (no more silent failures)
  images: {
    unoptimized: true,
  },
}

export default nextConfig
