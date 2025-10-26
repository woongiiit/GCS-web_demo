'use client'

import { useState, useEffect } from 'react'
import { usePermissions } from '@/contexts/AuthContext'
import { permissions } from '@/lib/permissions'
import TinyMCEEditor from '@/components/TinyMCEEditor'

interface ContentData {
  id?: string
  section: string
  title?: string
  content?: string
  imageUrl?: string
  imageAlt?: string
  order: number
  isActive: boolean
  items?: ContentItem[]
}

interface ContentItem {
  id?: string
  title?: string
  subtitle?: string
  description?: string
  htmlContent?: string
  imageUrl?: string
  imageAlt?: string
  order: number
  isActive: boolean
  type?: 'area' | 'subject' // 영역과 과목을 구분하는 필드
}

const SECTIONS = [
  { key: 'GCS_WEB', label: 'GCS:Web', description: 'GCS:Web 전공 소개' },
  { key: 'MAJOR_INTRO', label: '전공 소개', description: '전공 소개 내용' },
  { key: 'SUBJECTS', label: '개설 과목', description: '개설 과목 정보' },
  { key: 'PROFESSORS', label: '교수진', description: '교수진 소개' }
]

export default function AdminContentPage() {
  const { role } = usePermissions()
  const [activeTab, setActiveTab] = useState('GCS_WEB')
  const [contents, setContents] = useState<Record<string, ContentData>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const fetchContents = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/content')
      const data = await response.json()
      
      if (data.success) {
        const contentMap: Record<string, ContentData> = {}
        data.data.forEach((content: any) => {
          contentMap[content.section] = content
        })
        setContents(contentMap)
      }
    } catch (error) {
      console.error('콘텐츠 조회 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchContents()
  }, [])

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('image', file)
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    
    const data = await response.json()
    if (!data.success) {
      throw new Error(data.error || '이미지 업로드 실패')
    }
    
    return data.url
  }

  const handleSave = async () => {
    if (isSaving) return
    
    setIsSaving(true)
    try {
      const currentContent = contents[activeTab]
      let imageUrl = currentContent?.imageUrl

      // 새 이미지가 선택된 경우 업로드
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage)
      }

      // 탭을 ContentSection enum으로 매핑
      const sectionMap = {
        'GCS_WEB': 'GCS_WEB',
        'MAJOR_INTRO': 'MAJOR_INTRO',
        'SUBJECTS': 'SUBJECTS',
        'PROFESSORS': 'PROFESSORS'
      }

      const contentData = {
        section: sectionMap[activeTab as keyof typeof sectionMap],
        title: currentContent?.title || '',
        content: currentContent?.content || '',
        imageUrl,
        imageAlt: currentContent?.imageAlt || '',
        order: currentContent?.order || 0,
        isActive: currentContent?.isActive !== false,
        items: currentContent?.items || []
      }

      let response
      if (currentContent?.id) {
        // 기존 콘텐츠 수정
        response = await fetch(`/api/admin/content/${currentContent.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(contentData)
        })
      } else {
        // 새 콘텐츠 생성
        response = await fetch('/api/admin/content', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(contentData)
        })
      }

      // 응답 상태 확인
      if (!response.ok) {
        console.error('HTTP 오류:', response.status, response.statusText)
        const errorText = await response.text()
        console.error('오류 응답:', errorText)
        
        // JSON 응답인지 확인
        try {
          const errorData = JSON.parse(errorText)
          console.error('파싱된 오류 데이터:', errorData)
          alert(`서버 오류: ${errorData.error || errorData.message || '알 수 없는 오류'}`)
        } catch {
          alert(`서버 오류 (${response.status}): ${response.statusText}`)
        }
        return
      }

      // JSON 파싱을 안전하게 처리
      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        console.error('JSON 파싱 오류:', jsonError)
        const responseText = await response.text()
        console.error('응답 텍스트:', responseText)
        alert('서버 응답을 파싱할 수 없습니다.')
        return
      }
      
      if (data.success) {
        alert('콘텐츠가 저장되었습니다.')
        setSelectedImage(null)
        setImagePreview(null)
        fetchContents()
      } else {
        console.error('저장 실패:', data)
        alert(data.error || '저장에 실패했습니다.')
        if (data.details) {
          console.error('상세 오류:', data.details)
        }
      }
    } catch (error) {
      console.error('저장 오류:', error)
      alert('저장 중 오류가 발생했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const currentContent = contents[activeTab]

  // 권한 체크 - 모든 hooks 호출 후에 위치
  if (!permissions.canAccessAdmin(role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">접근 권한 없음</h1>
          <p className="text-gray-600">관리자 권한이 필요합니다.</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">콘텐츠를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">콘텐츠 관리</h1>
            <p className="mt-2 text-gray-600">About 페이지의 각 섹션 콘텐츠를 관리합니다.</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 탭 네비게이션 */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {SECTIONS.map((section) => (
                <button
                  key={section.key}
                  onClick={() => setActiveTab(section.key)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === section.key
                      ? 'bg-black text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">{section.label}</div>
                  <div className="text-sm opacity-75">{section.description}</div>
                </button>
              ))}
            </nav>
          </div>

          {/* 콘텐츠 편집 영역 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  {SECTIONS.find(s => s.key === activeTab)?.label} 콘텐츠 편집
                </h2>

                {/* 탭별 맞춤형 편집 인터페이스 */}
                {activeTab === 'SUBJECTS' ? (
                  <SubjectsEditor 
                    content={currentContent}
                    onContentChange={(content) => {
                      setContents(prev => ({
                        ...prev,
                        [activeTab]: content
                      }))
                    }}
                    onImageChange={handleImageChange}
                    imagePreview={imagePreview}
                    selectedImage={selectedImage}
                  />
                ) : (
                  <DefaultEditor 
                    content={currentContent}
                    onContentChange={(content) => {
                      setContents(prev => ({
                        ...prev,
                        [activeTab]: content
                      }))
                    }}
                    onImageChange={handleImageChange}
                    imagePreview={imagePreview}
                    selectedImage={selectedImage}
                  />
                )}

                {/* 저장 버튼 */}
                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                      isSaving
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-black text-white hover:bg-gray-800'
                    }`}
                  >
                    {isSaving ? '저장 중...' : '저장'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 기본 편집기 (GCS:Web, 전공 소개, 교수진용)
function DefaultEditor({ 
  content, 
  onContentChange, 
  onImageChange, 
  imagePreview, 
  selectedImage 
}: {
  content?: ContentData
  onContentChange: (content: ContentData) => void
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  imagePreview: string | null
  selectedImage: File | null
}) {
  return (
    <div className="space-y-6">
      {/* 제목 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          제목
        </label>
        <input
          type="text"
          value={content?.title || ''}
          onChange={(e) => {
            onContentChange({
              ...content!,
              title: e.target.value
            })
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          placeholder="섹션 제목을 입력하세요"
        />
      </div>

      {/* 이미지 업로드 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          이미지
        </label>
        <div className="space-y-4">
          {/* 현재 이미지 또는 미리보기 */}
          {(imagePreview || content?.imageUrl) && (
            <div className="relative">
              <img
                src={imagePreview || content?.imageUrl}
                alt="이미지 미리보기"
                className="w-full h-48 object-cover rounded-lg border"
              />
              {selectedImage && (
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-sm">
                  새 이미지
                </div>
              )}
            </div>
          )}
          
          {/* 파일 선택 */}
          <input
            type="file"
            accept="image/*"
            onChange={onImageChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
          />
        </div>
      </div>

      {/* 이미지 Alt 텍스트 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          이미지 설명 (Alt 텍스트)
        </label>
        <input
          type="text"
          value={content?.imageAlt || ''}
          onChange={(e) => {
            onContentChange({
              ...content!,
              imageAlt: e.target.value
            })
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          placeholder="이미지에 대한 설명을 입력하세요"
        />
      </div>

      {/* 콘텐츠 편집 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          콘텐츠
        </label>
        <TinyMCEEditor
          value={content?.content || ''}
          onChange={(contentValue) => {
            onContentChange({
              ...content!,
              content: contentValue
            })
          }}
          placeholder="섹션 콘텐츠를 입력하세요..."
          height={300}
        />
      </div>
    </div>
  )
}

// 개설 과목 전용 편집기 (계층적 구조)
function SubjectsEditor({ 
  content, 
  onContentChange, 
  onImageChange, 
  imagePreview, 
  selectedImage 
}: {
  content?: ContentData
  onContentChange: (content: ContentData) => void
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  imagePreview: string | null
  selectedImage: File | null
}) {
  // 영역과 과목을 구분하는 더 정확한 방법 사용
  const [areas, setAreas] = useState<ContentItem[]>([])
  const [subjects, setSubjects] = useState<ContentItem[]>([])

  // content가 변경될 때 영역과 과목을 분리
  useEffect(() => {
    if (content?.items) {
      const areasList = content.items.filter(item => item.type === 'area')
      const subjectsList = content.items.filter(item => item.type === 'subject')
      setAreas(areasList)
      setSubjects(subjectsList)
    }
  }, [content?.items])

  const addArea = () => {
    const newArea: ContentItem = {
      title: '',
      subtitle: '',
      description: '',
      order: areas.length,
      isActive: true,
      type: 'area'
    }
    const updatedAreas = [...areas, newArea]
    setAreas(updatedAreas)
    // 즉시 부모 컴포넌트에 변경사항 전달
    onContentChange({
      ...(content || {}),
      items: [...updatedAreas, ...subjects]
    })
  }

  const addSubject = () => {
    const newSubject: ContentItem = {
      title: '',
      subtitle: '',
      description: '',
      htmlContent: '',
      order: subjects.length,
      isActive: true,
      type: 'subject'
    }
    const updatedSubjects = [...subjects, newSubject]
    setSubjects(updatedSubjects)
    // 즉시 부모 컴포넌트에 변경사항 전달
    onContentChange({
      ...(content || {}),
      items: [...areas, ...updatedSubjects]
    })
  }

  const updateArea = (index: number, field: keyof ContentItem, value: string) => {
    const updatedAreas = [...areas]
    updatedAreas[index] = { ...updatedAreas[index], [field]: value }
    setAreas(updatedAreas)
    onContentChange({
      ...(content || {}),
      items: [...updatedAreas, ...subjects]
    })
  }

  const updateSubject = (index: number, field: keyof ContentItem, value: string) => {
    const updatedSubjects = [...subjects]
    updatedSubjects[index] = { ...updatedSubjects[index], [field]: value }
    setSubjects(updatedSubjects)
    onContentChange({
      ...(content || {}),
      items: [...areas, ...updatedSubjects]
    })
  }

  const removeArea = (index: number) => {
    const updatedAreas = areas.filter((_, i) => i !== index)
    setAreas(updatedAreas)
    onContentChange({
      ...(content || {}),
      items: [...updatedAreas, ...subjects]
    })
  }

  const removeSubject = (index: number) => {
    const updatedSubjects = subjects.filter((_, i) => i !== index)
    setSubjects(updatedSubjects)
    onContentChange({
      ...(content || {}),
      items: [...areas, ...updatedSubjects]
    })
  }

  const addSubjectToArea = (areaIndex: number) => {
    const newSubject: ContentItem = {
      title: '',
      subtitle: '',
      description: '',
      htmlContent: '',
      order: subjects.length,
      isActive: true,
      type: 'subject'
    }
    const updatedSubjects = [...subjects, newSubject]
    setSubjects(updatedSubjects)
    onContentChange({
      ...(content || {}),
      items: [...areas, ...updatedSubjects]
    })
  }

  const removeSubjectFromArea = (areaIndex: number, subjectIndex: number) => {
    const areaSubjects = subjects.filter(subject => 
      subject.title && areas[areaIndex].title && 
      subject.title.toLowerCase().includes(areas[areaIndex].title.toLowerCase())
    )
    const subjectToRemove = areaSubjects[subjectIndex]
    if (subjectToRemove) {
      const updatedSubjects = subjects.filter(subject => subject !== subjectToRemove)
      setSubjects(updatedSubjects)
      onContentChange({
        ...(content || {}),
        items: [...areas, ...updatedSubjects]
      })
    }
  }

  return (
    <div className="space-y-8">
      {/* 메인 제목 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          메인 제목
        </label>
        <input
          type="text"
          value={content?.title || ''}
          onChange={(e) => {
            onContentChange({
              ...content!,
              title: e.target.value
            })
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          placeholder="예: GCS 개설과목"
        />
      </div>

      {/* 메인 이미지 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          메인 이미지
        </label>
        <div className="space-y-4">
          {(imagePreview || content?.imageUrl) && (
            <div className="relative">
              <img
                src={imagePreview || content?.imageUrl}
                alt="이미지 미리보기"
                className="w-full h-48 object-cover rounded-lg border"
              />
              {selectedImage && (
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-sm">
                  새 이미지
                </div>
              )}
            </div>
          )}
          
          <input
            type="file"
            accept="image/*"
            onChange={onImageChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
          />
        </div>
      </div>

      {/* 영역 섹션 */}
      <div className="border-t pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">영역 (Areas)</h3>
          <button
            onClick={addArea}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            영역 추가
          </button>
        </div>

        <div className="space-y-4">
          {areas.map((area, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-700">영역 {index + 1}</h4>
                <button
                  onClick={() => removeArea(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  삭제
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    영역명 (한글)
                  </label>
                  <input
                    type="text"
                    value={area.title || ''}
                    onChange={(e) => updateArea(index, 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="예: 예술"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    영역명 (영문)
                  </label>
                  <input
                    type="text"
                    value={area.subtitle || ''}
                    onChange={(e) => updateArea(index, 'subtitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="예: Art"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  영역 설명
                </label>
                <textarea
                  value={area.description || ''}
                  onChange={(e) => updateArea(index, 'description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="예: 미술학, 영화영상학, 디자인학 (콤마로 구분하여 입력)"
                />
              </div>
              
            </div>
          ))}
        </div>
      </div>

      {/* 과목 섹션 */}
      <div className="border-t pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">과목 (Subjects)</h3>
          <button
            onClick={addSubject}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            과목 추가
          </button>
        </div>

        <div className="space-y-6">
          {subjects.map((subject, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-700">과목 {index + 1}</h4>
                <button
                  onClick={() => removeSubject(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  삭제
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    과목 코드
                  </label>
                  <input
                    type="text"
                    value={subject.title || ''}
                    onChange={(e) => updateSubject(index, 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="예: GCS2001"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    과목명
                  </label>
                  <input
                    type="text"
                    value={subject.subtitle || ''}
                    onChange={(e) => updateSubject(index, 'subtitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="예: 컬러매니지먼트"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  과목 설명
                </label>
                <TinyMCEEditor
                  value={subject.htmlContent || ''}
                  onChange={(content) => updateSubject(index, 'htmlContent', content)}
                  placeholder="과목에 대한 상세 설명을 입력하세요..."
                  height={150}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
