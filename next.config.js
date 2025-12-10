/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    NEXT_PUBLIC_TINYMCE_API_KEY: process.env.NEXT_PUBLIC_TINYMCE_API_KEY,
  },
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1년
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    // optimizeCss: true, // Railway에서 critters 모듈 오류로 인해 비활성화
  },
  compress: true,
  // Prisma Client를 standalone 빌드에 포함시키기 위한 설정
  // Next.js 14.2.33에서는 webpack 설정으로 처리
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Prisma Client를 externals에서 제외하여 번들에 포함
      if (Array.isArray(config.externals)) {
        config.externals = config.externals.filter((external) => {
          if (typeof external === 'string') {
            return !external.includes('@prisma/client')
          }
          return true
        })
      }
    }
    return config
  },
}

module.exports = nextConfig
