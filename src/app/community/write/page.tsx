'use client'

import Link from 'next/link'
import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { usePermissions } from '@/contexts/AuthContext'
import { permissions } from '@/lib/permissions'

function WriteContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { role, verificationStatus } = usePermissions()
  const category = searchParams.get('category') || 'board'

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
                 verificationStatus === 'REQUESTED' ? '전공 회원 인증이 완료되면 글을 작성할 수 있습니다.' :
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
  
  // 리치 텍스트 에디터 관련 상태
  const [editorContent, setEditorContent] = useState('')
  const [isEditorFocused, setIsEditorFocused] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const [lastCursorPosition, setLastCursorPosition] = useState<Range | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  
  // 대표 이미지 관련 상태
  const [coverImages, setCoverImages] = useState<File[]>([])
  const [coverImagePreviews, setCoverImagePreviews] = useState<string[]>([])
  
  const [isUploading, setIsUploading] = useState(false)

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

  // 리치 텍스트 에디터 핸들러
  const handleEditorChange = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML
      setEditorContent(content)
      setFormData(prev => ({ ...prev, content }))
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
    saveCursorPosition()
  }

  const handleEditorSelection = () => {
    const selection = window.getSelection()
    if (selection) {
      setSelectedText(selection.toString())
    }
  }

  // 커서 위치 관리
  const saveCursorPosition = () => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0 && editorRef?.current?.contains(selection.anchorNode)) {
      setLastCursorPosition(selection.getRangeAt(0).cloneRange())
    }
  }

  const restoreCursorPosition = () => {
    if (lastCursorPosition && editorRef) {
      const selection = window.getSelection()
      if (selection) {
        selection.removeAllRanges()
        selection.addRange(lastCursorPosition)
      }
    }
  }

  // 포맷팅 함수들
  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    handleEditorChange()
  }

  const handleBold = () => applyFormat('bold')
  const handleItalic = () => applyFormat('italic')
  const handleUnderline = () => applyFormat('underline')
  const handleAlignLeft = () => applyFormat('justifyLeft')
  const handleAlignCenter = () => applyFormat('justifyCenter')
  const handleAlignRight = () => applyFormat('justifyRight')
  const handleUndo = () => applyFormat('undo')
  const handleRedo = () => applyFormat('redo')

  const handleFontSize = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const size = e.target.value
    applyFormat('fontSize', size)
  }

  const handleFontColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value
    applyFormat('foreColor', color)
  }

  const handleInsertLink = () => {
    const url = prompt('링크 URL을 입력하세요:')
    if (url) {
      applyFormat('createLink', url)
    }
  }

  // 이미지 삽입
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
      img.style.border = '1px solid #e5e7eb'
      img.style.borderRadius = '8px'
      img.style.margin = '8px 0'

      // 에디터에 포커스가 없으면 먼저 포커스
      if (editorRef?.current) {
        editorRef.current.focus()

        // 포커스 후 마지막 커서 위치 복원
        setTimeout(() => {
          const selection = window.getSelection()
          let range: Range

          if (lastCursorPosition && editorRef?.current?.contains(lastCursorPosition.startContainer)) {
            // 마지막 커서 위치가 유효한 경우
            range = lastCursorPosition.cloneRange()
            range.deleteContents()
            range.insertNode(img)
          } else if (selection && selection.rangeCount > 0 && editorRef?.current?.contains(selection.anchorNode)) {
            // 현재 선택 영역이 에디터 내부에 있는 경우
            range = selection.getRangeAt(0)
            range.deleteContents()
            range.insertNode(img)
          } else {
            // 에디터 끝에 추가
            range = document.createRange()
            range.selectNodeContents(editorRef.current!)
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
      
      const response = await fetch('/api/community/write', {
        method: 'POST',
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

                {/* 대표 이미지 업로드 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    대표 이미지 (최대 5개)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleCoverImageUpload}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                  />
                  
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

                {/* 상세 설명 - 리치 텍스트 에디터 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    상세 설명 *
                  </label>
                  
                  {/* 툴바 */}
                  <div className="border border-gray-300 rounded-t-lg bg-gray-50 p-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* 실행 취소/다시 실행 */}
                      <button
                        type="button"
                        onClick={handleUndo}
                        className="p-2 hover:bg-gray-200 rounded text-sm font-medium"
                        title="실행 취소"
                      >
                        ↶
                      </button>
                      <button
                        type="button"
                        onClick={handleRedo}
                        className="p-2 hover:bg-gray-200 rounded text-sm font-medium"
                        title="다시 실행"
                      >
                        ↷
                      </button>
                      
                      <div className="w-px h-6 bg-gray-300 mx-1"></div>
                      
                      {/* 텍스트 포맷팅 */}
                      <button
                        type="button"
                        onClick={handleBold}
                        className="p-2 hover:bg-gray-200 rounded font-bold"
                        title="굵게"
                      >
                        B
                      </button>
                      <button
                        type="button"
                        onClick={handleItalic}
                        className="p-2 hover:bg-gray-200 rounded italic"
                        title="기울임"
                      >
                        I
                      </button>
                      <button
                        type="button"
                        onClick={handleUnderline}
                        className="p-2 hover:bg-gray-200 rounded underline"
                        title="밑줄"
                      >
                        U
                      </button>
                      
                      <div className="w-px h-6 bg-gray-300 mx-1"></div>
                      
                      {/* 정렬 */}
                      <button
                        type="button"
                        onClick={handleAlignLeft}
                        className="p-2 hover:bg-gray-200 rounded"
                        title="왼쪽 정렬"
                      >
                        ⬅
                      </button>
                      <button
                        type="button"
                        onClick={handleAlignCenter}
                        className="p-2 hover:bg-gray-200 rounded"
                        title="가운데 정렬"
                      >
                        ↔
                      </button>
                      <button
                        type="button"
                        onClick={handleAlignRight}
                        className="p-2 hover:bg-gray-200 rounded"
                        title="오른쪽 정렬"
                      >
                        ➡
                      </button>
                      
                      <div className="w-px h-6 bg-gray-300 mx-1"></div>
                      
                      {/* 폰트 크기 */}
                      <select
                        onChange={handleFontSize}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                        title="폰트 크기"
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
                        onChange={handleFontColor}
                        className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                        title="폰트 색상"
                      />
                      
                      <div className="w-px h-6 bg-gray-300 mx-1"></div>
                      
                      {/* 링크 삽입 */}
                      <button
                        type="button"
                        onClick={handleInsertLink}
                        className="p-2 hover:bg-gray-200 rounded"
                        title="링크 삽입"
                      >
                        🔗
                      </button>
                      
                      {/* 이미지 삽입 */}
                      <label className="p-2 hover:bg-gray-200 rounded cursor-pointer" title="이미지 삽입">
                        📷
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleInsertImage}
                          className="hidden"
                          onClick={saveCursorPosition}
                        />
                      </label>
                    </div>
                  </div>
                  
                  {/* 에디터 영역 */}
                  <div
                    ref={editorRef}
                    contentEditable
                    onInput={handleEditorChange}
                    onFocus={handleEditorFocus}
                    onBlur={handleEditorBlur}
                    onMouseUp={handleEditorSelection}
                    onKeyUp={handleEditorSelection}
                    onKeyDown={saveCursorPosition}
                    onClick={saveCursorPosition}
                    suppressContentEditableWarning
                    data-placeholder="상세 설명을 입력하세요..."
                    className="w-full min-h-[300px] px-4 py-3 border border-t-0 border-gray-300 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                    style={{
                      outline: 'none',
                      lineHeight: '1.6',
                    }}
                  />
                  
                  {/* 선택된 텍스트 표시 (디버깅용) */}
                  {selectedText && (
                    <div className="mt-2 text-xs text-gray-500">
                      선택된 텍스트: "{selectedText}"
                    </div>
                  )}
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
