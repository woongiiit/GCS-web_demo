'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePermissions } from '@/contexts/AuthContext'
import { permissions } from '@/lib/permissions'
import Link from 'next/link'

interface VerificationRequest {
  id: string
  email: string
  name: string
  studentId: string
  major: string
  role: string
  verificationStatus: string
  verificationImageUrl: string | null
  verificationRequestedAt: string | null
  verificationApprovedAt: string | null
  verificationRejectedAt: string | null
  verificationNote: string | null
  createdAt: string
}

export default function VerificationsPage() {
  const router = useRouter()
  const { role, isAdmin } = usePermissions()
  const [verifications, setVerifications] = useState<VerificationRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'REQUESTED' | 'APPROVED' | 'REJECTED'>('REQUESTED')
  const [selectedUser, setSelectedUser] = useState<VerificationRequest | null>(null)
  const [actionNote, setActionNote] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  // 관리자가 아닌 경우 접근 차단
  useEffect(() => {
    if (!isAdmin) {
      router.push('/')
    }
  }, [isAdmin, router])

  // 인증 목록 불러오기
  useEffect(() => {
    if (isAdmin) {
      fetchVerifications()
    }
  }, [filter, isAdmin])

  const fetchVerifications = async () => {
    setIsLoading(true)
    try {
      const url = filter === 'all' 
        ? '/api/verification/list' 
        : `/api/verification/list?status=${filter}`
      
      const response = await fetch(url, {
        credentials: 'include'
      })

      const data = await response.json()

      if (response.ok) {
        setVerifications(data.data)
      } else {
        console.error('인증 목록 조회 오류:', data.error)
      }
    } catch (error) {
      console.error('인증 목록 조회 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAction = async (userId: string, action: 'approve' | 'reject') => {
    if (!userId) return

    setIsProcessing(true)
    setMessage('')

    try {
      const response = await fetch('/api/verification/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userId,
          action,
          note: actionNote || null
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(data.message)
        setMessageType('success')
        setSelectedUser(null)
        setActionNote('')
        
        // 목록 새로고침
        fetchVerifications()
      } else {
        setMessage(data.error || '처리 중 오류가 발생했습니다.')
        setMessageType('error')
      }
    } catch (error) {
      console.error('인증 처리 오류:', error)
      setMessage('서버 오류가 발생했습니다. 다시 시도해주세요.')
      setMessageType('error')
    } finally {
      setIsProcessing(false)
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
              <h1 className="text-4xl font-bold text-white mb-4">학생 인증 관리</h1>
              <p className="text-white text-sm mb-8">학생 인증 요청을 검토하고 승인/거부하세요.</p>
              
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

        {/* 필터 탭 */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-0">
            <div className="flex justify-between items-center py-4">
              <div className="flex space-x-4">
                <button
                  onClick={() => setFilter('REQUESTED')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === 'REQUESTED'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  승인 대기
                </button>
                <button
                  onClick={() => setFilter('APPROVED')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === 'APPROVED'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  승인됨
                </button>
                <button
                  onClick={() => setFilter('REJECTED')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === 'REJECTED'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  거부됨
                </button>
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-gray-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  전체
                </button>
              </div>

              <Link
                href="/admin"
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                관리자 홈
              </Link>
            </div>
          </div>
        </div>

        {/* 메인 컨텐츠 영역 */}
        <div className="bg-white min-h-screen">
          <div className="max-w-6xl mx-auto px-4 py-6 sm:px-0">
            {/* 메시지 */}
            {message && (
              <div className={`mb-6 p-4 rounded-lg ${
                messageType === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {message}
              </div>
            )}

            {/* 로딩 중 */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
                <p className="text-gray-600">로딩 중...</p>
              </div>
            ) : verifications.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {filter === 'REQUESTED' && '승인 대기 중인 요청이 없습니다'}
                  {filter === 'APPROVED' && '승인된 요청이 없습니다'}
                  {filter === 'REJECTED' && '거부된 요청이 없습니다'}
                  {filter === 'all' && '인증 요청이 없습니다'}
                </h3>
              </div>
            ) : (
              <div className="space-y-4">
                {verifications.map((verification) => (
                  <div
                    key={verification.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* 사용자 정보 */}
                      <div className="flex-1">
                        <div className="mb-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-black">{verification.name}</h3>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              verification.verificationStatus === 'REQUESTED' ? 'bg-blue-100 text-blue-700' :
                              verification.verificationStatus === 'APPROVED' ? 'bg-green-100 text-green-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {verification.verificationStatus === 'REQUESTED' && '승인 대기'}
                              {verification.verificationStatus === 'APPROVED' && '승인됨'}
                              {verification.verificationStatus === 'REJECTED' && '거부됨'}
                            </span>
                          </div>
                          
                          <div className="space-y-1 text-sm text-gray-600">
                            <p><span className="font-medium">이메일:</span> {verification.email}</p>
                            <p><span className="font-medium">학번:</span> {verification.studentId}</p>
                            <p><span className="font-medium">전공:</span> {verification.major}</p>
                            <p><span className="font-medium">요청 일시:</span> {verification.verificationRequestedAt ? new Date(verification.verificationRequestedAt).toLocaleString('ko-KR') : '-'}</p>
                            
                            {verification.verificationApprovedAt && (
                              <p className="text-green-600">
                                <span className="font-medium">승인 일시:</span> {new Date(verification.verificationApprovedAt).toLocaleString('ko-KR')}
                              </p>
                            )}
                            
                            {verification.verificationRejectedAt && (
                              <p className="text-red-600">
                                <span className="font-medium">거부 일시:</span> {new Date(verification.verificationRejectedAt).toLocaleString('ko-KR')}
                              </p>
                            )}
                            
                            {verification.verificationNote && (
                              <p className="text-gray-700">
                                <span className="font-medium">메모:</span> {verification.verificationNote}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* 인증 이미지 */}
                        {verification.verificationImageUrl && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">제출한 인증 이미지</p>
                            <img
                              src={verification.verificationImageUrl}
                              alt="인증 이미지"
                              className="w-full max-w-md h-auto border border-gray-200 rounded-lg cursor-pointer hover:opacity-90"
                              onClick={() => window.open(verification.verificationImageUrl!, '_blank')}
                            />
                            <p className="text-xs text-gray-500 mt-1">클릭하여 크게 보기</p>
                          </div>
                        )}
                      </div>

                      {/* 액션 버튼 (REQUESTED 상태만) */}
                      {verification.verificationStatus === 'REQUESTED' && (
                        <div className="w-full md:w-64 space-y-3">
                          <button
                            onClick={() => {
                              setSelectedUser(verification)
                              setActionNote('')
                            }}
                            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                          >
                            승인하기
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(verification)
                              setActionNote('')
                            }}
                            className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                          >
                            거부하기
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 액션 확인 모달 */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
              <h3 className="text-xl font-bold text-black mb-4">
                학생 인증 처리
              </h3>
              
              <div className="mb-4">
                <p className="text-gray-700">
                  <span className="font-medium">{selectedUser.name}</span>님의 학생 인증을 처리하시겠습니까?
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  메모 (선택)
                </label>
                <textarea
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black resize-none"
                  placeholder="승인/거부 사유를 입력하세요 (선택사항)"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setSelectedUser(null)
                    setActionNote('')
                  }}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  취소
                </button>
                <button
                  onClick={() => handleAction(selectedUser.id, 'approve')}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400"
                >
                  {isProcessing ? '처리 중...' : '승인'}
                </button>
                <button
                  onClick={() => handleAction(selectedUser.id, 'reject')}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:bg-gray-400"
                >
                  {isProcessing ? '처리 중...' : '거부'}
                </button>
              </div>
            </div>
          </div>
        )}

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

