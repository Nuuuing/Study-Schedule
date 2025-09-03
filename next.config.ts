/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  optimizePackageImports: ["@chakra-ui/react"]
};
export default nextConfig;