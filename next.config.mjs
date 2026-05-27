/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.imgchest.com" },
      { protocol: "https", hostname: "cdn.imgchest.com" },
    ],
  },
};
export default nextConfig;
