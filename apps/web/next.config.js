/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@nirmaanify/api-client',
    '@nirmaanify/ui',
    '@nirmaanify/icons',
    '@nirmaanify/design-tokens',
    '@nirmaanify/types',
  ],
};

module.exports = nextConfig;
