import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Webpack optimization
  webpack: (config, { dev, isServer }) => {
    // Production optimization
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors",
              priority: -10,
              chunks: "all",
            },
            // Seperates chunks for big libs
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              name: "react",
              chunks: "all",
              priority: 20,
            },
            dndkit: {
              test: /[\\/]node_modules[\\/]@dnd-kit[\\/]/,
              name: "dndkit",
              chunks: "all",
              priority: 15,
            },
          },
        },
      };
    }

    // Bundle analyzer
    if (process.env.ANALYZE === "true") {
      const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: "server",
          openAnalyzer: true,
        })
      );
    }

    return config;
  },

  // Expremental func
  experimental: {
    // Optimized JS bundling
    optimizePackageImports: [
      "@dnd-kit/core",
      "@dnd-kit/sortable",
      "@dnd-kit/utilities",
    ],
  },

  // Compiling optimization
  compiler: {
    // Dead code elimination
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Optimized images
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rgovnbwjyfeqtiaucemw.supabase.co",
        pathname: "/**",
      },
    ],
  },

  // Headers and caching
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
      {
        source: "/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // Poweredby header elimination
  poweredByHeader: false,

  // Optimized tracing
  output: process.env.NODE_ENV === "production" ? "standalone" : undefined,

  reactStrictMode: true,
};

export default nextConfig;
