'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { usePermissions } from '@/contexts/AuthContext'
import { permissions } from '@/lib/permissions'
import AboutTermsModal from '@/components/AboutTermsModal'

// Figma image assets
const imgWeuiBackFilled = "https://www.figma.com/api/mcp/asset/cb288776-7829-438f-a2c6-462a52539e69"
const img6 = "https://www.figma.com/api/mcp/asset/fa11a7ba-2a0b-4d6e-b9f8-49adae8fdbb8"
const img7 = "https://www.figma.com/api/mcp/asset/45481773-a678-47f0-9182-4e85d59305ff"
const img8 = "https://www.figma.com/api/mcp/asset/9a14bd35-f556-4b70-9b4c-57ee735e634e"
const img9 = "https://www.figma.com/api/mcp/asset/161d1f13-4619-4d49-897f-5004c9cb6019"
const img10 = "https://www.figma.com/api/mcp/asset/0e880f89-a65b-4cfa-ba39-ba089de2a9de"
const imgLine294 = "https://www.figma.com/api/mcp/asset/e83873cd-d872-47e0-ac83-947ab6f66bab"

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { role, user } = usePermissions()
  const projectId = params.id as string
  const [project, setProject] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false)

  useEffect(() => {
    fetchProjectDetail()
  }, [projectId])

  const fetchProjectDetail = async () => {
    try {
      const response = await fetch(`/api/archive/projects/${projectId}`)
      const data = await response.json()
      if (data.success) {
        setProject(data.data)
      }
    } catch (error) {
      console.error('프로젝트 상세 조회 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#f8f6f4] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a1918] mx-auto mb-4"></div>
          <p className="text-[#5f5a58]">프로젝트 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="fixed inset-0 bg-[#f8f6f4] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#5f5a58] mb-4">프로젝트를 찾을 수 없습니다.</p>
          <Link href="/archive" className="text-[#fd6f22] hover:underline">
            Archive로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  // 팀 멤버 데이터 파싱 (content에서 추출하거나 별도 필드에서 가져오기)
  const teamMembers = project.teamMembers || []
  const interviewContent = project.content || ''
  const projectImage = project.images && project.images.length > 0 ? project.images[0] : null

  return (
    <div className="bg-[#f8f6f4] min-h-screen flex flex-col items-center relative w-full">
      {/* NavBar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="bg-[#f8f6f4] h-[34px] shrink-0 w-full" />
        <div className="bg-[#f8f6f4] content-stretch flex h-[44px] items-center justify-between overflow-clip px-[16px] py-[10px] relative shadow-[0px_4px_10px_0px_rgba(99,81,73,0.1)] shrink-0 w-full">
          <Link href="/archive" className="h-[24px] relative shrink-0 w-[12px]">
            <img className="block max-w-none size-full" alt="뒤로가기" src={imgWeuiBackFilled} />
          </Link>
          <Link href="/" className="h-[18.9px] relative shrink-0 w-[53.62px]">
            <div className="absolute inset-[1.48%_82.19%_0_0]">
              <img className="block max-w-none size-full" alt="GCS Logo" src={img6} />
            </div>
            <div className="absolute inset-[0_0_0_68.67%]">
              <img className="block max-w-none size-full" alt="GCS Logo" src={img7} />
            </div>
            <div className="absolute inset-[32.59%_-3.66%_23.7%_-2.35%]">
              <img className="block max-w-none size-full" alt="GCS Logo" src={img8} />
            </div>
            <div className="absolute inset-[1.48%_65.71%_0.06%_18.58%]">
              <img className="block max-w-none size-full" alt="GCS Logo" src={img9} />
            </div>
            <div className="absolute inset-[1.48%_32.86%_0_36.07%]">
              <img className="block max-w-none size-full" alt="GCS Logo" src={img10} />
            </div>
          </Link>
          <div className="h-[24px] opacity-0 shrink-0 w-[12px]" />
        </div>
      </div>

      <div className="h-[78px] shrink-0 w-full" />

      {/* Interview Banner */}
      <div className="flex flex-col items-start relative shrink-0 w-full">
        <div className="h-[243.75px] overflow-clip relative shrink-0 w-full" style={{ 
          backgroundImage: "linear-gradient(90deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.2) 100%), linear-gradient(247.8662727902676deg, rgba(206, 206, 206, 1) 11.811%, rgba(250, 155, 103, 1) 103.1%)" 
        }}>
          <div className="absolute bg-gradient-to-l from-[rgba(255,178,114,0.6)] h-[243.75px] left-0 to-[#fd6f22] top-[-1px] w-full" />
        </div>
        <div className="flex flex-col gap-[35px] h-[233px] items-center justify-end pb-[20px] pt-0 px-0 relative shrink-0 w-full">
          {projectImage && (
            <div className="border border-[#717171] border-solid flex items-center justify-center relative rounded-[4px] shrink-0 w-[221px]">
              <div className="h-[276px] relative rounded-[4px] shadow-[0px_4px_10px_0px_rgba(0,0,0,0.2)] shrink-0 w-[221px]">
                <img 
                  alt={project.title} 
                  className="absolute max-w-none object-cover rounded-[4px] size-full" 
                  src={projectImage}
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjIxIiBoZWlnaHQ9IjI3NiIgdmlld0JveD0iMCAwIDIyMSAyNzYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMjEiIGhlaWdodD0iMjc2IiBmaWxsPSIjRjVGNTI1Ii8+Cjx0ZXh0IHg9IjExMC41IiB5PSIxMzgiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Qcm9qZWN0IEltYWdlPC90ZXh0Pgo8L3N2Zz4='
                  }}
                />
              </div>
            </div>
          )}
          <div className="flex flex-col gap-[12px] items-start relative shrink-0 w-full px-[20px]">
            <div className="flex flex-col font-bold justify-center leading-[0] not-italic relative shrink-0 text-[24px] text-[#1a1918] text-center w-full">
              <p className="leading-[1.5] whitespace-pre-wrap">{project.title}</p>
            </div>
            {teamMembers.length > 0 && (
              <div className="flex items-center justify-between px-[20px] py-0 relative shrink-0 w-full">
                <div className="flex gap-[3.811px] items-center relative shrink-0">
                  {teamMembers.slice(0, 3).map((member: any, index: number) => (
                    <div key={index} className="relative shrink-0 size-[47px] rounded-full overflow-hidden bg-gray-200">
                      {member.profileImage ? (
                        <img alt={member.name || `멤버 ${index + 1}`} className="block max-w-none size-full object-cover" src={member.profileImage} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600 text-xs">
                          {member.name ? member.name.charAt(0) : '?'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 본문 내용 */}
      <div className="bg-[#f8f6f4] flex flex-col gap-[20px] items-center px-0 py-[30px] relative shrink-0 w-full">
        {/* 인터뷰 섹션 */}
        {interviewContent && (
          <div className="flex flex-col items-center justify-center px-[16px] py-[20px] relative shrink-0 w-full max-w-[375px]">
            <div className="flex flex-col gap-[16px] items-center relative shrink-0 w-full">
              <div className="flex flex-col gap-[12px] items-start relative shrink-0 w-full">
                <div className="flex flex-col items-start relative shrink-0 w-full">
                  <div className="font-bold leading-[1.5] not-italic relative shrink-0 text-[17px] text-[#5f5a58]">
                    <p className="mb-0">안녕하세요. {project.title}팀!</p>
                    <p>간단하게 팀 소개 부탁드립니다.</p>
                  </div>
                </div>
                <div className="h-0 relative shrink-0 w-full">
                  <div className="absolute bottom-full left-0 right-0 top-0">
                    <img className="block max-w-none size-full" alt="" src={imgLine294} />
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-start relative shrink-0 w-full">
                <div className="flex items-center justify-center relative shrink-0 w-full">
                  <div className="flex-1 font-normal leading-[1.5] not-italic relative shrink-0 text-[15px] text-[#5f5a58] whitespace-pre-wrap">
                    {interviewContent.split('\n').map((paragraph: string, index: number) => {
                      if (paragraph.trim() === '') {
                        return <br key={index} aria-hidden="true" />
                      }
                      return <p key={index} className="mb-0">{paragraph}</p>
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 프로젝트 이미지 */}
        {project.images && project.images.length > 1 && (
          <div className="flex items-center relative shrink-0 w-full max-w-[375px] px-4">
            <div className="h-[389px] relative shrink-0 w-full max-w-[294px] mx-auto">
              <img 
                alt="프로젝트 이미지" 
                className="absolute max-w-none object-cover size-full rounded-lg" 
                src={project.images[1]}
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjk0IiBoZWlnaHQ9IjM4OSIgdmlld0JveD0iMCAwIDI5NCAzODkiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyOTQiIGhlaWdodD0iMzg5IiBmaWxsPSIjRjVGNTI1Ii8+Cjx0ZXh0IHg9IjE0NyIgeT0iMTk0LjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Qcm9qZWN0IEltYWdlPC90ZXh0Pgo8L3N2Zz4='
                }}
              />
            </div>
          </div>
        )}

        {/* 팀 멤버 섹션 */}
        {teamMembers.length > 0 && (
          <div className="flex flex-col items-center justify-center px-[16px] py-[20px] relative shrink-0 w-full max-w-[375px]">
            <div className="flex flex-col gap-[16px] items-center relative shrink-0 w-full">
              <div className="flex flex-col gap-[12px] items-start relative shrink-0 w-full">
                <div className="flex flex-col items-start relative shrink-0 w-full">
                  <p className="font-bold leading-[1.5] not-italic relative shrink-0 text-[17px] text-[#5f5a58]">
                    {teamMembers.length} Members
                  </p>
                </div>
                <div className="h-0 relative shrink-0 w-full">
                  <div className="absolute bottom-full left-0 right-0 top-0">
                    <img className="block max-w-none size-full" alt="" src={imgLine294} />
                  </div>
                </div>
              </div>
              <div className="h-[342px] relative shrink-0 w-full">
                {teamMembers.map((member: any, index: number) => {
                  const positions = [
                    { left: '0', top: '0', width: '236px' },
                    { left: '83px', top: '105px', width: '260px' },
                    { left: '0', top: '232px', width: '260px' }
                  ]
                  const position = positions[index] || { left: '0', top: `${index * 105}px`, width: '260px' }
                  
                  return (
                    <div 
                      key={index}
                      className="absolute bg-[#eeebe6] border border-[rgba(255,178,114,0.6)] border-solid flex flex-col items-start p-[12px] rounded-[8px]"
                      style={{ left: position.left, top: position.top, width: position.width }}
                    >
                      <div className="flex flex-col gap-[8px] items-start relative shrink-0 w-full">
                        <div className="flex gap-[12px] items-center relative shrink-0">
                          <div className="flex flex-col h-[23px] items-start relative shrink-0">
                            <p className="font-bold leading-[1.5] not-italic relative shrink-0 text-[15px] text-[#5f5a58] text-right">
                              {member.name || `멤버 ${index + 1}`}
                            </p>
                          </div>
                          {member.major && (
                            <div className="flex flex-col h-[20px] items-start relative shrink-0">
                              <p className="font-normal leading-[1.5] not-italic relative shrink-0 text-[13px] text-[#85817e] text-right tracking-[-0.26px]">
                                {member.major}
                              </p>
                            </div>
                          )}
                        </div>
                        {member.role && (
                          <div className="flex flex-col items-start relative shrink-0 w-full">
                            <p className="font-normal leading-[1.5] not-italic relative shrink-0 text-[13px] text-[#85817e] tracking-[-0.26px]">
                              {member.role}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 프로젝트 상품 섹션 */}
      {project.relatedProducts && project.relatedProducts.length > 0 && (
        <div className="flex flex-col gap-[12px] items-start relative shrink-0 w-full max-w-[375px] px-4 pb-8">
          <div className="flex flex-col h-[59px] items-center relative shrink-0 w-full">
            <div className="relative shrink-0">
              <p className="font-bold leading-[30px] not-italic relative shrink-0 text-[#1a1918] text-[25px]">
                프로젝트 상품
              </p>
            </div>
            <div className="relative shrink-0">
              <p className="font-normal leading-[21px] not-italic relative shrink-0 text-[#85817e] text-[14px]">
                {project.title}팀이 만든 제품을 만나보세요
              </p>
            </div>
          </div>
          <div className="h-0 relative shrink-0 w-full">
            <div className="absolute bottom-full left-0 right-0 top-0">
              <img className="block max-w-none size-full" alt="" src={imgLine294} />
            </div>
          </div>
          <div className="bg-[#eeebe6] flex flex-col items-start p-[16px] relative shrink-0 w-full">
            {project.relatedProducts.map((product: any, index: number) => (
              <Link 
                key={index}
                href={`/shop/${product.id}`}
                className="flex flex-col gap-[8px] items-start relative shrink-0 w-full"
              >
                <div className="flex gap-[16px] items-start relative shrink-0 w-full">
                  {product.image && (
                    <div className="relative rounded-[4px] shrink-0 size-[100px] overflow-hidden">
                      <img 
                        alt={product.name} 
                        className="absolute max-w-none object-cover size-full" 
                        src={product.image}
                      />
                    </div>
                  )}
                  <div className="flex flex-[1_0_0] flex-col gap-[8px] items-start min-h-px min-w-px relative self-stretch shrink-0">
                    <div className="flex flex-col items-start justify-end leading-[1.5] not-italic relative shrink-0 text-[#1a1918] w-full">
                      <p className="font-bold relative shrink-0 text-[15px]">
                        {product.name}
                      </p>
                      {product.seller && (
                        <p className="font-normal min-w-full relative shrink-0 text-[13px] tracking-[-0.26px] w-[min-content] whitespace-pre-wrap">
                          {product.seller}
                        </p>
                      )}
                    </div>
                    {product.description && (
                      <div className="flex flex-col items-start relative shrink-0 w-full">
                        <p className="font-normal leading-[1.5] not-italic relative shrink-0 text-[10px] text-[#85817e] w-full whitespace-pre-wrap">
                          {product.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-[#f8f6f4] flex flex-col items-start relative shrink-0 w-full">
        <div className="bg-[#f8f6f4] h-[34px] shrink-0 w-full" />
        <div className="bg-[#f8f6f4] content-stretch flex items-center overflow-clip p-[21px] relative shrink-0 w-full">
          <div className="content-stretch flex flex-col gap-[45px] items-start relative shrink-0 w-[263px]">
            <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
              <div className="flex flex-col font-bold justify-center leading-[0] not-italic relative shrink-0 text-[17px] text-[#443e3c] w-full">
                <p className="leading-[1.5] whitespace-pre-wrap">고객지원</p>
              </div>
              <div className="content-stretch flex flex-col gap-[12px] items-start leading-[0] not-italic relative shrink-0 text-[0px] text-[#85817e] tracking-[-0.26px] w-full">
                <div className="flex flex-col justify-center min-w-full relative shrink-0 w-[min-content]">
                  <p className="leading-[1.5] text-[13px] whitespace-pre-wrap">
                    <span className="font-bold not-italic tracking-[-0.26px]">전화</span>
                    <span>: 010-5238-0236</span>
                  </p>
                </div>
                <div className="flex flex-col justify-center relative shrink-0 whitespace-nowrap">
                  <p className="leading-[1.5] text-[13px]">
                    <span className="font-bold not-italic tracking-[-0.26px]">이메일</span>
                    <span>: gcsweb01234@gmail.com</span>
                  </p>
                </div>
                <div className="flex flex-col justify-center min-w-full relative shrink-0 w-[min-content]">
                  <p className="leading-[1.5] text-[13px] whitespace-pre-wrap">
                    <span className="font-bold not-italic tracking-[-0.26px]">주소</span>
                    <span>: 서울특별시 강북구 솔샘로 174 136동 304호</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
              <div className="flex flex-col font-bold justify-center leading-[0] not-italic relative shrink-0 text-[17px] text-[#443e3c] w-full">
                <p className="leading-[1.5] whitespace-pre-wrap">사업자 정보</p>
              </div>
              <div className="content-stretch flex flex-col gap-[12px] items-start leading-[0] not-italic relative shrink-0 text-[0px] text-[#85817e] tracking-[-0.26px] w-full">
                <div className="content-stretch flex gap-[40px] items-center relative shrink-0 whitespace-nowrap">
                  <div className="flex flex-col justify-center relative shrink-0">
                    <p className="leading-[1.5] text-[13px]">
                      <span className="font-bold not-italic tracking-[-0.26px]">대표</span>
                      <span>: 안성은</span>
                    </p>
                  </div>
                  <div className="flex flex-col justify-center relative shrink-0">
                    <p className="leading-[1.5] text-[13px]">
                      <span className="font-bold not-italic tracking-[-0.26px]">회사명</span>
                      <span>: 안북스 스튜디오</span>
                    </p>
                  </div>
                </div>
                <div className="flex flex-col justify-center min-w-full relative shrink-0 w-[min-content]">
                  <p className="leading-[1.5] text-[13px] whitespace-pre-wrap">
                    <span className="font-bold not-italic tracking-[-0.26px]">사업자등록번호</span>
                    <span>: 693-01-03164</span>
                  </p>
                </div>
                <div className="flex flex-col justify-center min-w-full relative shrink-0 w-[min-content]">
                  <p className="leading-[1.5] text-[13px] whitespace-pre-wrap">
                    <span className="font-bold not-italic tracking-[-0.26px]">통신판매업신고번호</span>
                    <span>: 제 2025-서울강북-0961호</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-[181px]">
              <div className="h-[21px] relative shrink-0 w-[59px]">
                <p className="text-[10px] font-bold text-[#1a1918]">GCS:Web</p>
              </div>
              <div className="content-stretch flex flex-col items-start leading-[0] not-italic relative shrink-0 text-[8px] text-[#443e3c] w-full">
                <div className="flex flex-col justify-center relative shrink-0 w-full">
                  <p className="leading-[1.5] whitespace-pre-wrap">© 2025 GCS:Web. All rights reserved.</p>
                </div>
                <div className="flex flex-col justify-center relative shrink-0 w-full">
                  <button 
                    onClick={() => setIsTermsModalOpen(true)} 
                    className="[text-underline-position:from-font] decoration-solid leading-[1.5] underline whitespace-pre-wrap text-left"
                  >
                    이용약관
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-[#f8f6f4] h-[34px] shrink-0 w-full" />
      </div>

      {/* 이용약관 모달 */}
      {isTermsModalOpen && (
        <AboutTermsModal 
          isOpen={isTermsModalOpen} 
          onClose={() => setIsTermsModalOpen(false)} 
        />
      )}
    </div>
  )
}
