'use client'

import { Suspense, useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// 이미지 상수 (Figma에서 추출한 이미지 URL)
const imgBack = "https://www.figma.com/api/mcp/asset/12f1e9ec-f66c-4ca9-aba7-f9f992733055"
const imgNotificationDot = "https://www.figma.com/api/mcp/asset/c3da32ce-0ea2-4103-9159-0aede8692c9d"
const imgLine = "https://www.figma.com/api/mcp/asset/f4914f5e-72ac-4617-ad7d-15b7c57639b7"
const imgDownArrow = "https://www.figma.com/api/mcp/asset/1b92ea9b-8348-4e89-a045-5c3fbcee6cad"

interface Notification {
  id: string
  type: 'BOARD_COMMENT' | 'ORDER_CANCELLED' | 'SELLER_REGISTERED' | string
  title: string
  content: string
  timestamp: string
  isRead: boolean
  createdAt: Date
}

interface NotificationGroup {
  period: 'today' | 'yesterday' | 'last7days' | 'last30days'
  label: string
  notifications: Notification[]
}

export default function NotificationsPage() {
  return (
    <Suspense fallback={<NotificationsPageSuspenseFallback />}>
      <NotificationsPageContent />
    </Suspense>
  )
}

function NotificationsPageContent() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // 로그인하지 않은 경우 또는 관리자가 아닌 경우 리다이렉트
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/')
    }
  }, [user, isLoading, router])

  const [notifications, setNotifications] = useState<NotificationGroup[]>([])
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true)

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchNotifications()
    }
  }, [user])

  const fetchNotifications = async () => {
    setIsLoadingNotifications(true)
    try {
      // TODO: 실제 API 엔드포인트로 변경
      // const response = await fetch('/api/admin/notifications')
      // const data = await response.json()
      
      // 임시 데이터 (Figma 디자인 기반)
      const mockNotifications: NotificationGroup[] = [
        {
          period: 'today',
          label: '오늘',
          notifications: [
            {
              id: '1',
              type: 'BOARD_COMMENT',
              title: 'Board 댓글 알림',
              content: '손염소 님의 "다음 GCS Week 현장견학 장소 추천 받습니다"  게시물에 댓글이 달렸습니다.',
              timestamp: '8분 전',
              isRead: false,
              createdAt: new Date()
            },
            {
              id: '2',
              type: 'SELLER_REGISTERED',
              title: '주문 취소',
              content: "'김염소' 계정을 판매자로 등록하였습니다.",
              timestamp: '25.11.17 13:17',
              isRead: true,
              createdAt: new Date('2025-11-17T13:17:00')
            }
          ]
        },
        {
          period: 'yesterday',
          label: '어제',
          notifications: [
            {
              id: '3',
              type: 'BOARD_COMMENT',
              title: 'Board 댓글 알림',
              content: '손염소 님의 "다음 GCS Week 현장견학 장소 추천 받습니다"  게시물에 댓글이 달렸습니다.',
              timestamp: '8분 전',
              isRead: false,
              createdAt: new Date()
            },
            {
              id: '4',
              type: 'BOARD_COMMENT',
              title: 'Board 댓글 알림',
              content: '손염소 님의 "다음 GCS Week 현장견학 장소 추천 받습니다"  게시물에 댓글이 달렸습니다.',
              timestamp: '8분 전',
              isRead: false,
              createdAt: new Date()
            }
          ]
        },
        {
          period: 'last7days',
          label: '최근 7일',
          notifications: [
            {
              id: '5',
              type: 'BOARD_COMMENT',
              title: 'Board 댓글 알림',
              content: '손염소 님의 "다음 GCS Week 현장견학 장소 추천 받습니다"  게시물에 댓글이 달렸습니다.',
              timestamp: '8분 전',
              isRead: false,
              createdAt: new Date()
            },
            {
              id: '6',
              type: 'BOARD_COMMENT',
              title: 'Board 댓글 알림',
              content: '손염소 님의 "다음 GCS Week 현장견학 장소 추천 받습니다"  게시물에 댓글이 달렸습니다.',
              timestamp: '8분 전',
              isRead: false,
              createdAt: new Date()
            }
          ]
        },
        {
          period: 'last30days',
          label: '최근 30일',
          notifications: [
            {
              id: '7',
              type: 'BOARD_COMMENT',
              title: 'Board 댓글 알림',
              content: '손염소 님의 "다음 GCS Week 현장견학 장소 추천 받습니다"  게시물에 댓글이 달렸습니다.',
              timestamp: '8분 전',
              isRead: false,
              createdAt: new Date()
            },
            {
              id: '8',
              type: 'BOARD_COMMENT',
              title: 'Board 댓글 알림',
              content: '손염소 님의 "다음 GCS Week 현장견학 장소 추천 받습니다"  게시물에 댓글이 달렸습니다.',
              timestamp: '8분 전',
              isRead: false,
              createdAt: new Date()
            }
          ]
        }
      ]
      
      setNotifications(mockNotifications)
    } catch (error) {
      console.error('알림 조회 오류:', error)
    } finally {
      setIsLoadingNotifications(false)
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
            알림
          </p>
          <div className="h-[24px] opacity-0 w-[12px]" aria-hidden="true"></div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col gap-[44px] pb-[20px] pt-[40px] px-[20px]">
        {isLoadingNotifications ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-gray-600">알림을 불러오는 중...</p>
            </div>
          </div>
        ) : (
          <>
            {notifications.map((group) => (
              <div key={group.period} className="flex flex-col gap-[8px]">
                {/* 기간 제목 */}
                <div className="flex items-start">
                  <p className="font-bold leading-[1.5] text-[19px] text-[#1a1918]">
                    {group.label}
                  </p>
                </div>

                {/* 알림 목록 */}
                <div className="flex flex-col gap-[20px]">
                  {group.notifications.map((notification, index) => (
                    <div key={notification.id} className="flex flex-col gap-[12px]">
                      <div className="flex flex-col gap-[8px] items-center justify-center pl-0 pr-[20px] py-0">
                        <div className="flex flex-col gap-[4px] items-start w-full">
                          {/* 알림 제목과 읽지 않음 표시 */}
                          <div className="flex gap-[4px] items-start w-full">
                            <div className="flex items-start">
                              <p className="font-bold leading-[1.5] text-[15px] text-[#443e3c]">
                                {notification.title}
                              </p>
                            </div>
                            {!notification.isRead && (
                              <div className="h-[10px] w-[8px] flex-shrink-0">
                                <img 
                                  alt="읽지 않음" 
                                  className="block max-w-none size-full" 
                                  src={imgNotificationDot} 
                                />
                              </div>
                            )}
                          </div>

                          {/* 알림 내용 */}
                          <div className="w-full">
                            <p className="font-bold leading-[1.5] text-[13px] text-[#85817e] tracking-[-0.26px] w-full whitespace-pre-wrap">
                              {notification.content}
                            </p>
                          </div>
                        </div>

                        {/* 타임스탬프 */}
                        <p className="font-normal leading-[1.5] text-[13px] text-[#b7b3af] tracking-[-0.26px] w-full whitespace-pre-wrap">
                          {notification.timestamp}
                        </p>
                      </div>

                      {/* 구분선 */}
                      {index < group.notifications.length - 1 && (
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

function NotificationsPageSuspenseFallback() {
  return (
    <div className="fixed inset-0 bg-[#f8f6f4] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
        <p className="text-gray-600">로딩 중...</p>
      </div>
    </div>
  )
}

