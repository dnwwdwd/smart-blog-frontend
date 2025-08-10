import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Enable experimental features that might help with hydration
    optimizePackageImports: ['@ant-design/pro-components', 'antd'],
  },
  // Disable SSR for specific pages if needed
  // This can be an alternative approach
  transpilePackages: ['@ant-design/pro-components', 'antd'],
};

export default nextConfig;
