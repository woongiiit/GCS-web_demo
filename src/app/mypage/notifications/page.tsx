'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

// 이미지 상수 (Figma에서 추출한 이미지 URL)
const imgBack = "https://www.figma.com/api/mcp/asset/029a12d7-956c-482c-a1f8-3afe12efa084"
const imgFrame1707483447 = "https://www.figma.com/api/mcp/asset/256b5db9-f885-4119-916a-f7f33844a01c"
const imgLine297 = "https://www.figma.com/api/mcp/asset/485f9083-3ca7-44b4-87f3-be6ffde0d114"
const imgDownArrow = "https://www.figma.com/api/mcp/asset/14bcac70-3d75-4280-bb27-81baba4638dd"

interface Notification {
  id: string
  type: string
  title: string
  content: string
  timestamp: string
  isRead: boolean
}

interface NotificationGroup {
  period: 'today' | 'yesterday' | 'last7days' | 'last30days'
  label: string
  notifications: Notification[]
}

function NotificationsPageContent() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  const [notificationGroups, setNotificationGroups] = useState<NotificationGroup[]>([])

  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user])

  const fetchNotifications = async () => {
    try {
      // TODO: 실제 API 엔드포인트로 변경
      // const response = await fetch('/api/mypage/notifications')
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
              isRead: false
            },
            {
              id: '2',
              type: 'SELLER_REGISTERED',
              title: 'Board 댓글 알림',
              content: "'김염소' 계정을 판매자로 등록하였습니다.",
              timestamp: '25.11.17 13:17',
              isRead: true
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
              isRead: false
            },
            {
              id: '4',
              type: 'BOARD_COMMENT',
              title: 'Board 댓글 알림',
              content: '손염소 님의 "다음 GCS Week 현장견학 장소 추천 받습니다"  게시물에 댓글이 달렸습니다.',
              timestamp: '8분 전',
              isRead: false
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
              isRead: false
            },
            {
              id: '6',
              type: 'BOARD_COMMENT',
              title: 'Board 댓글 알림',
              content: '손염소 님의 "다음 GCS Week 현장견학 장소 추천 받습니다"  게시물에 댓글이 달렸습니다.',
              timestamp: '8분 전',
              isRead: false
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
              isRead: false
            },
            {
              id: '8',
              type: 'BOARD_COMMENT',
              title: 'Board 댓글 알림',
              content: '손염소 님의 "다음 GCS Week 현장견학 장소 추천 받습니다"  게시물에 댓글이 달렸습니다.',
              timestamp: '8분 전',
              isRead: false
            }
          ]
        }
      ]
      
      setNotificationGroups(mockNotifications)
    } catch (error) {
      console.error('알림 조회 오류:', error)
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

  if (!user) {
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
      <div className="flex-1 flex flex-col gap-[44px] items-start pb-[20px] pt-[40px] px-[20px] overflow-y-auto">
        {notificationGroups.map((group) => (
          <div key={group.period} className="flex flex-col gap-[8px] items-start w-full">
            {/* 기간 제목 */}
            <div className="flex items-start">
              <p className="font-bold leading-[1.5] text-[19px] text-[#1a1918]">
                {group.label}
              </p>
            </div>

            {/* 알림 목록 */}
            <div className="flex flex-col gap-[20px] items-start w-full">
              {group.notifications.map((notification, index) => (
                <div key={notification.id} className="flex flex-col gap-[12px] items-start w-full">
                  <div className="flex flex-col gap-[8px] items-center justify-center pl-0 pr-[20px] py-0 w-full">
                    <div className="flex flex-col gap-[4px] items-start w-full">
                      {/* 제목 */}
                      <div className="flex gap-[4px] items-start w-full">
                        <p className="font-bold leading-[1.5] text-[15px] text-[#443e3c]">
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <div className="h-[10px] relative shrink-0 w-[8px]">
                            <img alt="읽지 않음" className="block max-w-none size-full" src={imgFrame1707483447} />
                          </div>
                        )}
                      </div>
                      {/* 내용 */}
                      <div className={`relative w-full ${notification.content.length > 50 ? 'h-[40px]' : 'h-[20px]'}`}>
                        <p className={`absolute font-bold leading-[1.5] left-0 text-[13px] text-[#85817e] top-0 tracking-[-0.26px] w-full ${notification.content.length > 50 ? 'h-[40px]' : 'h-[20px]'} whitespace-pre-wrap`}>
                          {notification.content}
                        </p>
                      </div>
                    </div>
                    {/* 타임스탬프 */}
                    <p className={`font-normal leading-[1.5] ${notification.timestamp.includes('분 전') ? 'text-[13px]' : 'text-[10px]'} text-[#85817e] tracking-[-0.26px] w-full whitespace-pre-wrap`}>
                      {notification.timestamp}
                    </p>
                  </div>
                  {/* 구분선 */}
                  {index < group.notifications.length - 1 && (
                    <div className="h-0 relative w-full">
                      <div className="absolute bottom-0 left-0 right-0 top-[-2px]">
                        <img alt="" className="block max-w-none size-full" src={imgLine297} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* 더 많이 보기 버튼 */}
        <div className="flex items-start w-full">
          <div className="flex gap-[12px] items-center">
            <p className="font-bold leading-[1.5] text-[15px] text-[#85817e]">
              더 많이 보기
            </p>
            <div className="flex items-center justify-center relative shrink-0 size-[24px]">
              <div className="flex-none rotate-[270deg] scale-y-[-100%]">
                <div className="relative size-[24px]">
                  <div className="absolute contents left-[9px] top-[5px]">
                    <div className="absolute flex h-[14px] items-center justify-center left-[9px] top-[5px] w-[6px]">
                      <div className="flex-none rotate-[270deg]">
                        <div className="h-[6px] relative w-[14px]">
                          <img alt="아래 화살표" className="block max-w-none size-full" src={imgDownArrow} />
                        </div>
                      </div>
                    </div>
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

export default function NotificationsPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-[#f8f6f4] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <NotificationsPageContent />
    </Suspense>
  )
}

