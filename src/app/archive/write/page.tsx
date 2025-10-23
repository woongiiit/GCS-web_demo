'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { permissions } from '@/lib/permissions'
import Link from 'next/link'

function ArchiveWriteContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const editId = searchParams.get('edit') // 수정 모드인지 확인
  const isEditMode = !!editId
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'project', // 'project' 또는 'news'
    year: new Date().getFullYear().toString(),
    members: '', // 프로젝트의 경우
    isFeatured: false
  })
  
  // 리치 텍스트 에디터 관련 상태
  const [editorContent, setEditorContent] = useState('')
  const [isEditorFocused, setIsEditorFocused] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const [lastCursorPosition, setLastCursorPosition] = useState<Range | null>(null)
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    alignLeft: false,
    alignCenter: false,
    alignRight: false
  })
  const editorRef = useRef<HTMLDivElement>(null)
  
  // 대표 이미지 관련 상태
  const [coverImages, setCoverImages] = useState<File[]>([])
  const [coverImagePreviews, setCoverImagePreviews] = useState<string[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  
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

  // 수정 모드에서 기존 글 데이터 로드
  useEffect(() => {
    if (isEditMode && editId) {
      fetchArchiveData()
    }
  }, [isEditMode, editId])

  const fetchArchiveData = async () => {
    try {
      const apiUrl = formData.type === 'project' 
        ? `/api/archive/projects/${editId}` 
        : `/api/archive/news/${editId}`
      
      const response = await fetch(apiUrl)
      const data = await response.json()
      
      if (data.success) {
        const item = data.data
        // 수정 권한 확인
        if (!permissions.canEditPost(user?.role, item.authorId, user?.id)) {
          alert('수정 권한이 없습니다.')
          router.push('/archive')
          return
        }
        
        setFormData({
          title: item.title,
          content: item.content || item.description,
          type: formData.type,
          year: item.year.toString(),
          members: item.teamMembers ? item.teamMembers.join(', ') : '',
          isFeatured: item.isFeatured || false
        })
        setEditorContent(item.content || item.description)
        setCoverImagePreviews(item.images || [])
      } else {
        alert('글을 불러올 수 없습니다.')
        router.push('/archive')
      }
    } catch (error) {
      console.error('글 데이터 로드 오류:', error)
      alert('글을 불러오는 중 오류가 발생했습니다.')
      router.push('/archive')
    }
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

  // 대표 이미지 업로드
  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (coverImages.length + imageFiles.length > 5) {
      setMessage('최대 5개의 대표 이미지를 업로드할 수 있습니다.')
      setMessageType('error')
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

  // 본문 이미지 업로드
  const handleEditorImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드할 수 있습니다.')
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string
        if (imageUrl && editorRef.current) {
          // 현재 커서 위치에 이미지 삽입
          const selection = window.getSelection()
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0)
            const img = document.createElement('img')
            img.src = imageUrl
            img.style.maxWidth = '100%'
            img.style.height = 'auto'
            img.style.display = 'block'
            img.style.margin = '10px auto'
            img.style.borderRadius = '8px'
            img.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
            
            range.deleteContents()
            range.insertNode(img)
            range.setStartAfter(img)
            range.setEndAfter(img)
            selection.removeAllRanges()
            selection.addRange(range)
          }
          
          handleEditorChange()
        }
      }
      reader.readAsDataURL(file)
    })

    // 파일 입력 초기화
    e.target.value = ''
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

  // 리치 텍스트 에디터 핸들러
  const handleEditorChange = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML
      setEditorContent(content)
      setFormData(prev => ({ ...prev, content }))
      updateActiveFormats()
    }
  }

  const updateActiveFormats = () => {
    if (!editorRef.current) return
    
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return
    
    const range = selection.getRangeAt(0)
    const container = range.commonAncestorContainer
    
    // 현재 선택된 텍스트의 포맷팅 상태 확인
    const isBold = document.queryCommandState('bold')
    const isItalic = document.queryCommandState('italic')
    const isUnderline = document.queryCommandState('underline')
    
    // 정렬 상태 확인
    const parentElement = container.nodeType === Node.TEXT_NODE 
      ? container.parentElement 
      : container as Element
    
    let alignLeft = false, alignCenter = false, alignRight = false
    
    if (parentElement) {
      const computedStyle = window.getComputedStyle(parentElement)
      const textAlign = computedStyle.textAlign
      
      if (textAlign === 'left' || textAlign === 'start') alignLeft = true
      else if (textAlign === 'center') alignCenter = true
      else if (textAlign === 'right' || textAlign === 'end') alignRight = true
    }
    
    setActiveFormats({
      bold: isBold,
      italic: isItalic,
      underline: isUnderline,
      alignLeft,
      alignCenter,
      alignRight
    })
  }

  const handleEditorFocus = () => {
    setIsEditorFocused(true)
    // 포커스 시 마지막 커서 위치 복원
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.focus()
        restoreCursorPosition()
      }
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
    setIsSubmitting(true)
    setMessage('')

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
      
      const url = isEditMode 
        ? (formData.type === 'project' 
            ? `/api/archive/projects/${editId}` 
            : `/api/archive/news/${editId}`)
        : '/api/archive/write'
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
          type: formData.type,
          year: formData.year,
          members: formData.members,
          images: galleryImages, // 대표 이미지들
          isFeatured: formData.isFeatured
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(isEditMode ? '글이 성공적으로 수정되었습니다.' : '글이 성공적으로 작성되었습니다.')
        setMessageType('success')
        
        // 성공 후 Archive 페이지로 이동 (새로고침 강제)
        setTimeout(() => {
          router.push('/archive')
          router.refresh() // 페이지 새로고침 강제
        }, 1500)
      } else {
        console.error(isEditMode ? '글 수정 실패:' : '글 작성 실패:', data.error)
        setMessage(data.error || (isEditMode ? '글 수정에 실패했습니다. 다시 시도해주세요.' : '글 작성에 실패했습니다. 다시 시도해주세요.'))
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
              <h1 className="text-4xl font-bold text-white mb-4">Archive</h1>
              <p className="text-white text-sm mb-8">
                {isEditMode 
                  ? (formData.type === 'project' ? '프로젝트를 수정하세요.' : '뉴스를 수정하세요.')
                  : (formData.type === 'project' ? '새로운 프로젝트를 등록하세요.' : '새로운 뉴스를 작성하세요.')
                }
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
                        title="실행 취소 (Ctrl+Z)"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={handleRedo}
                        className="p-2 hover:bg-gray-200 rounded text-sm font-medium"
                        title="다시 실행 (Ctrl+Y)"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
                        </svg>
                      </button>
                      
                      <div className="w-px h-6 bg-gray-300 mx-1"></div>
                      
                      {/* 텍스트 포맷팅 */}
                      <button
                        type="button"
                        onClick={handleBold}
                        className={`p-2 rounded transition-colors ${
                          activeFormats.bold 
                            ? 'bg-blue-500 text-white' 
                            : 'hover:bg-gray-200'
                        }`}
                        title="굵게 (Ctrl+B)"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/>
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={handleItalic}
                        className={`p-2 rounded transition-colors ${
                          activeFormats.italic 
                            ? 'bg-blue-500 text-white' 
                            : 'hover:bg-gray-200'
                        }`}
                        title="기울임 (Ctrl+I)"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z"/>
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={handleUnderline}
                        className={`p-2 rounded transition-colors ${
                          activeFormats.underline 
                            ? 'bg-blue-500 text-white' 
                            : 'hover:bg-gray-200'
                        }`}
                        title="밑줄 (Ctrl+U)"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/>
                        </svg>
                      </button>
                      
                      <div className="w-px h-6 bg-gray-300 mx-1"></div>
                      
                      {/* 정렬 */}
                      <button
                        type="button"
                        onClick={handleAlignLeft}
                        className={`p-2 rounded transition-colors ${
                          activeFormats.alignLeft 
                            ? 'bg-blue-500 text-white' 
                            : 'hover:bg-gray-200'
                        }`}
                        title="왼쪽 정렬"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z"/>
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={handleAlignCenter}
                        className={`p-2 rounded transition-colors ${
                          activeFormats.alignCenter 
                            ? 'bg-blue-500 text-white' 
                            : 'hover:bg-gray-200'
                        }`}
                        title="가운데 정렬"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z"/>
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={handleAlignRight}
                        className={`p-2 rounded transition-colors ${
                          activeFormats.alignRight 
                            ? 'bg-blue-500 text-white' 
                            : 'hover:bg-gray-200'
                        }`}
                        title="오른쪽 정렬"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z"/>
                        </svg>
                      </button>
                      
                      <div className="w-px h-6 bg-gray-300 mx-1"></div>
                      
                      {/* 이미지 업로드 */}
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleEditorImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          id="editor-image-upload-archive"
                        />
                        <button
                          type="button"
                          className="p-2 hover:bg-gray-200 rounded transition-colors"
                          title="이미지 삽입"
                          onClick={() => document.getElementById('editor-image-upload-archive')?.click()}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                      
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
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="링크 삽입 (Ctrl+K)"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
                        </svg>
                      </button>
                      
                      {/* 이미지 삽입 */}
                      <label className="p-2 hover:bg-gray-200 rounded cursor-pointer transition-colors" title="이미지 삽입">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                        </svg>
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
                    onClick={(e) => {
                      e.stopPropagation()
                      saveCursorPosition()
                    }}
                    suppressContentEditableWarning
                    data-placeholder="상세 설명을 입력하세요..."
                    className="w-full min-h-[300px] px-4 py-3 border border-t-0 border-gray-300 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                    style={{
                      outline: 'none',
                      lineHeight: '1.6',
                    }}
                  >
                    {editorContent}
                  </div>
                  
                  {/* 선택된 텍스트 표시 (디버깅용) */}
                  {selectedText && (
                    <div className="mt-2 text-xs text-gray-500">
                      선택된 텍스트: "{selectedText}"
                    </div>
                  )}
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
                    {isSubmitting ? (isEditMode ? '수정 중...' : '작성 중...') : (isEditMode ? '수정하기' : '작성하기')}
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
