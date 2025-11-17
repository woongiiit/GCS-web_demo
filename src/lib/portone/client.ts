import { PortOneClient, type PortOneClient as PortOneSDKClient } from '@portone/server-sdk'

let cachedClient: PortOneSDKClient | null = null

export function getPortOneClient(): PortOneSDKClient {
  if (cachedClient) return cachedClient

  const secret =
    process.env.PORTONE_API_SECRET ??
    process.env.PORTONE_V2_API_SECRET ??
    process.env.PORTONE_SECRET

  if (!secret) {
    throw new Error(
      'PORTONE_API_SECRET 환경 변수가 설정되지 않았습니다. 포트원 v2 API 시크릿을 설정해주세요.'
    )
  }

  const storeId =
    process.env.PORTONE_STORE_ID ??
    process.env.NEXT_PUBLIC_PORTONE_STORE_ID ??
    undefined

  console.log('PortOne 클라이언트 초기화:', {
    hasSecret: !!secret,
    secretLength: secret.length,
    storeId: storeId || 'not set',
    baseUrl: process.env.PORTONE_API_BASE_URL || 'default'
  })

  cachedClient = PortOneClient({
    secret,
    baseUrl: process.env.PORTONE_API_BASE_URL || undefined,
    storeId: storeId || undefined
  })

  return cachedClient
}

