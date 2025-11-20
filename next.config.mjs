/** @type {import('next').NextConfig} */

// ⚡ PHASE 3: Bundle Analyzer Configuration
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  // ============================================
  // COMPILER OPTIMIZATIONS
  // ============================================
  compiler: {
    // Remove console.log in production (reduces bundle size)
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // ⚡ PHASE 3: Experimental Optimizations
  experimental: {
    // Optimize package imports (reduces bundle size)
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', '@radix-ui/react-dialog'],
  },

  // ============================================
  // OUTPUT OPTIMIZATION
  // ============================================
  // Standalone output reduces deployment size by 80%
  output: 'standalone',

  // Enable Gzip/Brotli compression (reduces file size by 60-80%)
  compress: true,

  // ⚡ PHASE 3: Webpack Optimization
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Vendor chunk
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20
          },
          // Common chunk
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true
          }
        }
      }
    }
    return config
  },

  // ============================================
  // CACHING & SECURITY HEADERS
  // ============================================
  async headers() {
    return [
      // Dashboard pages - NO CACHING (always fresh)
      {
        source: '/dashboard/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
        ],
      },
      // ✅ UPDATED: Blog posts - cache for 1 minute in production, NO cache in development
      {
        source: '/blog/:slug',
        headers: [
          {
            key: 'Cache-Control',
            value: process.env.NODE_ENV === 'development'
              ? 'no-store, no-cache, must-revalidate' // Development: always fresh
              : 's-maxage=60, stale-while-revalidate=120', // Production: 1 min cache, 2 min stale
          },
        ],
      },
      // ✅ UPDATED: Categories - cache for 1 minute in production, NO cache in development
      {
        source: '/category/:slug',
        headers: [
          {
            key: 'Cache-Control',
            value: process.env.NODE_ENV === 'development'
              ? 'no-store, no-cache, must-revalidate' // Development: always fresh
              : 's-maxage=60, stale-while-revalidate=120', // Production: 1 min cache, 2 min stale
          },
        ],
      },
      // ✅ UPDATED: Homepage - cache for 1 minute in production, NO cache in development
      {
        source: '/',
        headers: [
          {
            key: 'Cache-Control',
            value: process.env.NODE_ENV === 'development'
              ? 'no-store, no-cache, must-revalidate' // Development: always fresh
              : 's-maxage=60, stale-while-revalidate=120', // Production: 1 min cache, 2 min stale
          },
        ],
      },
      // ============================================
      // SECURITY HEADERS (All pages)
      // ============================================
      {
        source: '/:path*',
        headers: [
          // Enables DNS prefetch for faster external resource loading
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          // Prevents your site from being embedded in iframes (clickjacking protection)
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          // Prevents MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // Enables browser XSS protection
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          // Controls how much referrer information is sent
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          // Permissions Policy - restricts browser features
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
        ],
      },
    ]
  },

  // ============================================
  // IMAGE OPTIMIZATION
  // ============================================
  images: {
    // Allow images from these domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'drive.google.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        pathname: '/**',
      },
    ],

    // Image formats - AVIF is 30% smaller than WebP, WebP is 30% smaller than JPEG
    formats: ['image/avif', 'image/webp'],

    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],

    // Image sizes for different breakpoints
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default withBundleAnalyzer(nextConfig);
