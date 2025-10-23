'use client'

import Link from 'next/link'
import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { usePermissions } from '@/contexts/AuthContext'
import { permissions } from '@/lib/permissions'
import RichTextEditor from '@/components/TinyMCEEditor'

function WriteContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { role, verificationStatus, user } = usePermissions()
  const category = searchParams.get('category') || 'board'
  const editId = searchParams.get('edit') // 수정 모드인지 확인
  const isEditMode = !!editId

  // 권한 체크
  if (!permissions.canWritePost(role, verificationStatus)) {
    return (
      <div className="fixed inset-0 bg-white overflow-auto" style={{ overflowY: 'scroll' }}>
        <div className="relative min-h-screen bg-white">
          <div className="bg-black pt-32 pb-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-0">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-white mb-4">Community</h1>
                <p className="text-white text-sm mb-8">글 작성 권한이 없습니다.</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 min-h-screen flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                {!role ? '로그인이 필요한 서비스입니다.' : 
                 role === 'GENERAL' && verificationStatus === 'REQUESTED' ? '전공 회원 인증이 완료되면 글을 작성할 수 있습니다.' :
                 '글 작성 권한이 없습니다.'}
              </p>
              <div className="flex space-x-4 justify-center">
                {!role ? (
                  <Link 
                    href="/login"
                    className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    로그인
                  </Link>
                ) : (
                  <Link 
                    href="/community"
                    className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    목록으로 돌아가기
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: category
  })
  
  // TinyMCE 에디터 관련 상태
  const [editorContent, setEditorContent] = useState('')
  
  // 대표 이미지 관련 상태
  const [coverImages, setCoverImages] = useState<File[]>([])
  const [coverImagePreviews, setCoverImagePreviews] = useState<string[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  
  const [isUploading, setIsUploading] = useState(false)

  // 수정 모드에서 기존 글 데이터 로드
  useEffect(() => {
    if (isEditMode && editId) {
      fetchPostData()
    }
  }, [isEditMode, editId])

  const fetchPostData = async () => {
    try {
      const response = await fetch(`/api/community/posts/${editId}`)
      const data = await response.json()
      
      if (data.success) {
        const post = data.data
        // 수정 권한 확인
        if (!permissions.canEditPost(role, post.authorId, user?.id)) {
          alert('수정 권한이 없습니다.')
          router.push('/community')
          return
        }
        
        setFormData({
          title: post.title,
          content: post.content,
          category: post.category.toLowerCase()
        })
        setEditorContent(post.content)
        setCoverImagePreviews(post.images || [])
      } else {
        alert('글을 불러올 수 없습니다.')
        router.push('/community')
      }
    } catch (error) {
      console.error('글 데이터 로드 오류:', error)
      alert('글을 불러오는 중 오류가 발생했습니다.')
      router.push('/community')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // 대표 이미지 업로드
  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (coverImages.length + imageFiles.length > 5) {
      alert('최대 5개의 대표 이미지를 업로드할 수 있습니다.')
      return
    }

    const newImages = [...coverImages, ...imageFiles]
    setCoverImages(newImages)

    // 미리보기 생성
    const newPreviews = imageFiles.map(file => URL.createObjectURL(file))
    setCoverImagePreviews(prev => [...prev, ...newPreviews])

    // 파일 입력 초기화
    e.target.value = ''
  }

  const removeCoverImage = (index: number) => {
    const newImages = coverImages.filter((_, i) => i !== index)
    const newPreviews = coverImagePreviews.filter((_, i) => i !== index)
    setCoverImages(newImages)
    setCoverImagePreviews(newPreviews)
  }


  // 드래그 앤 드롭 핸들러
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (imageFiles.length === 0) {
      alert('이미지 파일만 업로드할 수 있습니다.')
      return
    }

    if (coverImages.length + imageFiles.length > 5) {
      alert('최대 5개의 대표 이미지를 업로드할 수 있습니다.')
      return
    }

    // 이미지 파일 처리
    const newImages = [...coverImages, ...imageFiles]
    setCoverImages(newImages)

    // 미리보기 생성
    const newPreviews = imageFiles.map(file => URL.createObjectURL(file))
    setCoverImagePreviews(prev => [...prev, ...newPreviews])
  }

  // TinyMCE 에디터 핸들러
  const handleEditorChange = (content: string) => {
    setEditorContent(content)
    setFormData(prev => ({ ...prev, content }))
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsUploading(true)
    
    try {
      // 대표 이미지를 Base64로 인코딩
      const galleryImages: string[] = []
      
      for (const file of coverImages) {
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
      
      const url = isEditMode ? `/api/community/posts/${editId}` : '/api/community/write'
      const method = isEditMode ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: formData.title,
          content: editorContent, // 리치 텍스트 에디터 내용 사용
          category: category,
          images: galleryImages // 대표 이미지들
        })
      })

      const data = await response.json()

      if (response.ok) {
        console.log(isEditMode ? '게시글 수정 성공:' : '게시글 작성 성공:', data)
        // 완료 후 해당 카테고리로 이동 (새로고침 강제)
        router.push(`/community?tab=${category}`)
        router.refresh() // 페이지 새로고침 강제
      } else {
        console.error(isEditMode ? '게시글 수정 실패:' : '게시글 작성 실패:', data.error)
        alert(data.error || (isEditMode ? '게시글 수정에 실패했습니다. 다시 시도해주세요.' : '게시글 작성에 실패했습니다. 다시 시도해주세요.'))
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
      <style jsx>{`
        [contentEditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
      <div className="relative min-h-screen bg-white">
        {/* 상단 검은색 영역 */}
        <div className="bg-black pt-32 pb-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-0">
            {/* 페이지 제목 */}
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">Community</h1>
              <p className="text-white text-sm mb-8">
                {isEditMode ? '글을 수정해보세요.' : '새로운 글을 작성해보세요.'}
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

                {/* 대표 이미지 업로드 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    대표 이미지 (최대 5개)
                  </label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`w-full px-4 py-8 border-2 border-dashed rounded-lg transition-colors cursor-pointer relative ${
                      isDragOver
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium text-blue-600 hover:text-blue-500">
                            클릭하여 파일을 선택
                          </span>
                          {' '}또는 드래그 앤 드롭
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF 최대 5개</p>
                      </div>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleCoverImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  
                  {/* 대표 이미지 미리보기 */}
                  {coverImagePreviews.length > 0 && (
                    <div className="mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {coverImagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`대표 이미지 ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeCoverImage(index)}
                              className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 상세 설명 - TinyMCE 에디터 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    상세 설명 *
                  </label>
                  
                  <RichTextEditor
                    value={editorContent}
                    onChange={handleEditorChange}
                    placeholder="상세 설명을 입력하세요..."
                    height={400}
                  />
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
                    {isUploading ? (isEditMode ? '수정 중...' : '작성 중...') : (isEditMode ? '수정하기' : '작성하기')}
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
