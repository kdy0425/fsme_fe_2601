const nextConfig = {
  reactStrictMode: false,
  productionBrowserSourceMaps: true, // 프로덕션 빌드에서 소스맵 생성
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // 개발 환경에서 클라이언트 및 서버 사이드 소스맵 활성화
      config.devtool = 'eval-source-map'
    }
    return config
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api-search/:path*', // 클라이언트에서 호출하는 경로
        destination: `${process.env.NEXT_PUBLIC_SEARCH_API_DOMAIN}/:path*`, // 실제 API 경로
      },
    ];
  },
}

export default nextConfig
