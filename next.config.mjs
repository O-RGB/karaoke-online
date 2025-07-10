import withPWA from "@ducanh2912/next-pwa";

const pwaConfig = withPWA({
  dest: "public",
  sw: "/synthetizer/worklet_processor.min.js",
  customWorkerSrc: "/synthetizer/worklet_processor.min.js",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: "NetworkFirst",
      options: {
        cacheName: "offlineCache",
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 24 * 60 * 60,
        },
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_REMOTE_HOST: process.env.NEXT_PUBLIC_REMOTE_HOST,
    NEXT_PUBLIC_PYTHON_API_SERVER: process.env.NEXT_PUBLIC_PYTHON_API_SERVER,
  },
};

export default {
  ...pwaConfig,
  ...nextConfig,
};
