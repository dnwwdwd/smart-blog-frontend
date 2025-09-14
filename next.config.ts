import type { NextConfig } from "next";

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
    const isProd = process.env.NODE_ENV === 'production';
    const backend = isProd
      ? 'http://blogbackend.hejiajun.icu'
      : (process.env.NEXT_PUBLIC_API_TARGET || 'http://localhost:8888');
    return [
      {
        source: '/api/:path*',
        destination: `${backend}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
