import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'shop', 'project', 'board', 'lounge'

    if (!type) {
      return NextResponse.json(
        { error: '타입이 필요합니다.' },
        { status: 400 }
      )
    }

    switch (type) {
      case 'shop': {
        // 좋아요한 상품 조회
        const productLikes = await prisma.productLike.findMany({
          where: { userId: user.id },
          include: {
            product: {
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                sellerTeam: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        })

        const products = productLikes.map((like) => ({
          id: like.product.id,
          name: like.product.name,
          price: like.product.price,
          images: like.product.images,
          type: like.product.type,
          brand: like.product.brand,
          sellerTeamName: like.product.sellerTeam?.name || like.product.author?.name || 'GCS',
          createdAt: like.product.createdAt,
        }))

        return NextResponse.json({
          success: true,
          data: products,
        })
      }

      case 'project': {
        // 좋아요한 프로젝트 조회
        const projectLikes = await prisma.projectLike.findMany({
          where: { userId: user.id },
          include: {
            project: {
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        })

        const projects = projectLikes.map((like) => ({
          id: like.project.id,
          title: like.project.title,
          images: like.project.images,
          imageUrl: like.project.imageUrl,
          year: like.project.year,
          teamMembers: like.project.teamMembers,
          authorName: like.project.author.name,
          createdAt: like.project.createdAt,
        }))

        return NextResponse.json({
          success: true,
          data: projects,
        })
      }

      case 'board': {
        // 좋아요한 게시글 조회 (BOARD 카테고리)
        const postLikes = await prisma.postLike.findMany({
          where: {
            userId: user.id,
            post: {
              category: 'BOARD',
            },
          },
          include: {
            post: {
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        })

        const posts = postLikes.map((like) => ({
          id: like.post.id,
          title: like.post.title,
          content: like.post.content,
          images: like.post.images,
          authorName: like.post.author.name,
          createdAt: like.post.createdAt,
        }))

        return NextResponse.json({
          success: true,
          data: posts,
        })
      }

      case 'lounge': {
        // 좋아요한 게시글 조회 (LOUNGE 카테고리)
        const postLikes = await prisma.postLike.findMany({
          where: {
            userId: user.id,
            post: {
              category: 'LOUNGE',
            },
          },
          include: {
            post: {
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        })

        const posts = postLikes.map((like) => ({
          id: like.post.id,
          title: like.post.title,
          content: like.post.content,
          images: like.post.images,
          authorName: like.post.author.name,
          createdAt: like.post.createdAt,
        }))

        return NextResponse.json({
          success: true,
          data: posts,
        })
      }

      default:
        return NextResponse.json(
          { error: '유효하지 않은 타입입니다.' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    if (error?.message === '로그인이 필요합니다') {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    console.error('좋아요 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

