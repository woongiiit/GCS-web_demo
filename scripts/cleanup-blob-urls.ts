import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupBlobUrls() {
  try {
    console.log('🔍 Blob URL이 포함된 상품 검색 중...')

    // blob URL을 포함한 상품 찾기
    const products = await prisma.product.findMany({
      where: {
        OR: [
          {
            images: {
              isEmpty: false
            }
          }
        ]
      }
    })

    let cleanedCount = 0
    let totalBlobUrls = 0

    for (const product of products) {
      const originalImages = product.images
      const validImages = originalImages.filter((img: string) => {
        const isBlob = img.startsWith('blob:')
        if (isBlob) {
          totalBlobUrls++
        }
        return !isBlob && img.trim() !== ''
      })

      // Blob URL이 있었다면 업데이트
      if (originalImages.length !== validImages.length) {
        await prisma.product.update({
          where: { id: product.id },
          data: {
            images: validImages
          }
        })
        cleanedCount++
        console.log(`✅ [${product.name}] ${originalImages.length - validImages.length}개의 Blob URL 제거 (남은 이미지: ${validImages.length}개)`)
      }
    }

    console.log('\n📊 정리 완료!')
    console.log(`- 전체 상품 수: ${products.length}개`)
    console.log(`- 정리된 상품 수: ${cleanedCount}개`)
    console.log(`- 제거된 Blob URL 수: ${totalBlobUrls}개`)

    if (cleanedCount === 0) {
      console.log('✨ 정리할 Blob URL이 없습니다.')
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

cleanupBlobUrls()

