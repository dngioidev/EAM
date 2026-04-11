/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    WIKI_PATH: process.env.WIKI_PATH ?? '../wiki',
  },
};

module.exports = nextConfig;
