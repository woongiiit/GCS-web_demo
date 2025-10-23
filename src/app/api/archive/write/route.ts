import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { permissions, permissionErrors } from '@/lib/permissions'
import { invalidateCache } from '@/lib/cache'

export async function POST(request: Request) {
  try {
    // 인증 확인 및 사용자 정보 가져오기
    const user = await requireAuth()

    // 글 작성 권한 확인 (ADMIN만 - Archive는 관리자 전용)
    if (!permissions.canWriteArchive(user.role as any)) {
      return NextResponse.json(
        { error: 'Archive 글 작성 권한이 없습니다.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, content, type, year, members, images, isFeatured } = body

    // 유효성 검사
    if (!title || !content || !type || !year) {
      return NextResponse.json(
        { error: '필수 항목을 입력해주세요.' },
        { status: 400 }
      )
    }

    // 타입에 따라 Project 또는 News 생성
    if (type === 'project') {
      const project = await prisma.project.create({
        data: {
          title,
          description: content.substring(0, 200), // 첫 200자를 요약으로
          content,
          year: parseInt(year),
          teamMembers: members ? members.split(',').map((m: string) => m.trim()) : [],
          technologies: [],
          images: images || [],
          isFeatured: isFeatured || false,
          authorId: user.id,
        }
      })

      // Archive Projects 캐시 무효화
      invalidateCache('projects:.*')

      return NextResponse.json(
        { 
          success: true, 
          message: '프로젝트가 성공적으로 등록되었습니다.',
          data: project 
        },
        { status: 201 }
      )
    } else if (type === 'news') {
      const news = await prisma.news.create({
        data: {
          title,
          content,
          summary: content.substring(0, 200), // 첫 200자를 요약으로
          year: parseInt(year),
          images: images || [],
          isFeatured: isFeatured || false,
          authorId: user.id,
        }
      })

      // Archive News 캐시 무효화
      invalidateCache('news:.*')

      return NextResponse.json(
        { 
          success: true, 
          message: '뉴스가 성공적으로 등록되었습니다.',
          data: news 
        },
        { status: 201 }
      )
    } else {
      return NextResponse.json(
        { error: '잘못된 타입입니다.' },
        { status: 400 }
      )
    }

  } catch (error: any) {
    console.error('Archive 글 작성 오류:', error)
    
    if (error.message === '로그인이 필요합니다') {
      return NextResponse.json(
        { error: permissionErrors.notLoggedIn },
        { status: 401 }
      )
    }
    
    if (error.message === '권한이 부족합니다') {
      return NextResponse.json(
        { error: permissionErrors.insufficientPermission },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

