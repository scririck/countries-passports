/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  cssLoaderOptions: {
    url: false
  }
}

module.exports = nextConfig;
