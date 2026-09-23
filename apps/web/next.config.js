/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.NEXT_OUTPUT_STANDALONE === 'true' ? 'standalone' : (process.platform === 'win32' ? undefined : 'standalone'),
  transpilePackages: [
    '@nirmaanify/api-client',
    '@nirmaanify/ui',
    '@nirmaanify/icons',
    '@nirmaanify/design-tokens',
    '@nirmaanify/types',
  ],
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:4000/api/v1/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
