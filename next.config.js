/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "X-CSRF-Token, X-Requested-With, Authorization",
          }
        ]
      }
    ]
  },

  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Only proxy non-auth API requests
  async rewrites() {
    // Provide fallback for NEXT_PUBLIC_API_BASE_URL if it's undefined
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://www.radaprojo.live';
    
    return [
      // First rule: Don't rewrite NextAuth routes
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*',
      },
      // Second rule: Rewrite all other API routes to the backend
      {
        source: '/api/:path*',
        destination: `${apiBaseUrl}/:path*`,
      },
    ];
  },

  images: {
    unoptimized: true,
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
