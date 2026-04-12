/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    WIKI_PATH:  process.env.WIKI_PATH  ?? '../wiki',
    WIKI_DB:    process.env.WIKI_DB    ?? '../wiki.db',
  },
  // better-sqlite3 is a native Node module — must not be bundled by webpack
  serverExternalPackages: ['better-sqlite3'],
};

module.exports = nextConfig;
