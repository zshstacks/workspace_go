// client/next.config.ts
import type { NextConfig } from "next";
import webpack from "webpack";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";

const nextConfig: NextConfig = {
  webpack: (
    config: webpack.Configuration,
    { dev, isServer }: { dev: boolean; isServer: boolean }
  ) => {
    // config.plugins tipa nodrošināšana
    config.plugins = config.plugins || [];

    // Docker hot reload configuration for development
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      };
    }

    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            default: { minChunks: 2, priority: -20, reuseExistingChunk: true },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors",
              priority: -10,
              chunks: "all",
            },
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

    if (process.env.ANALYZE === "true") {
      // BundleAnalyzerPlugin implementē WebpackPluginInstance
      config.plugins.push(
        new BundleAnalyzerPlugin() as unknown as webpack.WebpackPluginInstance
      );
    }

    return config;
  },

  experimental: {
    optimizePackageImports: [
      "@dnd-kit/core",
      "@dnd-kit/sortable",
      "@dnd-kit/utilities",
    ],
  },

  compiler: { removeConsole: process.env.NODE_ENV === "production" },

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

  // Configure for containerized environment
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        }/api/:path*`,
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
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

  // Environment variables validation
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // Disable telemetry
  telemetry: {
    enabled: false,
  },

  poweredByHeader: false,
  output: process.env.NODE_ENV === "production" ? "standalone" : undefined,
  reactStrictMode: true,
};

export default nextConfig;
