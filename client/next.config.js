/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    NEXT_PUBLIC_ZEGO_APP_ID: 868068456,
    NEXT_PUBLIC_ZEGO_SERVER_ID: "3f17e297488de082fa69d331f5d6fe66",
  },
  images: {
    domains: ["localhost"],
  },
};

module.exports = nextConfig;
