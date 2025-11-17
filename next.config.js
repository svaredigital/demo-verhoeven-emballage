/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  
  // Reduce build output
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  
  // Production environment settings
  env: {
    NEXT_PUBLIC_APP_ENV: 'production',
  },
}

module.exports = nextConfig