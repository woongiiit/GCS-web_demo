import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { permissions, permissionErrors } from '@/lib/permissions'

export async function GET(request: Request) {
  try {
    const user = await requireAuth()

    if (!permissions.canAccessAdmin(user.role as any)) {
      return NextResponse.json({ error: permissionErrors.adminOnly }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1)
    const limit = Math.min(50, Math.max(5, Number.parseInt(searchParams.get('limit') || '10', 10) || 10))
    const skip = (page - 1) * limit

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true
            }
          },
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  authorId: true,
                  author: {
                    select: {
                      id: true,
                      name: true,
                      email: true
                    }
                  }
                }
              }
            }
          },
          paymentRecords: {
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      }),
      prisma.order.count()
    ])

    const totalPages = Math.max(1, Math.ceil(totalCount / limit))

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          totalPages,
          totalCount
        }
      }
    })
  } catch (error) {
    console.error('관리자 주문 목록 조회 오류:', error)
    return NextResponse.json(
      {
        error: '주문 내역을 불러오는 중 오류가 발생했습니다.'
      },
      { status: 500 }
    )
  }
}

