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

  // 권한 체크
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

  useEffect(() => {
    fetchContents()
  }, [])

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

      const contentData = {
        section: activeTab,
        title: currentContent?.title || '',
        content: currentContent?.content || '',
        imageUrl,
        imageAlt: currentContent?.imageAlt || '',
        order: currentContent?.order || 0,
        isActive: currentContent?.isActive !== false
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

      const data = await response.json()
      
      if (data.success) {
        alert('콘텐츠가 저장되었습니다.')
        setSelectedImage(null)
        setImagePreview(null)
        fetchContents()
      } else {
        alert(data.error || '저장에 실패했습니다.')
      }
    } catch (error) {
      console.error('저장 오류:', error)
      alert('저장 중 오류가 발생했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const currentContent = contents[activeTab]

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

                <div className="space-y-6">
                  {/* 제목 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      제목
                    </label>
                    <input
                      type="text"
                      value={currentContent?.title || ''}
                      onChange={(e) => {
                        setContents(prev => ({
                          ...prev,
                          [activeTab]: {
                            ...prev[activeTab],
                            title: e.target.value
                          }
                        }))
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
                      {(imagePreview || currentContent?.imageUrl) && (
                        <div className="relative">
                          <img
                            src={imagePreview || currentContent?.imageUrl}
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
                        onChange={handleImageChange}
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
                      value={currentContent?.imageAlt || ''}
                      onChange={(e) => {
                        setContents(prev => ({
                          ...prev,
                          [activeTab]: {
                            ...prev[activeTab],
                            imageAlt: e.target.value
                          }
                        }))
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
                      value={currentContent?.content || ''}
                      onChange={(content) => {
                        setContents(prev => ({
                          ...prev,
                          [activeTab]: {
                            ...prev[activeTab],
                            content
                          }
                        }))
                      }}
                      placeholder="섹션 콘텐츠를 입력하세요..."
                      height={300}
                    />
                  </div>

                  {/* 저장 버튼 */}
                  <div className="flex justify-end">
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
    </div>
  )
}
