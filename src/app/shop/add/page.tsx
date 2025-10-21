'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePermissions } from '@/contexts/AuthContext'
import Link from 'next/link'

export default function ShopAddPage() {
  const router = useRouter()
  const { isAdmin } = usePermissions()
  const [categories, setCategories] = useState<any[]>([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    price: '',
    originalPrice: '',
    discount: '',
    categoryId: '',
    project: '',
    tags: '',
    features: '',
    sizes: '',
    colors: '',
    isBestItem: false,
  })
  // 상품 대표 이미지들 (상단 갤러리용)
  const [coverImages, setCoverImages] = useState<File[]>([])
  const [coverImagePreviews, setCoverImagePreviews] = useState<string[]>([])
  
  // 리치 텍스트 에디터 상태
  const [editorContent, setEditorContent] = useState('')
  const [isEditorFocused, setIsEditorFocused] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const [editorRef, setEditorRef] = useState<HTMLDivElement | null>(null)
  const [lastCursorPosition, setLastCursorPosition] = useState<Range | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  // 관리자가 아닌 경우 접근 차단
  useEffect(() => {
    if (!isAdmin) {
      router.push('/shop')
    }
  }, [isAdmin, router])

  // 카테고리 목록 불러오기
  useEffect(() => {
    fetchCategories()
  }, [])

  // 할인율 자동 계산
  useEffect(() => {
    if (formData.price && formData.originalPrice) {
      const price = parseInt(formData.price)
      const originalPrice = parseInt(formData.originalPrice)
      
      if (originalPrice > price && originalPrice > 0) {
        const discount = Math.round(((originalPrice - price) / originalPrice) * 100)
        setFormData(prev => ({
          ...prev,
          discount: discount.toString()
        }))
      } else {
        setFormData(prev => ({
          ...prev,
          discount: ''
        }))
      }
    } else {
      setFormData(prev => ({
        ...prev,
        discount: ''
      }))
    }
  }, [formData.price, formData.originalPrice])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/shop/categories')
      const data = await response.json()
      
      if (data.success) {
        setCategories(data.data)
      } else {
        console.error('카테고리 조회 실패:', data.error)
      }
    } catch (error) {
      console.error('카테고리 조회 오류:', error)
    }
  }

  // 상품 대표 이미지 업로드
  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    
    const newImages = [...coverImages, ...files]
    setCoverImages(newImages)
    
    // 미리보기 생성
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverImagePreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  // 상품 대표 이미지 제거
  const removeCoverImage = (index: number) => {
    const newImages = coverImages.filter((_, i) => i !== index)
    const newPreviews = coverImagePreviews.filter((_, i) => i !== index)
    setCoverImages(newImages)
    setCoverImagePreviews(newPreviews)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  // 리치 텍스트 에디터 함수들
  const handleEditorChange = () => {
    if (editorRef) {
      setEditorContent(editorRef.innerHTML)
      setFormData(prev => ({ ...prev, description: editorRef.innerHTML }))
    }
  }

  const handleEditorFocus = () => {
    setIsEditorFocused(true)
    // 포커스 시 마지막 커서 위치 복원
    setTimeout(() => {
      restoreCursorPosition()
    }, 10)
  }

  const handleEditorBlur = () => {
    setIsEditorFocused(false)
  }

  const handleEditorSelection = () => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim() !== '') {
      setSelectedText(selection.toString())
    } else {
      setSelectedText('')
    }
    
    // 커서 위치 저장
    if (selection && selection.rangeCount > 0) {
      setLastCursorPosition(selection.getRangeAt(0).cloneRange())
    }
  }

  // 커서 위치 저장 함수
  const saveCursorPosition = () => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0 && editorRef?.contains(selection.anchorNode)) {
      setLastCursorPosition(selection.getRangeAt(0).cloneRange())
    }
  }

  // 커서 위치 복원 함수
  const restoreCursorPosition = () => {
    if (lastCursorPosition && editorRef) {
      const selection = window.getSelection()
      if (selection) {
        selection.removeAllRanges()
        selection.addRange(lastCursorPosition)
      }
    }
  }

  // 텍스트 포맷팅 함수들
  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    handleEditorChange()
    editorRef?.focus()
  }

  const handleBold = () => {
    applyFormat('bold')
  }

  const handleItalic = () => {
    applyFormat('italic')
  }

  const handleUnderline = () => {
    applyFormat('underline')
  }

  const handleFontSize = (size: string) => {
    applyFormat('fontSize', size)
  }

  const handleFontColor = (color: string) => {
    applyFormat('foreColor', color)
  }

  const handleAlignLeft = () => {
    applyFormat('justifyLeft')
  }

  const handleAlignCenter = () => {
    applyFormat('justifyCenter')
  }

  const handleAlignRight = () => {
    applyFormat('justifyRight')
  }

  const handleInsertImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const file = files[0]
    const reader = new FileReader()
    reader.onloadend = () => {
      const img = document.createElement('img')
      img.src = reader.result as string
      img.style.maxWidth = '100%'
      img.style.height = 'auto'
      img.style.display = 'block'
      img.style.margin = '10px 0'
      img.style.border = '1px solid #e5e7eb'
      img.style.borderRadius = '4px'
      
      // 에디터에 포커스
      if (editorRef) {
        editorRef.focus()
        
        // 포커스 후 마지막 커서 위치 복원
        setTimeout(() => {
          const selection = window.getSelection()
          let range: Range
          
          if (lastCursorPosition && editorRef?.contains(lastCursorPosition.startContainer)) {
            // 마지막 커서 위치가 유효한 경우
            range = lastCursorPosition.cloneRange()
            range.deleteContents()
            range.insertNode(img)
          } else if (selection && selection.rangeCount > 0 && editorRef?.contains(selection.anchorNode)) {
            // 현재 선택 영역이 에디터 내부에 있는 경우
            range = selection.getRangeAt(0)
            range.deleteContents()
            range.insertNode(img)
          } else {
            // 에디터 끝에 추가
            range = document.createRange()
            range.selectNodeContents(editorRef)
            range.collapse(false) // 끝으로 이동
            range.insertNode(img)
          }
          
          // 커서를 이미지 뒤로 이동
          range.setStartAfter(img)
          range.setEndAfter(img)
          selection?.removeAllRanges()
          selection?.addRange(range)
          
          // 새로운 커서 위치 저장
          setLastCursorPosition(range.cloneRange())
          
          handleEditorChange()
        }, 20)
      }
      
      // 파일 입력 초기화
      e.target.value = ''
    }
    reader.readAsDataURL(file)
  }

  const handleInsertLink = () => {
    const url = prompt('링크 URL을 입력하세요:')
    if (url) {
      applyFormat('createLink', url)
    }
  }

  const handleUndo = () => {
    applyFormat('undo')
  }

  const handleRedo = () => {
    applyFormat('redo')
  }



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      // 상품 대표 이미지들을 Base64로 인코딩
      const coverImagesBase64: string[] = []
      for (const file of coverImages) {
        const reader = new FileReader()
        const base64String = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => {
            resolve(reader.result as string)
          }
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
        coverImagesBase64.push(base64String)
      }

      const response = await fetch('/api/shop/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          price: parseInt(formData.price),
          originalPrice: formData.originalPrice ? parseInt(formData.originalPrice) : null,
          discount: formData.discount ? parseInt(formData.discount) : null,
          brand: formData.project, // project를 brand로 매핑
          tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
          features: formData.features ? formData.features.split(',').map(f => f.trim()) : [],
          sizes: formData.sizes ? formData.sizes.split(',').map(s => s.trim()) : [],
          colors: formData.colors ? formData.colors.split(',').map(c => c.trim()) : [],
          images: coverImagesBase64, // 상품 대표 이미지들
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('상품이 성공적으로 등록되었습니다.')
        setMessageType('success')
        
        // 성공 후 Shop 페이지로 이동
        setTimeout(() => {
          router.push('/shop')
        }, 1500)
      } else {
        setMessage(data.error || '상품 등록 중 오류가 발생했습니다.')
        setMessageType('error')
      }
    } catch (error) {
      console.error('상품 등록 오류:', error)
      setMessage('서버 오류가 발생했습니다. 다시 시도해주세요.')
      setMessageType('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-white overflow-auto" style={{ overflowY: 'scroll' }}>
      <div className="relative min-h-screen bg-white">
        {/* 상단 검은색 영역 */}
        <div className="bg-black pt-32 pb-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-0">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">상품 등록</h1>
              <p className="text-white text-sm mb-8">새로운 상품을 등록하세요.</p>
              
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
                {/* 상품 대표 이미지 */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-black mb-4">상품 대표 이미지</h3>
                  
                  <div className="space-y-4">
                    {/* 이미지 업로드 영역 */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleCoverImageUpload}
                        className="hidden"
                        id="cover-image-upload"
                      />
                      <label htmlFor="cover-image-upload" className="cursor-pointer">
                        <div className="text-gray-500 mb-2">
                          <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-600">
                          클릭하여 상품 대표 이미지들을 업로드하세요
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          여러 이미지를 선택할 수 있습니다 (JPG, PNG, GIF)
                        </p>
                      </label>
                    </div>

                    {/* 업로드된 이미지들 미리보기 */}
                    {coverImagePreviews.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {coverImagePreviews.map((preview, index) => (
                          <div key={index} className="relative">
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
                            <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                              대표 이미지
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 기본 정보 */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-black mb-4">기본 정보</h3>
                  
                  <div className="space-y-4">
                    {/* 카테고리 */}
                    <div>
                      <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
                        카테고리 *
                      </label>
                      <select
                        id="categoryId"
                        name="categoryId"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                        value={formData.categoryId}
                        onChange={handleInputChange}
                      >
                        <option value="">카테고리를 선택하세요</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* 상품명 */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        상품명 *
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="상품명을 입력하세요"
                      />
                    </div>

                    {/* 프로젝트 */}
                    <div>
                      <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-2">
                        프로젝트
                      </label>
                      <input
                        id="project"
                        name="project"
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                        value={formData.project}
                        onChange={handleInputChange}
                        placeholder="프로젝트명을 입력하세요"
                      />
                    </div>

                    {/* 짧은 설명 */}
                    <div>
                      <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 mb-2">
                        짧은 설명
                      </label>
                      <input
                        id="shortDescription"
                        name="shortDescription"
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                        value={formData.shortDescription}
                        onChange={handleInputChange}
                        placeholder="한 줄 소개"
                      />
                    </div>
                  </div>
                </div>

                {/* 상세 설명 */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-black mb-4">상세 설명</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      상세 설명 *
                    </label>
                    
                    {/* 고급 리치 텍스트 툴바 */}
                    <div className="border border-gray-300 rounded-t-lg bg-gray-100 p-2">
                      {/* 첫 번째 줄: 기본 포맷팅 */}
                      <div className="flex items-center gap-1 mb-2 flex-wrap">
                        {/* 실행 취소/다시 실행 */}
                        <button
                          type="button"
                          onClick={handleUndo}
                          className="px-2 py-1 text-xs bg-white rounded hover:bg-gray-200 transition-colors border"
                          title="실행 취소"
                        >
                          ↶
                        </button>
                        <button
                          type="button"
                          onClick={handleRedo}
                          className="px-2 py-1 text-xs bg-white rounded hover:bg-gray-200 transition-colors border"
                          title="다시 실행"
                        >
                          ↷
                        </button>
                        
                        <div className="w-px h-6 bg-gray-300 mx-1"></div>
                        
                        {/* 텍스트 포맷팅 */}
                        <button
                          type="button"
                          onClick={handleBold}
                          className="px-3 py-1 text-sm bg-white rounded hover:bg-gray-200 transition-colors border font-bold"
                          title="굵게"
                        >
                          B
                        </button>
                        
                        <button
                          type="button"
                          onClick={handleItalic}
                          className="px-3 py-1 text-sm bg-white rounded hover:bg-gray-200 transition-colors border italic"
                          title="기울임"
                        >
                          I
                        </button>
                        
                        <button
                          type="button"
                          onClick={handleUnderline}
                          className="px-3 py-1 text-sm bg-white rounded hover:bg-gray-200 transition-colors border"
                          title="밑줄"
                          style={{ textDecoration: 'underline' }}
                        >
                          U
                        </button>
                        
                        <div className="w-px h-6 bg-gray-300 mx-1"></div>
                        
                        {/* 정렬 */}
                        <button
                          type="button"
                          onClick={handleAlignLeft}
                          className="px-2 py-1 text-xs bg-white rounded hover:bg-gray-200 transition-colors border"
                          title="왼쪽 정렬"
                        >
                          ⬅
                        </button>
                        <button
                          type="button"
                          onClick={handleAlignCenter}
                          className="px-2 py-1 text-xs bg-white rounded hover:bg-gray-200 transition-colors border"
                          title="가운데 정렬"
                        >
                          ↔
                        </button>
                        <button
                          type="button"
                          onClick={handleAlignRight}
                          className="px-2 py-1 text-xs bg-white rounded hover:bg-gray-200 transition-colors border"
                          title="오른쪽 정렬"
                        >
                          ➡
                        </button>
                      </div>
                      
                      {/* 두 번째 줄: 고급 기능 */}
                      <div className="flex items-center gap-1 flex-wrap">
                        {/* 폰트 크기 */}
                        <select
                          onChange={(e) => handleFontSize(e.target.value)}
                          className="px-2 py-1 text-sm border border-gray-300 rounded bg-white"
                          title="폰트 크기"
                          defaultValue="3"
                        >
                          <option value="1">8pt</option>
                          <option value="2">10pt</option>
                          <option value="3">12pt</option>
                          <option value="4">14pt</option>
                          <option value="5">18pt</option>
                          <option value="6">24pt</option>
                          <option value="7">36pt</option>
                        </select>
                        
                        {/* 폰트 색상 */}
                        <input
                          type="color"
                          onChange={(e) => handleFontColor(e.target.value)}
                          className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                          title="폰트 색상"
                          defaultValue="#000000"
                        />
                        
                        <div className="w-px h-6 bg-gray-300 mx-1"></div>
                        
                        {/* 링크 삽입 */}
                        <button
                          type="button"
                          onClick={handleInsertLink}
                          className="px-3 py-1 text-sm bg-white rounded hover:bg-gray-200 transition-colors border"
                          title="링크 삽입"
                        >
                          🔗
                        </button>
                        
                        {/* 이미지 삽입 */}
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleInsertImage}
                            className="hidden"
                            id="rich-text-image-upload"
                          />
                          <label
                            htmlFor="rich-text-image-upload"
                            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors cursor-pointer"
                            title="이미지 삽입"
                            onClick={() => {
                              // 이미지 업로드 버튼 클릭 시 현재 커서 위치 저장
                              saveCursorPosition()
                            }}
                          >
                            📷
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    {/* 리치 텍스트 에디터 */}
                    <div
                      ref={setEditorRef}
                      contentEditable
                      className="w-full min-h-[200px] px-4 py-3 border border-gray-300 border-t-0 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                      style={{
                        fontSize: '16px',
                        lineHeight: '1.6',
                        fontFamily: 'inherit'
                      }}
                      onInput={handleEditorChange}
                      onFocus={handleEditorFocus}
                      onBlur={handleEditorBlur}
                      onMouseUp={handleEditorSelection}
                      onKeyUp={handleEditorSelection}
                      onKeyDown={saveCursorPosition}
                      onClick={saveCursorPosition}
                      suppressContentEditableWarning={true}
                      data-placeholder="상품에 대한 자세한 설명을 입력하세요. 텍스트를 선택하고 위 툴바를 사용하여 꾸밀 수 있습니다."
                    />
                    
                    {/* Placeholder 스타일 */}
                    <style jsx>{`
                      [contenteditable]:empty:before {
                        content: attr(data-placeholder);
                        color: #9ca3af;
                        pointer-events: none;
                      }
                      [contenteditable]:focus:before {
                        content: none;
                      }
                    `}</style>
                    
                    {/* 선택된 텍스트 표시 */}
                    {selectedText && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                        <span className="text-blue-600 font-medium">선택된 텍스트:</span> "{selectedText}"
                      </div>
                    )}
                  </div>
                </div>

                {/* 가격 정보 */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-black mb-4">가격 정보</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 판매가 */}
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                        판매가 *
                      </label>
                      <input
                        id="price"
                        name="price"
                        type="number"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="25000"
                      />
                    </div>

                    {/* 정가 */}
                    <div>
                      <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-700 mb-2">
                        정가
                      </label>
                      <input
                        id="originalPrice"
                        name="originalPrice"
                        type="number"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                        value={formData.originalPrice}
                        onChange={handleInputChange}
                        placeholder="30000"
                      />
                    </div>

                    {/* 할인율 (자동 계산) */}
                    <div>
                      <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-2">
                        할인율 (%) - 자동 계산
                      </label>
                      <input
                        id="discount"
                        name="discount"
                        type="number"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                        value={formData.discount}
                        readOnly
                        placeholder="정가와 판매가를 입력하면 자동으로 계산됩니다"
                      />
                    </div>
                  </div>

                </div>

                {/* 상품 옵션 */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-black mb-4">상품 옵션</h3>
                  
                  <div className="space-y-4">
                    {/* 태그 */}
                    <div>
                      <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                        태그 (쉼표로 구분)
                      </label>
                      <input
                        id="tags"
                        name="tags"
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                        value={formData.tags}
                        onChange={handleInputChange}
                        placeholder="신상품, 인기, 한정판"
                      />
                    </div>

                    {/* 사이즈 */}
                    <div>
                      <label htmlFor="sizes" className="block text-sm font-medium text-gray-700 mb-2">
                        사이즈 (쉼표로 구분)
                      </label>
                      <input
                        id="sizes"
                        name="sizes"
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                        value={formData.sizes}
                        onChange={handleInputChange}
                        placeholder="S, M, L, XL"
                      />
                    </div>

                    {/* 색상 */}
                    <div>
                      <label htmlFor="colors" className="block text-sm font-medium text-gray-700 mb-2">
                        색상 (쉼표로 구분)
                      </label>
                      <input
                        id="colors"
                        name="colors"
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                        value={formData.colors}
                        onChange={handleInputChange}
                        placeholder="검정, 흰색, 회색"
                      />
                    </div>

                    {/* 특징 */}
                    <div>
                      <label htmlFor="features" className="block text-sm font-medium text-gray-700 mb-2">
                        특징 (쉼표로 구분)
                      </label>
                      <input
                        id="features"
                        name="features"
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                        value={formData.features}
                        onChange={handleInputChange}
                        placeholder="면 100%, 세탁 가능, 국내 제작"
                      />
                    </div>

                    {/* Best Item 체크박스 */}
                    <div className="flex items-center">
                      <input
                        id="isBestItem"
                        name="isBestItem"
                        type="checkbox"
                        checked={formData.isBestItem}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                      />
                      <label htmlFor="isBestItem" className="ml-2 block text-sm text-gray-700">
                        Best Item으로 설정
                      </label>
                    </div>
                  </div>
                </div>

                {/* 버튼들 */}
                <div className="flex space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => router.push('/shop')}
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
                    {isSubmitting ? '등록 중...' : '상품 등록'}
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

