import { NextResponse } from 'next/server'

export async function GET() {
  const merchantCode =
    process.env.NEXT_PUBLIC_PORTONE_MERCHANT_CODE ?? process.env.PORTONE_MERCHANT_CODE ?? ''
  const pgId = process.env.NEXT_PUBLIC_PORTONE_PG_ID ?? process.env.PORTONE_PG_ID ?? ''
  const billingPgId =
    process.env.NEXT_PUBLIC_PORTONE_BILLING_PG_ID ?? process.env.PORTONE_BILLING_PG_ID ?? ''
  const channelKey =
    process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY ?? process.env.PORTONE_CHANNEL_KEY ?? ''

  if (!merchantCode || !pgId) {
    return NextResponse.json(
      {
        success: false,
        error: '포트원 결제 설정(merchant code 또는 PG ID)이 누락되었습니다.',
        data: {
          hasMerchantCode: Boolean(merchantCode),
          hasPgId: Boolean(pgId),
          hasChannelKey: Boolean(channelKey || billingPgId)
        }
      },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    data: {
      merchantCode,
      pgId,
      billingPgId: billingPgId || null,
      channelKey: channelKey || null
    }
  })
}

