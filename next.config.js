/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@coinbase/wallet-sdk'],

  webpack: (config) => {
    // Explicitly mark the worker as a module
    config.module.rules.push({
      test: /HeartbeatWorker\.js$/,
      include: /node_modules\/@coinbase\/wallet-sdk/,
      type: 'javascript/esm', // ← Treat file as ESM
    });

    return config;
  },
};

module.exports = nextConfig;
