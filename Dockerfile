FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Rebuild the source code only when needed
FROM base AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules

# Copy package files first
COPY package.json package-lock.json* ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code including Prisma schema
COPY . .

# Generate Prisma Client (binary targets are set in schema.prisma)
RUN npx prisma generate

# Build the application
RUN npm run build

# Verify Next.js is available
RUN npx next --version

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public directory if it exists
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# standalone 빌드를 먼저 복사
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prisma Client는 standalone 빌드에 포함되지 않으므로 별도로 복사
# standalone의 node_modules 위에 복사하여 Prisma Client를 사용 가능하게 함
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma

# 마이그레이션 실행을 위한 스크립트 복사
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/package-lock.json* ./package-lock.json

# 마이그레이션 실행 스크립트 생성
RUN echo '#!/bin/sh\nset -e\nif [ -n "$DATABASE_URL" ]; then\n  echo "Running database migrations..."\n  npx prisma migrate deploy || echo "Migration failed, continuing..."\nelse\n  echo "DATABASE_URL not set, skipping migrations"\nfi\nexec node server.js' > /app/start.sh && chmod +x /app/start.sh && chown nextjs:nodejs /app/start.sh

USER nextjs

EXPOSE 3000

ENV HOSTNAME "0.0.0.0"
ENV PORT 3000
# Railway가 런타임에 PORT 환경 변수를 설정하면 자동으로 사용됨
# Next.js standalone server.js는 process.env.PORT를 우선적으로 읽습니다

CMD ["/app/start.sh"]
