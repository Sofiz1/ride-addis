/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  poweredByHeader: false,
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    // Keep icon imports tree-shaken down to the symbols we actually use.
    optimizePackageImports: ['lucide-react'],
  },
  async headers() {
    return [
      {
        // Long-lived immutable caching for committed media.
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico|woff2)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/uploads/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ]
  },
}

export default nextConfig
