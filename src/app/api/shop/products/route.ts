import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { permissions, permissionErrors } from '@/lib/permissions'
import { withCache, generateCacheKey, invalidateCache } from '@/lib/cache'

// 동적 렌더링 강제 설정
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    // 인증 확인 및 사용자 정보 가져오기
    const user = await requireAuth()

    // 상품 등록 권한 확인 (ADMIN만 가능)
    if (!permissions.canAddProduct(user.role as any)) {
      return NextResponse.json(
        { error: permissionErrors.adminOnly },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      name,
      description,
      shortDescription,
      price,
      originalPrice,
      discount,
      categoryId,
      images,
      brand,
      tags,
      features,
      sizes,
      colors,
      isBestItem,
    } = body

    // 유효성 검사
    if (!name || !description || !price || !categoryId) {
      return NextResponse.json(
        { error: '필수 항목을 입력해주세요.' },
        { status: 400 }
      )
    }

    // 카테고리 존재 여부 확인
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    })

    if (!category) {
      return NextResponse.json(
        { error: '존재하지 않는 카테고리입니다.' },
        { status: 404 }
      )
    }

    // 상품 생성
    const product = await prisma.product.create({
      data: {
        name,
        description,
        shortDescription: shortDescription || null,
        price: parseInt(price),
        originalPrice: originalPrice ? parseInt(originalPrice) : null,
        discount: discount ? parseInt(discount) : null,
        stock: 0, // 재고 수량은 항상 0으로 설정
        categoryId,
        images: images || [], // 갤러리용 이미지만 저장
        brand: brand || null,
        tags: tags || [],
        features: features || [],
        sizes: sizes || [],
        colors: colors || [],
        isBestItem: isBestItem || false,
        isActive: true,
      },
      include: {
        category: true,
      }
    })

    // 상품 등록 후 관련 캐시 무효화
    invalidateCache('products:.*');
    invalidateCache('products:bestItem:true');

    return NextResponse.json(
      { 
        success: true, 
        message: '상품이 성공적으로 등록되었습니다.',
        data: product 
      },
      { status: 201 }
    )

  } catch (error: any) {
    console.error('상품 등록 오류:', error)
    
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

// 상품 목록 조회 (모든 사용자 가능)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categorySlug = searchParams.get('category')
    const isBestItem = searchParams.get('bestItem') === 'true'

    // 캐시 키 생성
    const cacheKey = generateCacheKey(
      'products',
      categorySlug || 'all',
      isBestItem ? 'bestItem' : 'all'
    )

    // 캐시와 함께 데이터 가져오기
    const result = await withCache(cacheKey, async () => {
      const whereClause: any = {
        isActive: true,
      }

      if (categorySlug) {
        const category = await prisma.category.findUnique({
          where: { slug: categorySlug }
        })
        
        if (category) {
          whereClause.categoryId = category.id
        }
      }

      if (isBestItem) {
        whereClause.isBestItem = true
      }

      const products = await prisma.product.findMany({
        where: whereClause,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            }
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: isBestItem ? 10 : 100 // bestItem은 최대 10개, 전체는 최대 100개로 제한
      })

      return {
        success: true,
        data: products,
        count: products.length
      }
    }, 300000) // 5분 캐시

    return NextResponse.json(
      result,
      { 
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
          'CDN-Cache-Control': 'max-age=300',
          'Vercel-CDN-Cache-Control': 'max-age=300'
        }
      }
    )

  } catch (error: any) {
    console.error('상품 목록 조회 오류:', error)
    
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

