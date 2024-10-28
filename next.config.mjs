// /** @type {import('next').NextConfig} */
// const nextConfig = {};

// export default nextConfig;

import withPWA from "next-pwa";

export default withPWA({
  dest: "public",
  sw: "synthetizer/worklet_processor.min.js",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});
