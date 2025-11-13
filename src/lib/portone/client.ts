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

  cachedClient = PortOneClient({
    secret,
    baseUrl: process.env.PORTONE_API_BASE_URL || undefined,
    storeId: process.env.PORTONE_STORE_ID || undefined
  })

  return cachedClient
}

