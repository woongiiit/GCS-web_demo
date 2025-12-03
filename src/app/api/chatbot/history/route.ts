import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// 동적 렌더링 강제 설정
export const dynamic = 'force-dynamic'

// 챗봇 사용 기록 저장
export async function POST(request: Request) {
  try {
    // 인증 확인 (선택사항 - 비로그인 사용자도 사용 가능)
    let userId: string | null = null
    try {
      const user = await getCurrentUser()
      if (user) {
        userId = user.id
      }
    } catch (error) {
      // 인증 실패해도 계속 진행 (비로그인 사용자 허용)
    }

    const body = await request.json()
    const { optionId, question, response, metadata } = body

    // 옵션 ID가 제공된 경우 유효성 검사
    if (optionId) {
      const option = await prisma.chatBotOption.findUnique({
        where: { id: optionId }
      })

      if (!option) {
        return NextResponse.json(
          {
            success: false,
            error: '유효하지 않은 옵션입니다.'
          },
          { status: 400 }
        )
      }
    }

    // 히스토리 저장
    const history = await prisma.chatBotHistory.create({
      data: {
        userId: userId || null,
        optionId: optionId || null,
        question: question || null,
        response: response || null,
        metadata: metadata || null
      }
    })

    return NextResponse.json({
      success: true,
      data: history
    })
  } catch (error: any) {
    console.error('챗봇 히스토리 저장 오류:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: '서버 오류가 발생했습니다.'
      },
      { status: 500 }
    )
  }
}



