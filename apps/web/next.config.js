/** @type {import('next').NextConfig} */
const nextConfig = {
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
