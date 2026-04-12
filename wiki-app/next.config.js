/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // better-sqlite3 is a native Node module — must not be bundled by webpack
  serverExternalPackages: ['better-sqlite3'],
};

module.exports = nextConfig;
