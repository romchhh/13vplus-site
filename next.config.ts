import type { NextConfig } from "next";

// Bundle analyzer
import bundleAnalyzer from "@next/bundle-analyzer";  // Use import statement

// Bundle analyzer
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
    formats: ["image/webp", "image/avif"],
    // Optimized device sizes for mobile-first
    deviceSizes: [320, 420, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  },
  // Enable compression
  compress: true,
  // Remove X-Powered-By header
  poweredByHeader: false,
  // Optimize trailing slash
  trailingSlash: false,
  // External packages for server components
  serverExternalPackages: ["pg"],
  // Optimize JS/CSS output
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb", // for images, videos
      // Allow external origins for webhooks
      allowedOrigins: ["secure.wayforpay.com", "plisio.net"],
    },
    // Enable optimized package imports with tree shaking
    optimizePackageImports: [
      "@react-jvectormap/core", 
      "swiper", 
      "react-apexcharts",
      "web-vitals"
    ],
    // Modern bundling
    esmExternals: true,
    // Note: optimizeCss requires 'critters' package - disabled for now
    // optimizeCss: true,
  },
  // Production optimizations
  productionBrowserSourceMaps: false,
  // Advanced Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Tree shaking optimization
    config.optimization.usedExports = true;
    config.optimization.sideEffects = false;
    
    // Optimize bundle size
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          default: false,
          vendors: false,
          // Framework chunk (React, Next.js)
          framework: {
            name: 'framework',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
            priority: 40,
            enforce: true,
          },
          // Vendor chunk
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /[\\/]node_modules[\\/]/,
            priority: 20,
            enforce: true,
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
      };
      
      // Minimize bundle
      config.optimization.minimize = true;
    }
    
    return config;
  },
  // Headers for better caching and performance
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/api/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on"
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block"
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN"
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin"
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()"
          }
        ]
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=60, stale-while-revalidate=300"
          }
        ]
      }
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
