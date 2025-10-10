import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { permissions, permissionErrors } from '@/lib/permissions'

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
      stock,
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
        stock: stock ? parseInt(stock) : 0,
        categoryId,
        images: images || [],
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
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      }
    })

    return NextResponse.json(
      { 
        success: true, 
        data: products,
        count: products.length 
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('상품 목록 조회 오류:', error)
    
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

