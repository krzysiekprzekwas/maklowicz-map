/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/maklowicz-map',
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
}

module.exports = nextConfig 