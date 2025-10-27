import type { NextConfig } from "next";
import { apiServerTarget } from "./config/apiConfig";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['@ant-design/pro-components', 'antd'],
  },
  transpilePackages: ['@ant-design/pro-components', 'antd'],
  output: 'standalone',
  // 忽略 ESLint 检查
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 忽略 TypeScript 构建错误
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiServerTarget}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
