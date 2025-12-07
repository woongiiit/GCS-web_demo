'use client'

import { Suspense, useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// 이미지 상수 (Figma에서 추출한 이미지 URL)
const imgBack = "https://www.figma.com/api/mcp/asset/12f1e9ec-f66c-4ca9-aba7-f9f992733055"
const imgLine = "https://www.figma.com/api/mcp/asset/a88c31b0-2121-489c-9fd0-f7ed8f924764"
const imgDownArrow = "https://www.figma.com/api/mcp/asset/daab5c73-0ff8-42a0-b282-da9e6e9e837c"

interface LogEntry {
  id: string
  content: string
  timestamp: string
  createdAt: Date
}

interface LogGroup {
  period: 'today' | 'yesterday' | 'last7days' | 'last30days'
  label: string
  logs: LogEntry[]
}

export default function LogsPage() {
  return (
    <Suspense fallback={<LogsPageSuspenseFallback />}>
      <LogsPageContent />
    </Suspense>
  )
}

function LogsPageContent() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // 로그인하지 않은 경우 또는 관리자가 아닌 경우 리다이렉트
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/')
    }
  }, [user, isLoading, router])

  const [logs, setLogs] = useState<LogGroup[]>([])
  const [isLoadingLogs, setIsLoadingLogs] = useState(true)

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchLogs()
    }
  }, [user])

  const fetchLogs = async () => {
    setIsLoadingLogs(true)
    try {
      // TODO: 실제 API 엔드포인트로 변경
      // const response = await fetch('/api/admin/logs')
      // const data = await response.json()
      
      // 임시 데이터 (Figma 디자인 기반)
      const mockLogs: LogGroup[] = [
        {
          period: 'today',
          label: '오늘',
          logs: [
            {
              id: '1',
              content: 'ㅇㅇ 관리자가 ㅁㅁ 게시글의 수정 승인을 완료했습니다.',
              timestamp: '25.11.17 13:17',
              createdAt: new Date()
            },
            {
              id: '2',
              content: "'김염소' 계정을 판매자로 등록하였습니다.",
              timestamp: '25.11.17 13:17',
              createdAt: new Date('2025-11-17T13:17:00')
            }
          ]
        },
        {
          period: 'today',
          label: '오늘',
          logs: [
            {
              id: '3',
              content: 'ㅇㅇ 관리자가 ㅁㅁ 게시글의 수정 승인을 완료했습니다.',
              timestamp: '25.11.17 13:17',
              createdAt: new Date()
            },
            {
              id: '4',
              content: "'김염소' 계정을 판매자로 등록하였습니다.",
              timestamp: '25.11.17 13:17',
              createdAt: new Date('2025-11-17T13:17:00')
            }
          ]
        },
        {
          period: 'today',
          label: '오늘',
          logs: [
            {
              id: '5',
              content: 'ㅇㅇ 관리자가 ㅁㅁ 게시글의 수정 승인을 완료했습니다.',
              timestamp: '25.11.17 13:17',
              createdAt: new Date()
            },
            {
              id: '6',
              content: "'김염소' 계정을 판매자로 등록하였습니다.",
              timestamp: '25.11.17 13:17',
              createdAt: new Date('2025-11-17T13:17:00')
            }
          ]
        }
      ]
      
      setLogs(mockLogs)
    } catch (error) {
      console.error('로그 조회 오류:', error)
    } finally {
      setIsLoadingLogs(false)
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#f8f6f4] flex items-center justify-center">
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

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="bg-[#f8f6f4] min-h-screen flex flex-col">
      {/* Nav Bar */}
      <div className="flex-shrink-0">
        <div className="bg-[#f8f6f4] h-[34px]"></div>
        <div className="bg-[#f8f6f4] flex h-[44px] items-center justify-between px-[16px] py-[10px] shadow-[0px_4px_10px_0px_rgba(99,81,73,0.1)]">
          <button
            onClick={handleBack}
            className="h-[24px] w-[12px] flex items-center justify-center"
            aria-label="뒤로가기"
          >
            <img alt="뒤로가기" className="block max-w-none size-full" src={imgBack} />
          </button>
          <p className="font-bold leading-[1.5] text-[15px] text-black">
            로그
          </p>
          <div className="h-[24px] opacity-0 w-[12px]" aria-hidden="true"></div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col gap-[44px] pb-[20px] pt-[40px] px-[20px]">
        {isLoadingLogs ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-gray-600">로그를 불러오는 중...</p>
            </div>
          </div>
        ) : (
          <>
            {logs.map((group, groupIndex) => (
              <div key={`${group.period}-${groupIndex}`} className="flex flex-col gap-[8px]">
                {/* 기간 제목 */}
                <div className="flex items-start">
                  <p className="font-bold leading-[1.5] text-[19px] text-[#1a1918]">
                    {group.label}
                  </p>
                </div>

                {/* 로그 목록 */}
                <div className="flex flex-col gap-[20px]">
                  {group.logs.map((log, index) => (
                    <div key={log.id} className="flex flex-col gap-[12px]">
                      <div className="flex flex-col gap-[8px] items-center justify-center pl-0 pr-[20px] py-0">
                        <div className="flex items-start w-full">
                          <p className="font-bold leading-[1.5] text-[13px] text-[#85817e] tracking-[-0.26px]">
                            {log.content}
                          </p>
                        </div>
                        <p className="font-normal leading-[1.5] text-[10px] text-[#85817e] w-full whitespace-pre-wrap">
                          {log.timestamp}
                        </p>
                      </div>

                      {/* 구분선 */}
                      {index < group.logs.length - 1 && (
                        <div className="h-0 w-full relative">
                          <div className="absolute bottom-0 left-0 right-0 top-[-2px]">
                            <img alt="" className="block max-w-none size-full" src={imgLine} />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* 더 많이 보기 버튼 */}
            <div className="flex items-start">
              <div className="flex gap-[12px] items-center">
                <p className="font-bold leading-[1.5] text-[15px] text-[#85817e]">
                  더 많이 보기
                </p>
                <div className="flex items-center justify-center size-[24px]">
                  <div className="flex-none rotate-[270deg] scale-y-[-100%]">
                    <div className="relative size-[24px]">
                      <img alt="더보기" className="block max-w-none size-full" src={imgDownArrow} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="bg-[#f8f6f4] flex-shrink-0 px-[21px] py-[21px]">
        <div className="flex flex-col gap-[45px]">
          {/* 고객지원 */}
          <div className="flex flex-col gap-2">
            <h3 className="text-[17px] font-bold text-[#443e3c] leading-[1.5]">
              고객지원
            </h3>
            <div className="flex flex-col gap-3 text-[13px] text-[#85817e] leading-[1.5] tracking-[-0.26px]">
              <p>
                <span className="font-bold">전화</span> : 010-5238-0236
              </p>
              <p>
                <span className="font-bold">이메일</span> : gcsweb01234@gmail.com
              </p>
              <p>
                <span className="font-bold">주소</span> : 서울특별시 강북구 솔샘로 174 136동 304호
              </p>
            </div>
          </div>
          
          {/* 사업자 정보 */}
          <div className="flex flex-col gap-2">
            <h3 className="text-[17px] font-bold text-[#443e3c] leading-[1.5]">
              사업자 정보
            </h3>
            <div className="flex flex-col gap-3 text-[13px] text-[#85817e] leading-[1.5] tracking-[-0.26px]">
              <div className="flex gap-10">
                <p>
                  <span className="font-bold">대표</span> : 안성은
                </p>
                <p>
                  <span className="font-bold">회사명</span> : 안북스 스튜디오
                </p>
              </div>
              <p>
                <span className="font-bold">사업자등록번호</span> : 693-01-03164
              </p>
              <p>
                <span className="font-bold">통신판매업신고번호</span> : 제2025-서울중구-0000호
              </p>
            </div>
          </div>
          
          {/* 로고 및 저작권 */}
          <div className="flex flex-col justify-between h-[41px]">
            <div className="h-[21px]">
              <Link href="/" className="text-lg font-bold text-black">
                GCS<span className="text-[#f57520]">:</span>Web
              </Link>
            </div>
            <p className="text-[8px] text-[#443e3c] leading-[1.5]">
              © 2025 GCS:Web. All rights reserved.
            </p>
          </div>
        </div>
        <div className="h-[34px]"></div>
      </div>
    </div>
  )
}

function LogsPageSuspenseFallback() {
  return (
    <div className="fixed inset-0 bg-[#f8f6f4] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
        <p className="text-gray-600">로딩 중...</p>
      </div>
    </div>
  )
}

