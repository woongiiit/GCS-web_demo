import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { permissions } from '@/lib/permissions'
import { invalidateCache } from '@/lib/cache'

// 프로젝트 상세 조회
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id

    // 프로젝트 조회
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true,
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: '프로젝트를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { 
        success: true, 
        data: project 
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('프로젝트 조회 오류:', error)
    
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 프로젝트 수정
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id
    const user = await requireAuth()

    // 프로젝트 존재 여부 및 작성자 확인
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true,
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: '프로젝트를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 수정 권한 확인
    if (!permissions.canEditPost(user.role as any, project.authorId, user.id)) {
      return NextResponse.json(
        { error: '수정 권한이 없습니다.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, content, year, members, images, isFeatured } = body

    // 유효성 검사
    if (!title || !content) {
      return NextResponse.json(
        { error: '필수 항목을 입력해주세요.' },
        { status: 400 }
      )
    }

    // 프로젝트 수정
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        title,
        description: content,
        year: parseInt(year),
        members: members || '',
        images: images || [],
        isFeatured: isFeatured || false
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true,
          }
        }
      }
    })

    // Archive 프로젝트 목록 캐시 무효화
    invalidateCache('projects:.*')

    return NextResponse.json(
      { 
        success: true, 
        message: '프로젝트가 성공적으로 수정되었습니다.',
        data: updatedProject 
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('프로젝트 수정 오류:', error)
    
    if (error.message === '로그인이 필요합니다') {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 프로젝트 삭제
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id
    const user = await requireAuth()

    // 프로젝트 존재 여부 및 작성자 확인
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true,
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: '프로젝트를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 삭제 권한 확인
    if (!permissions.canEditPost(user.role as any, project.authorId, user.id)) {
      return NextResponse.json(
        { error: '삭제 권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 프로젝트 삭제
    await prisma.project.delete({
      where: { id: projectId }
    })

    // Archive 프로젝트 목록 캐시 무효화
    invalidateCache('projects:.*')

    return NextResponse.json(
      { 
        success: true, 
        message: '프로젝트가 성공적으로 삭제되었습니다.' 
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('프로젝트 삭제 오류:', error)
    
    if (error.message === '로그인이 필요합니다') {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}