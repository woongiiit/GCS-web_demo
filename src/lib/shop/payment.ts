const PORTONE_API_BASE_URL = 'https://api.iamport.kr'

type PortOneAccessToken = {
  token: string
  expiresAt: number
}

type PortOnePayment = {
  imp_uid: string
  merchant_uid: string
  amount: number
  currency?: string
  status: string
  pay_method: string
  card_name?: string
  buyer_name?: string
  buyer_email?: string
  buyer_tel?: string
  receipt_url?: string
  paid_at?: number
  [key: string]: unknown
}

let cachedToken: PortOneAccessToken | null = null

export async function getPortOnePayment(impUid: string): Promise<PortOnePayment> {
  const accessToken = await getAccessToken()

  const response = await fetch(`${PORTONE_API_BASE_URL}/payments/${impUid}`, {
    headers: {
      Authorization: accessToken
    },
    cache: 'no-store'
  })

  const data = await response.json()

  if (data.code !== 0) {
    throw new Error(data.message || '포트원 결제 조회에 실패했습니다.')
  }

  if (!data.response) {
    throw new Error('포트원 결제 데이터가 비어있습니다.')
  }

  return data.response as PortOnePayment
}

export async function cancelPortOnePayment(impUid: string, reason: string, amount?: number) {
  try {
    const accessToken = await getAccessToken()
    const body: Record<string, unknown> = {
      imp_uid: impUid,
      reason
    }

    if (typeof amount === 'number' && !Number.isNaN(amount)) {
      body.amount = amount
    }

    const response = await fetch(`${PORTONE_API_BASE_URL}/payments/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: accessToken
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()
    if (data.code !== 0) {
      console.warn('포트원 결제 취소 실패:', data.message)
    }
  } catch (error) {
    console.error('포트원 결제 취소 요청 중 오류:', error)
  }
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 10_000) {
    return cachedToken.token
  }

  const apiKey = process.env.PORTONE_API_KEY
  const apiSecret = process.env.PORTONE_API_SECRET

  if (!apiKey || !apiSecret) {
    throw new Error('PORTONE API 자격 증명이 설정되지 않았습니다.')
  }

  const response = await fetch(`${PORTONE_API_BASE_URL}/users/getToken`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      imp_key: apiKey,
      imp_secret: apiSecret
    })
  })

  const data = await response.json()

  if (data.code !== 0) {
    throw new Error(data.message || '포트원 액세스 토큰 발급에 실패했습니다.')
  }

  const token = data.response?.access_token
  const expiredAt = data.response?.expired_at

  if (!token || !expiredAt) {
    throw new Error('포트원 액세스 토큰 응답이 올바르지 않습니다.')
  }

  cachedToken = {
    token,
    expiresAt: expiredAt * 1000
  }

  return token
}

