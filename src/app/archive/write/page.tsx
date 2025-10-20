'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

function ArchiveWriteContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'project', // 'project' 또는 'news'
    year: new Date().getFullYear().toString(),
    members: '', // 프로젝트의 경우
    images: [] as File[],
    imagePreviews: [] as string[],
    isFeatured: false
  })
  const [imageOptions, setImageOptions] = useState<Array<{
    showInGallery: boolean
    insertToContent: boolean
  }>>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  // URL에서 type 파라미터 읽기
  useEffect(() => {
    const type = searchParams.get('type')
    if (type === 'project' || type === 'news') {
      setFormData(prev => ({ ...prev, type }))
    }
  }, [searchParams])

  // 로그인하지 않았거나 관리자가 아닌 경우 리다이렉트
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/archive')
    }
  }, [user, isLoading, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (formData.images.length + imageFiles.length > 10) {
      setMessage('최대 10개의 이미지를 업로드할 수 있습니다.')
      setMessageType('error')
      return
    }

    const newImages = [...formData.images, ...imageFiles]
    setFormData(prev => ({ ...prev, images: newImages }))

    // 미리보기 생성
    const newPreviews = imageFiles.map(file => URL.createObjectURL(file))
    setFormData(prev => ({ ...prev, imagePreviews: [...prev.imagePreviews, ...newPreviews] }))

    // 기본 옵션 설정 (갤러리와 본문 삽입 모두 가능)
    const newOptions = imageFiles.map(() => ({
      showInGallery: true,
      insertToContent: true
    }))
    setImageOptions([...imageOptions, ...newOptions])
  }

  const insertImageAtCursor = async (imageIndex: number) => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement
    if (!textarea) return

    const file = formData.images[imageIndex]
    if (!file) return

    // 파일을 Base64로 변환
    const reader = new FileReader()
    const base64String = await new Promise<string>((resolve, reject) => {
      reader.onloadend = () => {
        resolve(reader.result as string)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const before = formData.content.substring(0, start)
    const after = formData.content.substring(end)
    
    const imageTag = `\n\n[IMAGE:${base64String}]\n\n`
    const newContent = before + imageTag + after
    
    setFormData(prev => ({ ...prev, content: newContent }))
    
    // 커서 위치 업데이트
    setTimeout(() => {
      const newCursorPos = start + imageTag.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
      textarea.focus()
    }, 0)
  }

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index)
    const newPreviews = formData.imagePreviews.filter((_, i) => i !== index)
    const newOptions = imageOptions.filter((_, i) => i !== index)
    setFormData(prev => ({ ...prev, images: newImages, imagePreviews: newPreviews }))
    setImageOptions(newOptions)
  }

  const updateImageOption = (index: number, option: 'showInGallery' | 'insertToContent', value: boolean) => {
    const newOptions = [...imageOptions]
    newOptions[index] = { ...newOptions[index], [option]: value }
    setImageOptions(newOptions)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      // 갤러리용 이미지만 Base64로 인코딩
      const galleryImages: string[] = []
      
      for (let i = 0; i < formData.images.length; i++) {
        const file = formData.images[i]
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
      
      const response = await fetch('/api/archive/write', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          type: formData.type,
          year: formData.year,
          members: formData.members,
          images: galleryImages, // 갤러리용 이미지만
          isFeatured: formData.isFeatured
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('글이 성공적으로 작성되었습니다.')
        setMessageType('success')
        
        // 성공 후 Archive 페이지로 이동
        setTimeout(() => {
          router.push('/archive')
        }, 1500)
      } else {
        console.error('글 작성 실패:', data.error)
        setMessage(data.error || '글 작성에 실패했습니다. 다시 시도해주세요.')
        setMessageType('error')
      }
    } catch (error) {
      console.error('글 작성 오류:', error)
      setMessage('서버 오류가 발생했습니다. 다시 시도해주세요.')
      setMessageType('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/archive')
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="fixed inset-0 bg-white overflow-auto" style={{ overflowY: 'scroll' }}>
      <div className="relative min-h-screen bg-white">
        {/* 상단 검은색 영역 */}
        <div className="bg-black pt-32 pb-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-0">
            {/* 페이지 제목 */}
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">Archive</h1>
              <p className="text-white text-sm mb-8">
                {formData.type === 'project' ? '새로운 프로젝트를 등록하세요.' : '새로운 뉴스를 작성하세요.'}
              </p>
              
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
        <div className="bg-white min-h-screen">
          <div className="max-w-4xl mx-auto px-4 py-6 sm:px-0">
            <div className="bg-white px-4 py-8">
              
              {/* 글 타입 표시 */}
              <div className="mb-6">
                <span className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                  {formData.type === 'project' ? '프로젝트' : '뉴스'}
                </span>
              </div>

              {message && (
                <div className={`mb-6 p-4 rounded-lg ${
                  messageType === 'success' 
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 제목 */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    제목 *
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="제목을 입력하세요"
                  />
                </div>

                {/* 연도 */}
                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                    연도 *
                  </label>
                  <select
                    id="year"
                    name="year"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                    value={formData.year}
                    onChange={handleInputChange}
                  >
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                    <option value="2021">2021</option>
                  </select>
                </div>

                {/* 프로젝트 멤버 (프로젝트인 경우만) */}
                {formData.type === 'project' && (
                  <div>
                    <label htmlFor="members" className="block text-sm font-medium text-gray-700 mb-2">
                      참여 멤버
                    </label>
                    <input
                      id="members"
                      name="members"
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                      value={formData.members}
                      onChange={handleInputChange}
                      placeholder="예: 김봉구, 김병수, 김정욱"
                    />
                  </div>
                )}

                {/* 이미지 업로드 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이미지 (최대 10개)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                  />
                  
                  {/* 이미지 미리보기 및 옵션 설정 */}
                  {formData.imagePreviews.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-3">
                        각 이미지의 용도를 선택하세요. 이미지를 클릭하면 글 내용에 삽입됩니다.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {formData.imagePreviews.map((preview, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="relative group mb-3">
                              <img
                                src={preview}
                                alt={`미리보기 ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border border-gray-200 cursor-pointer hover:border-[#f57520] transition-colors"
                                onClick={() => {
                                  if (imageOptions[index]?.insertToContent) {
                                    insertImageAtCursor(index)
                                  }
                                }}
                                title={imageOptions[index]?.insertToContent ? "클릭하여 글에 삽입" : "본문 삽입이 비활성화됨"}
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
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

                {/* 내용 */}
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                    내용 *
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    rows={12}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors resize-none"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="내용을 입력하세요"
                  />
                </div>

                {/* 주요 항목 체크박스 */}
                <div className="flex items-center">
                  <input
                    id="isFeatured"
                    name="isFeatured"
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                  />
                  <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-700">
                    주요 항목으로 설정
                  </label>
                </div>

                {/* 버튼들 */}
                <div className="flex space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 py-3 px-6 rounded-lg font-medium text-white transition-colors ${
                      isSubmitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2'
                    }`}
                  >
                    {isSubmitting ? '작성 중...' : '작성하기'}
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

export default function ArchiveWritePage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <ArchiveWriteContent />
    </Suspense>
  )
}

export const dynamic = 'force-dynamic'
