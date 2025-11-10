'use client'

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface UserInfo {
  id: string
  email: string
  name: string
  studentId: string
  major: string
  phone: string
  role: string
}

interface CartOptionSummary {
  name: string
  label: string
  priceAdjustment: number
}

interface CartProductInfo {
  id: string
  name: string
  price: number
  images: string[]
  brand?: string | null
  isActive: boolean
}

interface CartItem {
  id: string
  productId: string
  quantity: number
  unitPrice: number
  selectedOptions?: CartOptionSummary[] | null
  product: CartProductInfo
}

function MyPageContent() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<'profile' | 'cart' | 'archive' | 'verification'>('profile')
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    major: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isCartLoading, setIsCartLoading] = useState(false)
  const [cartError, setCartError] = useState('')
  const [cartMessage, setCartMessage] = useState('')
  const [cartMessageType, setCartMessageType] = useState<'success' | 'error'>('success')
  const [selectedCartIds, setSelectedCartIds] = useState<string[]>([])
  const [isDeletingCartItems, setIsDeletingCartItems] = useState(false)
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [isOrdering, setIsOrdering] = useState(false)
  const [orderMessage, setOrderMessage] = useState('')
  const [orderMessageType, setOrderMessageType] = useState<'success' | 'error'>('success')
  const [shippingAddress, setShippingAddress] = useState('')
  const [shippingPhone, setShippingPhone] = useState('')
  const [orderNotes, setOrderNotes] = useState('')

  const isValidTab = (value: string | null): value is 'profile' | 'cart' | 'archive' | 'verification' => {
    return value === 'profile' || value === 'cart' || value === 'archive' || value === 'verification'
  }

  const formatCurrency = (price: number) => `${price.toLocaleString()}원`

  const handleTabChange = useCallback((tab: 'profile' | 'cart' | 'archive' | 'verification') => {
    setActiveTab(tab)
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '')
    params.set('tab', tab)
    const queryString = params.toString()
    router.replace(queryString ? `/mypage?${queryString}` : '/mypage', { scroll: false })
  }, [router, searchParams])

  const fetchCartItems = useCallback(async () => {
    setIsCartLoading(true)
    setCartError('')
    setCartMessage('')
    try {
      const response = await fetch('/api/shop/cart', {
        method: 'GET',
        credentials: 'include'
      })
      const data = await response.json()
      if (response.ok && data.success) {
        const items = Array.isArray(data.data) ? (data.data as CartItem[]) : []
        setCartItems(items)
        setSelectedCartIds((prev) => prev.filter((id) => items.some((item) => item.id === id)))
      } else {
        setCartError(data.error || '장바구니를 불러오지 못했습니다.')
      }
    } catch (error) {
      console.error('장바구니 조회 오류:', error)
      setCartError('장바구니를 불러오지 못했습니다.')
    } finally {
      setIsCartLoading(false)
    }
  }, [])

  const handleCartItemToggle = useCallback((cartItemId: string) => {
    setSelectedCartIds((prev) => {
      if (prev.includes(cartItemId)) {
        return prev.filter((id) => id !== cartItemId)
      }
      return [...prev, cartItemId]
    })
  }, [])

  const allCartItemsSelected = useMemo(() => {
    return cartItems.length > 0 && selectedCartIds.length === cartItems.length
  }, [cartItems, selectedCartIds])

  const toggleSelectAllCartItems = useCallback(() => {
    if (allCartItemsSelected) {
      setSelectedCartIds([])
      return
    }

    setSelectedCartIds(cartItems.map((item) => item.id))
  }, [allCartItemsSelected, cartItems])

  const selectedCartItems = useMemo(() => {
    return cartItems.filter((item) => selectedCartIds.includes(item.id))
  }, [cartItems, selectedCartIds])

  const selectedCartTotalAmount = useMemo(() => {
    return selectedCartItems.reduce((sum, item) => {
      return sum + item.unitPrice * item.quantity
    }, 0)
  }, [selectedCartItems])

  const hasInactiveSelectedItems = useMemo(() => {
    return selectedCartItems.some((item) => !item.product?.isActive)
  }, [selectedCartItems])

  const handleDeleteSelectedCartItems = useCallback(async () => {
    if (selectedCartIds.length === 0) return
    const confirmed = window.confirm('선택한 상품을 삭제하시겠습니까?')
    if (!confirmed) return

    setIsDeletingCartItems(true)
    setCartMessage('')
    try {
      const response = await fetch('/api/shop/cart', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ cartItemIds: selectedCartIds })
      })
      const data = await response.json()
      if (response.ok && data.success) {
        setCartMessageType('success')
        setCartMessage(data.message || '선택한 상품을 삭제했습니다.')
        setSelectedCartIds([])
        await fetchCartItems()
      } else {
        setCartMessageType('error')
        setCartMessage(data.error || '선택한 상품을 삭제하지 못했습니다.')
      }
    } catch (error) {
      console.error('장바구니 삭제 오류:', error)
      setCartMessageType('error')
      setCartMessage('선택한 상품을 삭제하지 못했습니다.')
    } finally {
      setIsDeletingCartItems(false)
    }
  }, [fetchCartItems, selectedCartIds])

  const handleOrderSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (selectedCartIds.length === 0) {
      setOrderMessageType('error')
      setOrderMessage('주문할 상품을 선택해주세요.')
      return
    }

    if (hasInactiveSelectedItems) {
      setOrderMessageType('error')
      setOrderMessage('판매 중단된 상품은 주문할 수 없습니다. 삭제 후 다시 시도해주세요.')
      return
    }

    if (!shippingAddress.trim() || !shippingPhone.trim()) {
      setOrderMessageType('error')
      setOrderMessage('배송지와 연락처를 모두 입력해주세요.')
      return
    }

    setIsOrdering(true)
    setOrderMessage('')
    try {
      const response = await fetch('/api/shop/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          cartItemIds: selectedCartIds,
          shippingAddress: shippingAddress.trim(),
          phone: shippingPhone.trim(),
          notes: orderNotes.trim() || undefined
        })
      })
      const data = await response.json()
      if (response.ok && data.success) {
        setOrderMessageType('success')
        setOrderMessage('주문이 완료되었습니다.')
        setSelectedCartIds([])
        setShowOrderForm(false)
        setOrderNotes('')
        await fetchCartItems()
      } else {
        setOrderMessageType('error')
        setOrderMessage(data.error || '주문 처리 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('주문 처리 오류:', error)
      setOrderMessageType('error')
      setOrderMessage('주문 처리 중 오류가 발생했습니다.')
    } finally {
      setIsOrdering(false)
    }
  }, [fetchCartItems, hasInactiveSelectedItems, orderNotes, selectedCartIds, shippingAddress, shippingPhone])

  // 학생 인증 관련 상태
  const [verificationImage, setVerificationImage] = useState<File | null>(null)
  const [verificationImagePreview, setVerificationImagePreview] = useState<string>('')
  const [isVerificationSubmitting, setIsVerificationSubmitting] = useState(false)

  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const tabParam = searchParams ? searchParams.get('tab') : null
    if (isValidTab(tabParam) && tabParam !== activeTab) {
      setActiveTab(tabParam)
    }
  }, [searchParams, activeTab])

  // 사용자 정보 로드
  useEffect(() => {
    if (user) {
      setUserInfo({
        id: user.id,
        email: user.email,
        name: user.name,
        studentId: user.studentId,
        major: user.major,
        phone: user.phone,
        role: user.role
      })
      setFormData({
        name: user.name || '',
        studentId: user.studentId || '',
        major: user.major || '',
        phone: user.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    }
  }, [user])

  useEffect(() => {
    if (user?.phone) {
      setShippingPhone(user.phone)
    }
  }, [user?.phone])

  useEffect(() => {
    if (activeTab === 'cart') {
      fetchCartItems()
    }
  }, [activeTab, fetchCartItems])

  useEffect(() => {
    if (selectedCartIds.length === 0) {
      setShowOrderForm(false)
      setOrderMessage('')
    }
  }, [selectedCartIds])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      // 비밀번호 변경 요청
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('비밀번호가 성공적으로 변경되었습니다.')
        setMessageType('success')
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        setMessage(data.error || '비밀번호 변경 중 오류가 발생했습니다.')
        setMessageType('error')
      }
    } catch (error) {
      console.error('비밀번호 변경 오류:', error)
      setMessage('서버 오류가 발생했습니다. 다시 시도해주세요.')
      setMessageType('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 학생 인증 이미지 업로드 핸들러
  const handleVerificationImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setVerificationImage(file)
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setVerificationImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // 학생 인증 요청 제출
  const handleVerificationSubmit = async () => {
    if (!verificationImage) {
      setMessage('학생증 또는 재학증명서 이미지를 업로드해주세요.')
      setMessageType('error')
      return
    }

    setIsVerificationSubmitting(true)
    setMessage('')

    try {
      // TODO: 실제로는 이미지를 서버에 업로드하고 URL을 받아와야 함
      // 여기서는 임시로 base64를 사용
      const imageUrl = verificationImagePreview

      const response = await fetch('/api/verification/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ imageUrl })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('학생 인증 요청이 제출되었습니다. 운영자 승인을 기다려주세요.')
        setMessageType('success')
        setVerificationImage(null)
        setVerificationImagePreview('')
        
        // 사용자 정보 새로고침
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setMessage(data.error || '학생 인증 요청 중 오류가 발생했습니다.')
        setMessageType('error')
      }
    } catch (error) {
      console.error('학생 인증 요청 오류:', error)
      setMessage('서버 오류가 발생했습니다. 다시 시도해주세요.')
      setMessageType('error')
    } finally {
      setIsVerificationSubmitting(false)
    }
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

  if (!user) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-white overflow-auto" style={{ overflowY: 'scroll' }}>
      <div className="relative min-h-screen bg-white">
        {/* 상단 검은색 영역 */}
        <div className="bg-black pt-32 pb-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-0">
            {/* 페이지 제목 */}
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">마이페이지</h1>
              <p className="text-white text-sm mb-8">개인정보 및 장바구니를 관리하세요.</p>
              
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

        {/* 탭 메뉴 - 흰색 배경 영역 */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-0">
            <div className="flex justify-center space-x-8 py-4">
              <button
                onClick={() => handleTabChange('profile')}
                className={`pb-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'profile'
                    ? 'text-black border-black'
                    : 'text-gray-400 border-transparent hover:text-black hover:border-gray-300'
                }`}
              >
                개인정보수정
              </button>
              <button
                onClick={() => handleTabChange('cart')}
                className={`pb-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'cart'
                    ? 'text-black border-black'
                    : 'text-gray-400 border-transparent hover:text-black hover:border-gray-300'
                }`}
              >
                장바구니
              </button>
              <button
                onClick={() => handleTabChange('archive')}
                className={`pb-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'archive'
                    ? 'text-black border-black'
                    : 'text-gray-400 border-transparent hover:text-black hover:border-gray-300'
                }`}
              >
                내 아카이브
              </button>
              
              {/* 학생 인증 탭 (일반회원만 보임) */}
              {user.role === 'GENERAL' && (
                <button
                  onClick={() => handleTabChange('verification')}
                  className={`pb-2 border-b-2 font-medium transition-colors ${
                    activeTab === 'verification'
                      ? 'text-black border-black'
                      : 'text-gray-400 border-transparent hover:text-black hover:border-gray-300'
                  }`}
                >
                  학생 인증
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 메인 컨텐츠 영역 */}
        <div className="bg-white min-h-screen">
          <div className="max-w-6xl mx-auto px-4 py-6 sm:px-0">
            <div className="bg-white px-4 py-8">
              {activeTab === 'profile' ? (
                <div>
                  {/* 사용자 정보 */}
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-black mb-6">개인정보</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                        <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">
                          {user.name}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">학번</label>
                        <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">
                          {user.studentId}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">주전공</label>
                        <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">
                          {user.major}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
                        <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">
                          {user.phone}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                        <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">
                          {user.email}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">역할</label>
                        <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">
                          {(user.role === 'ADMIN'
                            ? '관리자'
                            : user.role === 'MAJOR'
                              ? '전공 회원'
                              : user.verificationStatus === 'REQUESTED'
                                ? '일반 회원 (인증 대기 중)'
                                : '일반 회원') + (user.isSeller ? ' / 판매자 권한' : '')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 비밀번호 변경 */}
                  <div>
                    <h2 className="text-2xl font-bold text-black mb-6">비밀번호 변경</h2>
                    
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
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                          현재 비밀번호
                        </label>
                        <input
                          id="currentPassword"
                          name="currentPassword"
                          type="password"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                          value={formData.currentPassword}
                          onChange={handleChange}
                        />
                      </div>

                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                          새 비밀번호
                        </label>
                        <input
                          id="newPassword"
                          name="newPassword"
                          type="password"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                          value={formData.newPassword}
                          onChange={handleChange}
                        />
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                          새 비밀번호 확인
                        </label>
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-4 px-6 rounded-lg font-medium text-white transition-colors ${
                          isSubmitting
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2'
                        }`}
                      >
                        {isSubmitting ? '변경 중...' : '비밀번호 변경'}
                      </button>
                    </form>
                  </div>
                </div>
              ) : activeTab === 'cart' ? (
                <div>
                  {/* 장바구니 탭 */}
                  <h2 className="text-2xl font-bold text-black mb-6">장바구니</h2>
                  {cartMessage && (
                    <div
                      className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
                        cartMessageType === 'success'
                          ? 'border-green-200 bg-green-50 text-green-700'
                          : 'border-red-200 bg-red-50 text-red-700'
                      }`}
                    >
                      {cartMessage}
                    </div>
                  )}

                  {cartError && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {cartError}
                    </div>
                  )}

                  {isCartLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-black"></div>
                        <p className="text-gray-600">장바구니를 불러오는 중...</p>
                      </div>
                    </div>
                  ) : cartItems.length === 0 ? (
                    <div className="py-12 text-center">
                      <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
                        <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                        </svg>
                      </div>
                      <h3 className="mb-2 text-lg font-medium text-gray-900">장바구니가 비어있습니다</h3>
                      <p className="mb-6 text-gray-500">원하는 상품을 장바구니에 담아보세요.</p>
                      <Link
                        href="/shop"
                        className="inline-block rounded-lg bg-black px-6 py-3 text-white transition-colors hover:bg-gray-800"
                      >
                        쇼핑하러 가기
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                            checked={allCartItemsSelected}
                            onChange={toggleSelectAllCartItems}
                          />
                          전체 선택
                        </label>
                        <span className="text-sm text-gray-500">총 {cartItems.length}개 상품</span>
                      </div>

                      <div className="space-y-4">
                        {cartItems.map((item) => {
                          const optionList = Array.isArray(item.selectedOptions) ? item.selectedOptions : []
                          const thumbnail =
                            item.product?.images && item.product.images[0] ? item.product.images[0] : ''
                          const isInactive = !item.product?.isActive

                          return (
                            <div
                              key={item.id}
                              className={`flex items-start gap-4 rounded-lg border p-4 transition-colors ${
                                isInactive
                                  ? 'border-red-200 bg-red-50/60'
                                  : 'border-gray-200 hover:border-black/40'
                              }`}
                            >
                              <input
                                type="checkbox"
                                className="mt-1 h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                                checked={selectedCartIds.includes(item.id)}
                                onChange={() => handleCartItemToggle(item.id)}
                              />
                              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                {thumbnail ? (
                                  <img
                                    src={thumbnail}
                                    alt={item.product?.name ?? '상품 이미지'}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.src = '/images/placeholder-product.jpg'
                                    }}
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                                    No Image
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="truncate text-base font-semibold text-gray-900">
                                  {item.product?.name}
                                </h3>
                                {item.product?.brand && (
                                  <p className="mt-1 text-sm text-gray-500">{item.product.brand}</p>
                                )}
                                {optionList.length > 0 && (
                                  <ul className="mt-3 space-y-1 text-sm text-gray-600">
                                    {optionList.map((option) => (
                                      <li key={`${item.id}-${option.name}-${option.label}`}>
                                        {option.name}:{' '}
                                        <span className="font-medium text-black">{option.label}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                                <p className="mt-3 text-sm text-gray-500">수량 {item.quantity}개</p>
                                {isInactive && (
                                  <p className="mt-2 text-sm font-medium text-red-500">
                                    판매 중단된 상품입니다. 주문할 수 없습니다.
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500">최종 결제 금액</p>
                                <p className="text-base font-semibold text-black">
                                  {formatCurrency(item.unitPrice * item.quantity)}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      <div className="rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">선택한 상품 금액</span>
                          <span className="text-lg font-bold text-black">
                            {formatCurrency(selectedCartTotalAmount)}
                          </span>
                        </div>
                        {hasInactiveSelectedItems && (
                          <p className="mt-2 text-sm text-red-500">
                            판매 중단된 상품이 포함되어 있어 주문이 불가능합니다. 해당 상품을 삭제해주세요.
                          </p>
                        )}
                        <div className="mt-4 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={handleDeleteSelectedCartItems}
                            disabled={selectedCartIds.length === 0 || isDeletingCartItems}
                            className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors md:flex-none md:px-6 ${
                              selectedCartIds.length === 0 || isDeletingCartItems
                                ? 'cursor-not-allowed border-gray-200 text-gray-400'
                                : 'border-black text-black hover:bg-gray-50'
                            }`}
                          >
                            {isDeletingCartItems ? '삭제 중...' : '선택 삭제'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (selectedCartIds.length === 0) return
                              setShowOrderForm((prev) => !prev)
                              setOrderMessage('')
                            }}
                            disabled={selectedCartIds.length === 0 || hasInactiveSelectedItems}
                            className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-colors md:flex-none md:px-6 ${
                              selectedCartIds.length === 0 || hasInactiveSelectedItems
                                ? 'cursor-not-allowed bg-gray-300 text-gray-500'
                                : 'bg-black text-white hover:bg-gray-800'
                            }`}
                          >
                            {showOrderForm ? '주문 폼 닫기' : '주문하기'}
                          </button>
                        </div>

                        {showOrderForm && (
                          <form onSubmit={handleOrderSubmit} className="mt-6 space-y-4">
                            {orderMessage && (
                              <div
                                className={`rounded-lg border px-4 py-3 text-sm ${
                                  orderMessageType === 'success'
                                    ? 'border-green-200 bg-green-50 text-green-700'
                                    : 'border-red-200 bg-red-50 text-red-700'
                                }`}
                              >
                                {orderMessage}
                              </div>
                            )}
                            <div>
                              <label className="mb-2 block text-sm font-medium text-gray-700">
                                배송지 주소 *
                              </label>
                              <input
                                type="text"
                                value={shippingAddress}
                                onChange={(e) => setShippingAddress(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black"
                                placeholder="배송지를 입력해주세요."
                              />
                            </div>
                            <div>
                              <label className="mb-2 block text-sm font-medium text-gray-700">
                                연락처 *
                              </label>
                              <input
                                type="text"
                                value={shippingPhone}
                                onChange={(e) => setShippingPhone(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black"
                                placeholder="연락 가능한 전화번호를 입력해주세요."
                              />
                            </div>
                            <div>
                              <label className="mb-2 block text-sm font-medium text-gray-700">
                                요청사항 (선택)
                              </label>
                              <textarea
                                value={orderNotes}
                                onChange={(e) => setOrderNotes(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black"
                                rows={3}
                                placeholder="배송 관련 요청사항이 있다면 입력해주세요."
                              />
                            </div>
                            <div className="flex justify-end gap-3">
                              <button
                                type="button"
                                onClick={() => {
                                  setShowOrderForm(false)
                                  setOrderMessage('')
                                }}
                                className="rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50"
                              >
                                취소
                              </button>
                              <button
                                type="submit"
                                disabled={isOrdering}
                                className={`rounded-lg px-6 py-3 text-sm font-medium text-white ${
                                  isOrdering
                                    ? 'cursor-not-allowed bg-gray-500'
                                    : 'bg-black hover:bg-gray-800'
                                }`}
                              >
                                {isOrdering ? '주문 중...' : '주문 확정'}
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : activeTab === 'archive' ? (
                <MyArchiveTab user={user} />
              ) : (
                <div>
                  {/* 학생 인증 탭 */}
                  <h2 className="text-2xl font-bold text-black mb-6">학생 인증</h2>
                  
                  {/* 인증 상태 표시 */}
                  <div className="mb-8">
                    <div className={`p-4 rounded-lg border ${
                      user.verificationStatus === 'PENDING' ? 'bg-gray-50 border-gray-200' :
                      user.verificationStatus === 'REQUESTED' ? 'bg-blue-50 border-blue-200' :
                      user.verificationStatus === 'APPROVED' ? 'bg-green-50 border-green-200' :
                      'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold">현재 인증 상태:</span>
                        <span className={`font-bold ${
                          user.verificationStatus === 'PENDING' ? 'text-gray-600' :
                          user.verificationStatus === 'REQUESTED' ? 'text-blue-600' :
                          user.verificationStatus === 'APPROVED' ? 'text-green-600' :
                          'text-red-600'
                        }`}>
                          {user.verificationStatus === 'PENDING' && '인증 대기'}
                          {user.verificationStatus === 'REQUESTED' && '인증 요청됨 (승인 대기 중)'}
                          {user.verificationStatus === 'APPROVED' && '승인 완료'}
                          {user.verificationStatus === 'REJECTED' && '인증 거부됨'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600">
                        {user.verificationStatus === 'PENDING' && 
                          '학생증 또는 재학증명서를 업로드하여 학생 인증을 요청하세요. 승인되면 게시글 작성 권한이 부여됩니다.'}
                        {user.verificationStatus === 'REQUESTED' && 
                          '운영자가 인증을 검토 중입니다. 잠시만 기다려주세요.'}
                        {user.verificationStatus === 'APPROVED' && 
                          '학생 인증이 완료되었습니다. 이제 게시글을 작성할 수 있습니다.'}
                        {user.verificationStatus === 'REJECTED' && 
                          `인증이 거부되었습니다. ${user.verificationNote ? `사유: ${user.verificationNote}` : '운영자에게 문의해주세요.'}`}
                      </p>
                    </div>
                  </div>

                  {/* 인증 요청 폼 (PENDING 또는 REJECTED 상태일 때만) */}
                  {(user.verificationStatus === 'PENDING' || user.verificationStatus === 'REJECTED') && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-black mb-4">
                        학생 인증 요청
                      </h3>
                      
                      <div className="mb-6">
                        <p className="text-sm text-gray-600 mb-4">
                          학생증 또는 재학증명서 이미지를 업로드해주세요. 운영자가 확인 후 승인합니다.
                        </p>
                        
                        <div className="space-y-4">
                          {/* 이미지 업로드 */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              인증 이미지 *
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleVerificationImageUpload}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              학생증 또는 재학증명서 사진을 업로드하세요. (JPG, PNG, 최대 5MB)
                            </p>
                          </div>

                          {/* 이미지 미리보기 */}
                          {verificationImagePreview && (
                            <div className="mt-4">
                              <p className="text-sm font-medium text-gray-700 mb-2">미리보기</p>
                              <div className="relative w-full max-w-md mx-auto">
                                <img
                                  src={verificationImagePreview}
                                  alt="인증 이미지 미리보기"
                                  className="w-full h-auto border border-gray-200 rounded-lg"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setVerificationImage(null)
                                    setVerificationImagePreview('')
                                  }}
                                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          )}

                          {/* 제출 버튼 */}
                          <button
                            onClick={handleVerificationSubmit}
                            disabled={!verificationImage || isVerificationSubmitting}
                            className={`w-full py-4 px-6 rounded-lg font-medium text-white transition-colors ${
                              !verificationImage || isVerificationSubmitting
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2'
                            }`}
                          >
                            {isVerificationSubmitting ? '제출 중...' : '인증 요청하기'}
                          </button>
                        </div>
                      </div>

                      {/* 안내 사항 */}
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-800 mb-2">📌 안내사항</h4>
                        <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                          <li>학생증 또는 재학증명서가 명확히 보이도록 촬영해주세요.</li>
                          <li>개인정보(주민번호 등)는 가려서 업로드해주세요.</li>
                          <li>인증 요청 후 1~3일 이내에 승인 여부가 결정됩니다.</li>
                          <li>승인되면 Archive와 Community에서 글 작성이 가능합니다.</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* 인증 요청 완료 (REQUESTED 상태) */}
                  {user.verificationStatus === 'REQUESTED' && (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">인증 요청이 제출되었습니다</h3>
                      <p className="text-gray-500 mb-6">운영자가 검토 중입니다. 승인될 때까지 기다려주세요.</p>
                      
                      {user.verificationImageUrl && (
                        <div className="max-w-md mx-auto">
                          <p className="text-sm font-medium text-gray-700 mb-2">제출한 인증 이미지</p>
                          <img
                            src={user.verificationImageUrl}
                            alt="제출한 인증 이미지"
                            className="w-full h-auto border border-gray-200 rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
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

// 내 아카이브 탭 컴포넌트
function MyArchiveTab({ user }: { user: any }) {
  const [myProjects, setMyProjects] = useState<any[]>([])
  const [myProducts, setMyProducts] = useState<any[]>([])
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)

  useEffect(() => {
    fetchMyProjects()
    fetchMyProducts()
  }, [])

  const fetchMyProjects = async () => {
    try {
      setIsLoadingProjects(true)
      const response = await fetch('/api/mypage/projects')
      const data = await response.json()
      
      if (data.success) {
        setMyProjects(data.data)
      }
    } catch (error) {
      console.error('내 프로젝트 조회 오류:', error)
    } finally {
      setIsLoadingProjects(false)
    }
  }

  const fetchMyProducts = async () => {
    try {
      setIsLoadingProducts(true)
      const response = await fetch('/api/mypage/products')
      const data = await response.json()
      
      if (data.success) {
        setMyProducts(data.data)
      }
    } catch (error) {
      console.error('내 상품 조회 오류:', error)
    } finally {
      setIsLoadingProducts(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-black mb-6">내 아카이브</h2>
      
      {/* 좌우 분할 레이아웃 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 좌측: 내 프로젝트 */}
        <div className="border-r-0 md:border-r-2 border-gray-200 pr-0 md:pr-6">
          <h3 className="text-xl font-bold text-black mb-4">내 프로젝트</h3>
          
          {isLoadingProjects ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
          ) : myProjects.length > 0 ? (
            <div className="space-y-4">
              {myProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/archive/projects/${project.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    {project.images && project.images[0] && (
                      <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={project.images[0]}
                          alt={project.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.parentElement!.innerHTML = '<span class="flex items-center justify-center w-full h-full bg-[#f57520] text-white text-sm font-bold">GCS</span>'
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 mb-1 truncate">{project.title}</h4>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{project.description}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{project.year}년</span>
                        {project.teamMembers && project.teamMembers.length > 0 && (
                          <span>{project.teamMembers.length}명 참여</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>참여한 프로젝트가 없습니다.</p>
            </div>
          )}
        </div>

        {/* 우측: 내 상품 */}
        <div className="pl-0 md:pl-6">
          <h3 className="text-xl font-bold text-black mb-4">내 상품</h3>
          
          {isLoadingProducts ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
          ) : myProducts.length > 0 ? (
            <div className="space-y-4">
              {myProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/shop/${product.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    {product.images && product.images[0] && (
                      <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.parentElement!.innerHTML = '<span class="flex items-center justify-center w-full h-full bg-gray-300 text-gray-600 text-xs">No Image</span>'
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 mb-1 truncate">{product.name}</h4>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.shortDescription || product.description}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="font-semibold text-black">{product.price.toLocaleString()}원</span>
                        {product.category && (
                          <span>{product.category.name}</span>
                        )}
                        {!product.isActive && (
                          <span className="text-red-500">판매 중단</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>등록한 상품이 없습니다.</p>
              {user?.role === 'ADMIN' && (
                <Link
                  href="/shop/add"
                  className="inline-block mt-4 text-sm text-black underline hover:text-gray-600"
                >
                  상품 등록하러 가기
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MyPageSuspenseFallback() {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
        <p className="text-gray-600">로딩 중...</p>
      </div>
    </div>
  )
}

export default function MyPage() {
  return (
    <Suspense fallback={<MyPageSuspenseFallback />}>
      <MyPageContent />
    </Suspense>
  )
}
