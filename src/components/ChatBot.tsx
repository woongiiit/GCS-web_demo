'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface ChatBotOption {
  id: string
  title: string
  content: string
  category: string | null
}

interface Message {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ChatBotOption[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  // 옵션 목록 로드
  useEffect(() => {
    if (isOpen) {
      fetchOptions(currentCategory)
    }
  }, [isOpen, currentCategory])

  // 메시지 스크롤
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchOptions = async (category: string | null = null) => {
    try {
      setIsLoading(true)
      const url = category 
        ? `/api/chatbot/options?category=${encodeURIComponent(category)}`
        : '/api/chatbot/options'
      
      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setOptions(data.data)
        
        // 초기 환영 메시지 (메인 메뉴일 때만)
        if (!category && messages.length === 0) {
          const welcomeMessage: Message = {
            id: 'welcome',
            type: 'bot',
            content: '안녕하세요! 무엇을 도와드릴까요? 아래 옵션을 선택해주세요.',
            timestamp: new Date()
          }
          setMessages([welcomeMessage])
        }
      }
    } catch (error) {
      console.error('옵션 조회 오류:', error)
      const errorMessage: Message = {
        id: 'error-' + Date.now(),
        type: 'bot',
        content: '옵션을 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        timestamp: new Date()
      }
      setMessages([errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleOptionClick = async (option: ChatBotOption) => {
    // 사용자 메시지 추가
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: option.title,
      timestamp: new Date()
    }

    // 봇 응답 추가
    const botMessage: Message = {
      id: `bot-${Date.now()}`,
      type: 'bot',
      content: option.content,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage, botMessage])

    // 히스토리 저장
    try {
      await fetch('/api/chatbot/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          optionId: option.id,
          question: option.title,
          response: option.content,
          metadata: {
            category: option.category
          }
        })
      })
    } catch (error) {
      console.error('히스토리 저장 오류:', error)
    }

    // 다음 레벨 옵션이 있는지 확인 (해당 옵션 ID를 category로 가진 옵션들)
    // 약간의 딜레이 후 다음 레벨 옵션 로드
    setTimeout(async () => {
      try {
        const subOptionsResponse = await fetch(`/api/chatbot/options?category=${encodeURIComponent(option.id)}`)
        const subOptionsData = await subOptionsResponse.json()
        
        if (subOptionsData.success && subOptionsData.data.length > 0) {
          // 하위 옵션이 있으면 해당 카테고리로 이동
          setCurrentCategory(option.id)
          setOptions(subOptionsData.data)
        } else {
          // 하위 옵션이 없으면 메인 메뉴로 돌아가기 옵션 표시
          setCurrentCategory(null)
          fetchOptions(null)
        }
      } catch (error) {
        console.error('하위 옵션 조회 오류:', error)
      }
    }, 500)
  }

  const handleBackToMain = () => {
    setCurrentCategory(null)
    fetchOptions(null)
  }

  const handleClose = () => {
    setIsOpen(false)
    // 챗봇을 닫을 때 상태 초기화
    setTimeout(() => {
      setMessages([])
      setOptions([])
      setCurrentCategory(null)
    }, 300)
  }

  const handleToggle = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      // 챗봇을 열 때 상태 초기화
      setMessages([])
      setOptions([])
      setCurrentCategory(null)
    }
  }

  return (
    <>
      {/* 플로팅 버튼 */}
      <button
        onClick={handleToggle}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-black text-white rounded-full shadow-lg hover:bg-gray-800 transition-all duration-300 flex items-center justify-center ${
          isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        aria-label="챗봇 열기"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
          />
        </svg>
      </button>

      {/* 챗봇 창 */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col border border-gray-200">
          {/* 헤더 */}
          <div className="bg-black text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
            <h3 className="font-semibold text-lg">고객 서비스</h3>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-300 transition-colors"
              aria-label="챗봇 닫기"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* 메시지 영역 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {isLoading && messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.type === 'user'
                          ? 'bg-black text-white'
                          : 'bg-white text-gray-800 border border-gray-200'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          message.type === 'user'
                            ? 'text-gray-300'
                            : 'text-gray-500'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}

                {/* 옵션 버튼들 */}
                {messages.length > 0 && options.length > 0 && (
                  <div className="space-y-2 mt-4">
                    {currentCategory && (
                      <button
                        onClick={handleBackToMain}
                        className="w-full text-left bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-200 transition-all text-xs text-gray-600 flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        메인 메뉴로 돌아가기
                      </button>
                    )}
                    {options.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleOptionClick(option)}
                        className="w-full text-left bg-white border border-gray-300 rounded-lg px-4 py-3 hover:bg-gray-50 hover:border-black transition-all text-sm font-medium text-gray-800"
                      >
                        {option.title}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}
    </>
  )
}

