'use client'

import Link from 'next/link'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function WriteContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const category = searchParams.get('category') || 'board'
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: category
  })
  
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [imageOptions, setImageOptions] = useState<Array<{
    showInGallery: boolean
    insertToContent: boolean
  }>>([])
  const [isUploading, setIsUploading] = useState(false)
  const [cursorPosition, setCursorPosition] = useState(0)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleTextareaClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement
    setCursorPosition(target.selectionStart)
  }

  const handleTextareaKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement
    setCursorPosition(target.selectionStart)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const maxImages = 10
    const remainingSlots = maxImages - images.length
    
    if (remainingSlots <= 0) {
      alert('최대 10개의 이미지를 업로드할 수 있습니다.')
      return
    }

    const newImages: File[] = []
    const newPreviews: string[] = []
    const filesToProcess = Array.from(files).slice(0, remainingSlots)

    filesToProcess.forEach((file) => {
      if (file.type.startsWith('image/')) {
        newImages.push(file)
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target?.result) {
            newPreviews.push(e.target.result as string)
            setImagePreviews(prev => [...prev, ...newPreviews])
          }
        }
        reader.readAsDataURL(file)
      }
    })

    setImages(prev => [...prev, ...newImages])

    // 기본 옵션 설정 (갤러리와 본문 삽입 모두 가능)
    const newOptions = newImages.map(() => ({
      showInGallery: true,
      insertToContent: true
    }))
    setImageOptions([...imageOptions, ...newOptions])
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    const newOptions = imageOptions.filter((_, i) => i !== index)
    setImages(newImages)
    setImagePreviews(newPreviews)
    setImageOptions(newOptions)
  }

  const updateImageOption = (index: number, option: 'showInGallery' | 'insertToContent', value: boolean) => {
    const newOptions = [...imageOptions]
    newOptions[index] = { ...newOptions[index], [option]: value }
    setImageOptions(newOptions)
  }

  const insertImageToContent = (imageUrl: string) => {
    const imageTag = `\n[IMAGE:${imageUrl}]\n`
    const beforeCursor = formData.content.substring(0, cursorPosition)
    const afterCursor = formData.content.substring(cursorPosition)
    
    setFormData(prev => ({
      ...prev,
      content: beforeCursor + imageTag + afterCursor
    }))
    
    // 커서 위치를 이미지 삽입 후로 이동
    setTimeout(() => {
      const textarea = document.getElementById('content') as HTMLTextAreaElement
      if (textarea) {
        const newPosition = cursorPosition + imageTag.length
        textarea.setSelectionRange(newPosition, newPosition)
        textarea.focus()
        
        // 시각적 피드백을 위해 잠시 하이라이트
        textarea.style.backgroundColor = '#f0f9ff'
        setTimeout(() => {
          textarea.style.backgroundColor = ''
        }, 500)
      }
    }, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsUploading(true)
    
    try {
      // 갤러리용 이미지만 Base64로 인코딩
      const galleryImages: string[] = []
      
      for (let i = 0; i < images.length; i++) {
        const file = images[i]
        const options = imageOptions[i]
        
        // 갤러리용 이미지만 처리
        if (options.showInGallery) {
          const reader = new FileReader()
          const base64String = await new Promise<string>((resolve, reject) => {
            reader.onloadend = () => {
              resolve(reader.result as string)
            }
            reader.onerror = reject
            reader.readAsDataURL(file)
          })
          galleryImages.push(base64String)
        }
      }
      
      const response = await fetch('/api/community/write', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          category: category,
          images: galleryImages // 갤러리용 이미지만
        })
      })

      const data = await response.json()

      if (response.ok) {
        console.log('게시글 작성 성공:', data)
        // 작성 완료 후 해당 카테고리로 이동
        router.push(`/community?tab=${category}`)
      } else {
        console.error('게시글 작성 실패:', data.error)
        alert(data.error || '게시글 작성에 실패했습니다. 다시 시도해주세요.')
      }
    } catch (error) {
      console.error('게시글 작성 오류:', error)
      alert('서버 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleCancel = () => {
    router.push(`/community?tab=${category}`)
  }

  return (
    <div className="fixed inset-0 bg-white overflow-auto" style={{ overflowY: 'scroll' }}>
      <div className="relative min-h-screen bg-white">
        {/* 상단 검은색 영역 */}
        <div className="bg-black pt-32 pb-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-0">
            {/* 페이지 제목 */}
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">Community</h1>
              <p className="text-white text-sm mb-8">새로운 글을 작성해보세요.</p>
              
              {/* 홈 아이콘 */}
              <Link href="/" className="inline-block">
                <div className="w-6 h-6 mx-auto">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9,22 9,12 15,12 15,22"/>
                  </svg>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* 메인 컨텐츠 영역 */}
        <div className="bg-gray-50 min-h-screen">
          <div className="max-w-4xl mx-auto px-4 py-8 sm:px-0">
            <div className="bg-white rounded-lg shadow-sm p-8">
              {/* 카테고리 표시 */}
              <div className="mb-6">
                <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                  {category === 'board' ? 'Board' : 'Lounge'}
                </span>
              </div>

              {/* 글 작성 폼 */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 제목 입력 */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    제목
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="제목을 입력하세요"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                    required
                  />
                </div>

                {/* 이미지 업로드 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이미지 첨부
                  </label>
                  <div className="space-y-4">
                    {/* 이미지 업로드 버튼 */}
                    <div className="flex items-center space-x-4">
                      <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg border border-gray-300 transition-colors">
                        <span className="text-sm font-medium">이미지 선택</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      <span className="text-sm text-gray-500">
                        {images.length}/10 이미지 업로드됨
                      </span>
                    </div>

                    {/* 이미지 미리보기 및 옵션 설정 */}
                    {imagePreviews.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-700">업로드된 이미지</h4>
                          <span className="text-xs text-gray-500">각 이미지의 용도를 선택하세요</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                              <div className="relative group mb-3">
                                <img
                                  src={preview}
                                  alt={`미리보기 ${index + 1}`}
                                  className="w-full h-32 object-cover rounded-lg border border-gray-200 cursor-pointer hover:border-[#f57520] transition-colors"
                                  onClick={() => {
                                    if (imageOptions[index]?.insertToContent) {
                                      insertImageToContent(preview)
                                    }
                                  }}
                                  title={imageOptions[index]?.insertToContent ? "클릭하여 본문에 삽입" : "본문 삽입이 비활성화됨"}
                                />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    removeImage(index)
                                  }}
                                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                                  title="이미지 삭제"
                                >
                                  ×
                                </button>
                                {imageOptions[index]?.insertToContent && (
                                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                                    삽입 가능
                                  </div>
                                )}
                              </div>
                              
                              {/* 이미지 용도 선택 */}
                              <div className="space-y-2">
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    id={`gallery-${index}`}
                                    checked={imageOptions[index]?.showInGallery || false}
                                    onChange={(e) => updateImageOption(index, 'showInGallery', e.target.checked)}
                                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                                  />
                                  <label htmlFor={`gallery-${index}`} className="ml-2 text-sm text-gray-700">
                                    상단 갤러리에 표시
                                  </label>
                                </div>
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    id={`content-${index}`}
                                    checked={imageOptions[index]?.insertToContent || false}
                                    onChange={(e) => updateImageOption(index, 'insertToContent', e.target.checked)}
                                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                                  />
                                  <label htmlFor={`content-${index}`} className="ml-2 text-sm text-gray-700">
                                    본문에 삽입 가능
                                  </label>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 내용 입력 */}
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                    내용
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    onClick={handleTextareaClick}
                    onKeyUp={handleTextareaKeyUp}
                    placeholder="내용을 입력하세요. 이미지를 삽입하려면 원하는 위치에 커서를 놓고 위의 이미지에서 '삽입' 버튼을 클릭하세요."
                    rows={12}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 이미지를 본문에 삽입하려면: 1) 원하는 위치에 커서를 놓고 2) 위의 이미지를 클릭하세요.
                  </p>
                </div>

                {/* 버튼 그룹 */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? '작성 중...' : '작성하기'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* 하단 배너 */}
        <div className="bg-white py-6 border-t border-gray-200">
          <div className="px-4 flex justify-between items-start gap-4">
            {/* 왼쪽: 로고 정보 */}
            <div className="flex-shrink-0">
              <p className="text-[10px] text-gray-500 mb-0.5">DONGGUK UNIVERSITY</p>
              <h3 className="text-sm font-bold text-black">
                GCS<span className="text-[#f57520]">:</span>Web
              </h3>
            </div>
            
            {/* 오른쪽: 회사 정보 */}
            <div className="flex-1 text-right space-y-1 min-w-0">
              <p className="text-[10px] text-gray-600 leading-tight">주소: 서울 필동로 1길 30, 동국대학교</p>
              <p className="text-[10px] text-gray-600 leading-tight">대표자: 김봉구 | 회사명: 제작담</p>
              <p className="text-[10px] text-gray-600 leading-tight">사업자번호: 000-00-00000</p>
              <p className="text-[10px] text-gray-600 leading-tight">통신판매업: 제0000-서울중구-0000호</p>
              
              <div className="flex items-center justify-end space-x-1.5 pt-1 whitespace-nowrap">
                <a href="#" className="text-[10px] text-gray-600 underline">개인정보처리방침</a>
                <span className="text-[10px] text-gray-400">|</span>
                <a href="#" className="text-[10px] text-gray-600 underline">이용약관</a>
                <span className="text-[10px] text-gray-400">|</span>
                <span className="text-[10px] text-gray-500">site by 제작담</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function WritePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WriteContent />
    </Suspense>
  )
}
