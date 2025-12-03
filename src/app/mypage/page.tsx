'use client'

import { useState, useEffect, useCallback, useMemo, Suspense, type FormEvent } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { normalizeProductType, getProductTypeMeta } from '@/lib/shop/product-types'
import { AdminUserManagementTab, AdminOrdersTab } from '@/app/admin/admin-tabs'

function getProductTypeLabel(typeId?: string | null) {
  if (!typeId) return ''
  const normalizedType = normalizeProductType(typeId)
  if (!normalizedType) return ''
  return getProductTypeMeta(normalizedType)?.name ?? ''
}

// Partner up 주문 단계 라벨 변환 함수
function getPartnerUpStatusLabel(status: string): string {
  const statusLabels: Record<string, string> = {
    ORDERED: '상품 주문',
    CONFIRMED: '주문 확인',
    PRODUCTION_STARTED: '상품 준비중',
    SHIPPED_OUT: '출고',
    SHIPPING: '배송중',
    ARRIVED: '도착',
    RECEIVED: '수령'
  }
  return statusLabels[status] || status
}

// Fund 주문 단계 라벨 변환 함수
function getFundStatusLabel(status: string): string {
  const statusLabels: Record<string, string> = {
    ORDERED: '상품 주문',
    BILLING_COMPLETED: '빌링키 결제 완료',
    CONFIRMED: '주문 확인',
    PRODUCTION_STARTED: '상품 준비중',
    SHIPPED_OUT: '출고',
    SHIPPING: '배송중',
    ARRIVED: '도착',
    RECEIVED: '수령'
  }
  return statusLabels[status] || status
}

type TabKey =
  | 'profile'
  | 'orders'
  | 'cart'
  | 'archive'
  | 'allOrders'
  | 'sellerOrders'
  | 'userManagement'
  | 'contentManagement'

const TAB_LABELS: Record<TabKey, string> = {
  profile: '개인정보수정',
  orders: '내 주문내역',
  cart: '장바구니',
  archive: '내 아카이브',
  allOrders: '모든 주문내역',
  sellerOrders: '내 상품 판매내역',
  userManagement: '사용자 관리',
  contentManagement: '콘텐츠 관리'
}

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
  const [activeTab, setActiveTab] = useState<TabKey>('profile')
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const [showForbiddenTab, setShowForbiddenTab] = useState(false)

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
  const [isCartLoading, setIsCartLoading] = useState(true)
  const [cartError, setCartError] = useState('')
  const [cartMessage, setCartMessage] = useState('')
  const [cartMessageType, setCartMessageType] = useState<'success' | 'error'>('success')
  const [selectedCartIds, setSelectedCartIds] = useState<string[]>([])
  const [isDeletingCartItems, setIsDeletingCartItems] = useState(false)
  const allTabs: TabKey[] = [
    'profile',
    'orders',
    'cart',
    'archive',
    'allOrders',
    'sellerOrders',
    'userManagement',
    'contentManagement'
  ]

  const availableTabs = useMemo<TabKey[]>(() => {
    const tabs: TabKey[] = ['profile', 'orders', 'cart', 'archive']
    
    // 판매자 권한이 있으면 판매내역 탭 추가 (관리자여도 판매자면 보임)
    const isSeller = Boolean(user?.isSeller)
    if (user && isSeller) {
      tabs.push('sellerOrders')
    }
    
    // 관리자 권한이 있으면 관리자 탭들 추가
    if (user?.role === 'ADMIN') {
      tabs.push('allOrders', 'userManagement', 'contentManagement')
    }
    
    return tabs
  }, [user?.isSeller, user?.role])

  const isValidTab = (value: string | null): value is TabKey => {
    return allTabs.includes(value as TabKey)
  }

  const formatCurrency = (price: number) => `${price.toLocaleString()}원`

  const fetchCartItems = useCallback(async () => {
    setIsCartLoading(true)
    setCartError('')
    setCartMessage('')
    try {
      const response = await fetch('/api/shop/cart', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store'
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

  const handleTabChange = useCallback(
    (tab: TabKey) => {
      if (!availableTabs.includes(tab)) {
        setShowForbiddenTab(true)
        return
      }

      setShowForbiddenTab(false)
      setActiveTab(tab)
      const params = new URLSearchParams(searchParams ? searchParams.toString() : '')
      params.set('tab', tab)
      const queryString = params.toString()
      router.replace(queryString ? `/mypage?${queryString}` : '/mypage', { scroll: false })

      if (tab === 'cart') {
        fetchCartItems()
      }
    },
    [availableTabs, router, searchParams, fetchCartItems]
  )

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

  const handleProceedToCheckout = useCallback(() => {
    if (selectedCartIds.length === 0) {
      setCartMessageType('error')
      setCartMessage('주문할 상품을 선택해주세요.')
      return
    }

    if (hasInactiveSelectedItems) {
      setCartMessageType('error')
      setCartMessage('판매 중단된 상품은 결제할 수 없습니다. 삭제 후 다시 시도해주세요.')
      return
    }

    if (typeof window === 'undefined') return

    const payload = {
      mode: 'cart' as const,
      cartItemIds: selectedCartIds
    }

    window.sessionStorage.setItem('gcs_checkout_payload', JSON.stringify(payload))
    router.push('/shop/checkout')
  }, [hasInactiveSelectedItems, router, selectedCartIds])

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

  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (isLoading) {
      return
    }

    const rawTabParam = searchParams ? searchParams.get('tab') : null

    const defaultTab = availableTabs[0] ?? 'profile'

    if (!rawTabParam) {
      if (activeTab !== defaultTab) {
        setActiveTab(defaultTab)
      }
      setShowForbiddenTab(false)
      return
    }

    if (isValidTab(rawTabParam) && availableTabs.includes(rawTabParam as TabKey)) {
      if (activeTab !== rawTabParam) {
        setActiveTab(rawTabParam as TabKey)
      }
      setShowForbiddenTab(false)
    } else if (isValidTab(rawTabParam)) {
      if (activeTab !== defaultTab) {
        setActiveTab(defaultTab)
      }
      setShowForbiddenTab(true)
    } else {
      if (activeTab !== defaultTab) {
        setActiveTab(defaultTab)
      }
      setShowForbiddenTab(Boolean(rawTabParam))
    }
  }, [isLoading, searchParams, availableTabs, activeTab, router])

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
    }
  }, [user])

  useEffect(() => {
    if (!user) return

    const controller = new AbortController()
    let cancelled = false

    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/mypage/profile', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
          signal: controller.signal
        })
        const data = await response.json()
        if (!response.ok || !data.success || cancelled) {
          return
        }

        setUserInfo({
          id: data.data.id,
          email: data.data.email,
          name: data.data.name,
          studentId: data.data.studentId ?? '',
          major: data.data.major ?? '',
          phone: data.data.phone ?? '',
          role: data.data.role ?? user.role
        })
      } catch (error) {
        if (controller.signal.aborted) return
        console.error('프로필 정보 조회 오류:', error)
      }
    }

    fetchProfile()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [user])

  useEffect(() => {
    if (userInfo) {
      setFormData({
        name: userInfo.name || '',
        studentId: userInfo.studentId || '',
        major: userInfo.major || '',
        phone: userInfo.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    }
  }, [userInfo])

  useEffect(() => {
    if (activeTab === 'cart') {
      fetchCartItems()
    }
  }, [activeTab, fetchCartItems])

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

  const displayUser = userInfo ?? user

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
            <div className="flex flex-wrap justify-center gap-4 py-4">
              {availableTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`pb-2 border-b-2 font-medium transition-colors ${
                    activeTab === tab
                      ? 'text-black border-black'
                      : 'text-gray-400 border-transparent hover:text-black hover:border-gray-300'
                  }`}
                >
                  {TAB_LABELS[tab]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 메인 컨텐츠 영역 */}
        <div className="bg-white min-h-screen">
          <div className="max-w-6xl mx-auto px-4 py-6 sm:px-0">
            <div className="bg-white px-4 py-8">
              {showForbiddenTab ? (
                <ForbiddenTabNotice />
              ) : activeTab === 'profile' ? (
                <div>
                  {/* 사용자 정보 */}
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-black mb-6">개인정보</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                        <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">
                          {displayUser?.name ?? '-'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">학번</label>
                        <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">
                          {displayUser?.studentId && displayUser.studentId.trim().length > 0
                            ? displayUser.studentId
                            : '미입력'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">주전공</label>
                        <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">
                          {displayUser?.major && displayUser.major.trim().length > 0
                            ? displayUser.major
                            : '미입력'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
                        <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">
                          {displayUser?.phone ?? '-'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                        <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">
                          {displayUser?.email ?? '-'}
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
                          onClick={handleProceedToCheckout}
                          disabled={selectedCartIds.length === 0 || hasInactiveSelectedItems}
                            className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-colors md:flex-none md:px-6 ${
                              selectedCartIds.length === 0 || hasInactiveSelectedItems
                                ? 'cursor-not-allowed bg-gray-300 text-gray-500'
                                : 'bg-black text-white hover:bg-gray-800'
                            }`}
                          >
                          결제하기
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : activeTab === 'archive' ? (
                <MyArchiveTab user={user} />
              ) : activeTab === 'orders' ? (
                <MyOrdersTab />
              ) : activeTab === 'allOrders' ? (
                <AdminOrdersTab />
              ) : activeTab === 'sellerOrders' ? (
                <SellerOrdersTab />
              ) : activeTab === 'userManagement' ? (
                <AdminUserManagementTab />
              ) : activeTab === 'contentManagement' ? (
                <ContentManagementPanel />
              ) : null}
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

type MyOrderItem = {
  id: string
  quantity: number
  price: number
  selectedOptions?: unknown
  product: {
    id: string
    name: string
    images?: string[]
    type?: string
    author?: {
      id: string
      name: string | null
      email: string | null
    } | null
  }
}

type MyOrder = {
  id: string
  status: string
  totalAmount: number
  shippingAddress: string
  phone: string
  buyerName?: string | null
  buyerEmail?: string | null
  notes?: string | null
  partnerUpStatus?: string | null
  partnerUpStatusUpdatedAt?: string | null
  partnerUpStatusNote?: string | null
  fundStatus?: string | null
  fundStatusUpdatedAt?: string | null
  fundStatusNote?: string | null
  billingExecutedAt?: string | null
  fundStatus?: string | null
  fundStatusUpdatedAt?: string | null
  fundStatusNote?: string | null
  createdAt: string
  orderItems: MyOrderItem[]
  paymentRecords: Array<{
    id: string
    impUid: string | null
    merchantUid: string | null
    amount: number
    method: string | null
    status: string
    createdAt: string
  }>
}

type ManagedOrderItem = {
  id: string
  quantity: number
  price: number
  selectedOptions?: unknown
  product: {
    id: string
    name: string
    images?: string[]
  }
}

type ManagedOrder = {
  id: string
  status: string
  totalAmount: number
  shippingAddress: string
  phone: string
  buyerName?: string | null
  buyerEmail?: string | null
  notes?: string | null
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string | null
    phone: string | null
  }
  orderItems: ManagedOrderItem[]
  paymentRecords: Array<{
    id: string
    impUid: string | null
    merchantUid: string | null
    amount: number
    method: string | null
    status: string
    createdAt: string
  }>
}

function MyOrdersTab() {
  const [orders, setOrders] = useState<MyOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null)

  const formatCurrency = useCallback((value: number) => `${value.toLocaleString()}원`, [])

  const parseOptions = useCallback((selectedOptions: unknown): string[] => {
    if (!selectedOptions) return []
    if (Array.isArray(selectedOptions)) {
      return selectedOptions
        .map((option) => {
          if (option && typeof option === 'object' && 'name' in option && 'label' in option) {
            const { name, label } = option as { name?: string; label?: string }
            if (name && label) {
              return `${name}: ${label}`
            }
          }
          return null
        })
        .filter((value): value is string => !!value)
    }

    try {
      const parsed = JSON.parse(JSON.stringify(selectedOptions))
      if (Array.isArray(parsed)) {
        return parsed
          .map((option) => {
            if (option && typeof option === 'object' && option.name && option.label) {
              return `${option.name}: ${option.label}`
            }
            return null
          })
          .filter((value): value is string => !!value)
      }
    } catch (optionError) {
      console.error('내 주문 옵션 파싱 실패:', optionError)
    }

    return []
  }, [])

  const fetchMyOrders = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await fetch('/api/mypage/orders', {
        method: 'GET',
        cache: 'no-store'
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error || '주문 내역을 불러오지 못했습니다.')
      }
      setOrders(Array.isArray(data.data) ? (data.data as MyOrder[]) : [])
    } catch (fetchError) {
      console.error('내 주문 내역 조회 오류:', fetchError)
      setError(fetchError instanceof Error ? fetchError.message : '주문 내역을 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMyOrders()
  }, [fetchMyOrders])

  const handleCancelOrder = useCallback(async (orderId: string) => {
    if (!confirm('정말로 이 주문을 취소하시겠습니까? 취소된 주문은 복구할 수 없습니다.')) {
      return
    }

    setCancellingOrderId(orderId)
    try {
      const response = await fetch(`/api/mypage/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        alert('주문이 성공적으로 취소되었습니다.')
        // 주문 목록 다시 불러오기
        fetchMyOrders()
      } else {
        alert(data.error || '주문 취소 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('주문 취소 오류:', error)
      alert('주문 취소 중 오류가 발생했습니다.')
    } finally {
      setCancellingOrderId(null)
    }
  }, [fetchMyOrders])

  // 주문 취소 가능 여부 확인 함수
  const canCancelOrder = useCallback((order: MyOrder): boolean => {
    // 이미 취소된 주문은 취소 불가
    if (order.status === 'CANCELLED') {
      return false
    }

    // Fund 상품이 포함되어 있는지 확인
    const hasFundProducts = order.orderItems.some(
      (item) => item.product.type === 'FUND'
    )

    if (!hasFundProducts) {
      return false
    }

    // fundStatus가 ORDERED여야 함
    if (order.fundStatus !== 'ORDERED') {
      return false
    }

    // billingExecutedAt가 null이어야 함 (빌링키 결제가 실행되지 않음)
    if (order.billingExecutedAt !== null && order.billingExecutedAt !== undefined) {
      return false
    }

    return true
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-black"></div>
          <p className="text-gray-600">주문 내역을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 border border-dashed border-gray-300 rounded-lg">
        주문 내역이 없습니다.
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-black mb-6">내 주문내역</h2>
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 flex flex-wrap gap-4 justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">주문 번호</p>
                <p className="text-base font-semibold text-black">{order.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">주문 일시</p>
                <p className="text-base font-semibold text-black">
                  {new Date(order.createdAt).toLocaleString('ko-KR')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">상태</p>
                <span className="inline-flex items-center rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
                  {order.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">결제 금액</p>
                <p className="text-lg font-bold text-black">{formatCurrency(order.totalAmount)}</p>
              </div>
            </div>

            <div className="px-4 py-4 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">받는 분</p>
                <p className="text-sm text-gray-600 mt-1">{order.buyerName || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">이메일</p>
                <p className="text-sm text-gray-600 mt-1">{order.buyerEmail || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">배송지</p>
                <p className="text-sm text-gray-600 mt-1">{order.shippingAddress}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">연락처</p>
                <p className="text-sm text-gray-600 mt-1">{order.phone}</p>
              </div>
              {order.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-700">요청 사항</p>
                  <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{order.notes}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">주문 상품</p>
                <div className="space-y-3">
                  {order.orderItems.map((item) => {
                    const optionLabels = parseOptions(item.selectedOptions)
                    const productImage = item.product.images?.[0]
                    return (
                      <div
                        key={item.id}
                        className="flex flex-col md:flex-row md:items-center gap-4 border border-gray-200 rounded-lg p-4"
                      >
                        <div className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                          {productImage ? (
                            <img
                              src={productImage}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/images/placeholder-product.jpg'
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                              No Image
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap justify-between gap-2">
                            <p className="text-base font-semibold text-gray-900">{item.product.name}</p>
                            <p className="text-base font-semibold text-black">
                              {formatCurrency(item.price * item.quantity)}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">수량 {item.quantity}개</p>
                          {optionLabels.length > 0 && (
                            <ul className="mt-2 space-y-1 text-xs text-gray-500">
                              {optionLabels.map((label) => (
                                <li key={`${item.id}-${label}`}>• {label}</li>
                              ))}
                            </ul>
                          )}
                          {item.product.author?.name && (
                            <p className="text-xs text-gray-400 mt-2">
                              판매자: {item.product.author.name}
                              {item.product.author.email ? ` (${item.product.author.email})` : ''}
                            </p>
                          )}
                          {item.product.type === 'PARTNER_UP' && order.partnerUpStatus && (
                            <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                              <p className="text-xs font-medium text-orange-900 mb-1">
                                현재 단계: {getPartnerUpStatusLabel(order.partnerUpStatus)}
                              </p>
                              {order.partnerUpStatusNote && (
                                <p className="text-xs text-orange-700 mt-1">
                                  {order.partnerUpStatusNote}
                                </p>
                              )}
                              {order.partnerUpStatusUpdatedAt && (
                                <p className="text-xs text-orange-600 mt-1">
                                  업데이트: {new Date(order.partnerUpStatusUpdatedAt).toLocaleString('ko-KR')}
                                </p>
                              )}
                            </div>
                          )}
                          {item.product.type === 'FUND' && order.fundStatus && (
                            <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                              <p className="text-xs font-medium text-orange-900 mb-1">
                                현재 단계: {getFundStatusLabel(order.fundStatus)}
                              </p>
                              {order.fundStatusNote && (
                                <p className="text-xs text-orange-700 mt-1">
                                  {order.fundStatusNote}
                                </p>
                              )}
                              {order.fundStatusUpdatedAt && (
                                <p className="text-xs text-orange-600 mt-1">
                                  업데이트: {new Date(order.fundStatusUpdatedAt).toLocaleString('ko-KR')}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {order.paymentRecords.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">결제 정보</p>
                  <div className="space-y-2">
                    {order.paymentRecords.map((record) => (
                      <div
                        key={record.id}
                        className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 border border-gray-200 rounded-lg px-3 py-2"
                      >
                        <span className="font-semibold text-black">{record.status}</span>
                        <span>{formatCurrency(record.amount)}</span>
                        {record.method && <span>결제수단: {record.method}</span>}
                        {record.impUid && <span>impUid: {record.impUid}</span>}
                        {record.merchantUid && <span>주문번호: {record.merchantUid}</span>}
                        <span className="text-gray-400">
                          {new Date(record.createdAt).toLocaleString('ko-KR')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 주문 취소 버튼 */}
              {canCancelOrder(order) && (
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleCancelOrder(order.id)}
                    disabled={cancellingOrderId === order.id}
                    className="w-full px-4 py-2 bg-red-50 border border-red-300 text-red-700 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    {cancellingOrderId === order.id ? '취소 중...' : '주문 취소'}
                  </button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    빌링키 결제가 실행되기 전까지 주문 취소가 가능합니다.
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AllOrdersTab() {
  const [orders, setOrders] = useState<ManagedOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')

  const formatCurrency = useCallback((value: number) => `${value.toLocaleString()}원`, [])

  const parseOptions = useCallback((selectedOptions: unknown): string[] => {
    if (!selectedOptions) return []
    if (Array.isArray(selectedOptions)) {
      return selectedOptions
        .map((option) => {
          if (option && typeof option === 'object' && 'name' in option && 'label' in option) {
            const { name, label } = option as { name?: string; label?: string }
            if (name && label) {
              return `${name}: ${label}`
            }
          }
          return null
        })
        .filter((value): value is string => !!value)
    }

    try {
      const parsed = JSON.parse(JSON.stringify(selectedOptions))
      if (Array.isArray(parsed)) {
        return parsed
          .map((option) => {
            if (option && typeof option === 'object' && option.name && option.label) {
              return `${option.name}: ${option.label}`
            }
            return null
          })
          .filter((value): value is string => !!value)
      }
    } catch (optionError) {
      console.error('주문 옵션 파싱 실패:', optionError)
    }

    return []
  }, [])

  const fetchManagedOrders = useCallback(async (keyword: string) => {
    setIsLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (keyword) {
        params.set('q', keyword)
      }

      const response = await fetch(
        `/api/mypage/orders/seller${params.toString() ? `?${params.toString()}` : ''}`,
        {
          cache: 'no-store'
        }
      )
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error || '주문 내역을 불러오지 못했습니다.')
      }
      setOrders(Array.isArray(data.data) ? (data.data as ManagedOrder[]) : [])
    } catch (fetchError) {
      console.error('모든 주문 내역 조회 오류:', fetchError)
      setError(fetchError instanceof Error ? fetchError.message : '주문 내역을 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchManagedOrders(appliedSearch)
  }, [fetchManagedOrders, appliedSearch])

  const handleSearchSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setAppliedSearch(searchTerm.trim())
    },
    [searchTerm]
  )

  const handleResetSearch = useCallback(() => {
    setSearchTerm('')
    setAppliedSearch('')
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-black"></div>
          <p className="text-gray-600">주문 내역을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 border border-dashed border-gray-300 rounded-lg">
        표시할 주문 내역이 없습니다.
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold text-black">모든 주문내역</h2>
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4"
        >
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="상품명을 입력하세요"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black md:w-72"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              검색
            </button>
            <button
              type="button"
              onClick={handleResetSearch}
              disabled={!searchTerm && !appliedSearch}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                !searchTerm && !appliedSearch
                  ? 'cursor-not-allowed border-gray-200 text-gray-400'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              초기화
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="overflow-hidden rounded-lg border border-gray-200">
            <div className="flex flex-wrap items-start justify-between gap-4 bg-gray-50 px-4 py-3">
              <div>
                <p className="text-sm text-gray-500">주문 번호</p>
                <p className="text-base font-semibold text-black">{order.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">주문 일시</p>
                <p className="text-base font-semibold text-black">
                  {new Date(order.createdAt).toLocaleString('ko-KR')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">상태</p>
                <span className="inline-flex items-center rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
                  {order.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">주문자 (계정)</p>
                <p className="text-base font-semibold text-black">
                  {order.user?.name ?? '정보 없음'}
                </p>
                <p className="text-xs text-gray-500">
                  {order.user?.email ?? '이메일 없음'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">받는 분</p>
                <p className="text-base font-semibold text-black">
                  {order.buyerName ?? '-'}
                </p>
              </div>
            </div>

            <div className="space-y-4 px-4 py-4">
              <div className="flex flex-col gap-2 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-gray-500">받는 분</p>
                  <p className="text-sm font-medium text-black">{order.buyerName || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">이메일</p>
                  <p className="text-sm font-medium text-black">{order.buyerEmail || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">배송지</p>
                  <p className="text-sm font-medium text-black">{order.shippingAddress}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">연락처</p>
                  <p className="text-sm font-medium text-black">{order.phone}</p>
                </div>
                {order.notes && (
                  <div className="md:text-right">
                    <p className="text-sm text-gray-500">요청사항</p>
                    <p className="text-sm font-medium text-black">{order.notes}</p>
                  </div>
                )}
              </div>

              <div>
                <p className="mb-3 text-sm font-medium text-gray-700">주문 상품</p>
                <div className="space-y-3">
                  {order.orderItems.map((item) => {
                    const options = parseOptions(item.selectedOptions)
                    const thumbnail = item.product?.images?.[0]
                    return (
                      <div
                        key={item.id}
                        className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 md:flex-row"
                      >
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
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h4 className="text-base font-semibold text-gray-900">
                              {item.product?.name}
                            </h4>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">판매가</p>
                              <p className="text-sm font-medium text-black">
                                {formatCurrency(item.price)}
                              </p>
                            </div>
                          </div>
                          {options.length > 0 && (
                            <ul className="mt-3 space-y-1 text-sm text-gray-600">
                              {options.map((option) => (
                                <li key={`${item.id}-${option}`}>{option}</li>
                              ))}
                            </ul>
                          )}
                          <p className="mt-3 text-sm text-gray-500">수량 {item.quantity}개</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">총 결제 금액</p>
                  <p className="text-lg font-bold text-black">{formatCurrency(order.totalAmount)}</p>
                </div>
                {order.paymentRecords.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500">결제 이력</p>
                    <div className="mt-2 space-y-2">
                      {order.paymentRecords.map((record) => (
                        <div key={record.id} className="rounded-lg border border-gray-200 bg-white p-3">
                          <p className="text-xs text-gray-500">
                            {new Date(record.createdAt).toLocaleString('ko-KR')}
                          </p>
                          <p className="text-sm font-medium text-black">
                            {record.method ?? '결제수단 미확인'} · {formatCurrency(record.amount)}
                          </p>
                          <p className="text-xs text-gray-500">
                            상태: {record.status}
                            {record.merchantUid && <span> · 주문번호: {record.merchantUid}</span>}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ContentManagementPanel() {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-black mb-6">콘텐츠 관리</h2>
      <p className="text-gray-600 mb-6">About 페이지의 각 섹션 콘텐츠를 관리합니다.</p>
      <Link
        href="/admin/content"
        className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
      >
        콘텐츠 관리 페이지로 이동
      </Link>
    </div>
  )
}

// 판매자용 주문 목록 탭 컴포넌트
type SellerOrderItem = {
  id: string
  quantity: number
  price: number
  selectedOptions?: unknown
  product: {
    id: string
    name: string
    type: string
    images?: string[]
  }
}

type SellerOrder = {
  id: string
  buyer: {
    id: string
    name: string
    email: string
    phone: string
  }
  totalAmount: number
  shippingAddress: string
  phone: string
  buyerName?: string | null
  buyerEmail?: string | null
  notes?: string | null
  partnerUpStatus?: string | null
  partnerUpStatusUpdatedAt?: string | null
  partnerUpStatusNote?: string | null
  fundStatus?: string | null
  fundStatusUpdatedAt?: string | null
  fundStatusNote?: string | null
  orderItems: SellerOrderItem[]
  createdAt: string
  updatedAt: string
}

function SellerOrdersTab() {
  const [orders, setOrders] = useState<SellerOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [selectedProductType, setSelectedProductType] = useState<'PARTNER_UP' | 'FUND' | null>(null)
  const [newStatus, setNewStatus] = useState<string>('')
  const [statusNote, setStatusNote] = useState<string>('')

  const formatCurrency = useCallback((value: number) => `${value.toLocaleString()}원`, [])

  const parseOptions = useCallback((selectedOptions: unknown): string[] => {
    if (!selectedOptions) return []
    if (Array.isArray(selectedOptions)) {
      return selectedOptions
        .map((option) => {
          if (option && typeof option === 'object' && 'name' in option && 'label' in option) {
            const { name, label } = option as { name?: string; label?: string }
            if (name && label) {
              return `${name}: ${label}`
            }
          }
          return null
        })
        .filter((value): value is string => !!value)
    }
    try {
      const parsed = JSON.parse(JSON.stringify(selectedOptions))
      if (Array.isArray(parsed)) {
        return parsed
          .map((option) => {
            if (option && typeof option === 'object' && option.name && option.label) {
              return `${option.name}: ${option.label}`
            }
            return null
          })
          .filter((value): value is string => !!value)
      }
    } catch (optionError) {
      console.error('주문 옵션 파싱 실패:', optionError)
    }
    return []
  }, [])

  const fetchSellerOrders = useCallback(async (pageNum: number) => {
    setIsLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/mypage/orders/seller/status?page=${pageNum}&limit=10`, {
        cache: 'no-store'
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error || '주문 내역을 불러오지 못했습니다.')
      }
      setOrders(Array.isArray(data.data.orders) ? (data.data.orders as SellerOrder[]) : [])
      setTotalPages(data.data.pagination?.totalPages || 1)
    } catch (fetchError) {
      console.error('판매자 주문 내역 조회 오류:', fetchError)
      setError(fetchError instanceof Error ? fetchError.message : '주문 내역을 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSellerOrders(page)
  }, [fetchSellerOrders, page])

  const handleStatusUpdate = async (orderId: string, productType: 'PARTNER_UP' | 'FUND') => {
    if (!newStatus) {
      alert('상태를 선택해주세요.')
      return
    }

    setUpdatingOrderId(orderId)
    try {
      const response = await fetch('/api/mypage/orders/seller/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId,
          status: newStatus,
          productType,
          note: statusNote || undefined
        })
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error || '주문 단계 업데이트에 실패했습니다.')
      }

      alert('주문 단계가 업데이트되었습니다.')
      setSelectedOrderId(null)
      setSelectedProductType(null)
      setNewStatus('')
      setStatusNote('')
      await fetchSellerOrders(page)
    } catch (error) {
      console.error('주문 단계 업데이트 오류:', error)
      alert(error instanceof Error ? error.message : '주문 단계 업데이트에 실패했습니다.')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const getAvailableStatuses = (productType: 'PARTNER_UP' | 'FUND'): string[] => {
    if (productType === 'PARTNER_UP') {
      return ['ORDERED', 'CONFIRMED', 'PRODUCTION_STARTED', 'SHIPPED_OUT', 'SHIPPING', 'ARRIVED', 'RECEIVED']
    } else {
      return ['ORDERED', 'BILLING_COMPLETED', 'CONFIRMED', 'PRODUCTION_STARTED', 'SHIPPED_OUT', 'SHIPPING', 'ARRIVED', 'RECEIVED']
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-black"></div>
          <p className="text-gray-600">주문 내역을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 border border-dashed border-gray-300 rounded-lg">
        판매 내역이 없습니다.
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-black mb-6">내 상품 판매내역</h2>

      <div className="space-y-6">
        {orders.map((order) => {
          return (
            <div key={order.id} className="overflow-hidden rounded-lg border border-gray-200">
              <div className="flex flex-wrap items-start justify-between gap-4 bg-gray-50 px-4 py-3">
                <div>
                  <p className="text-sm text-gray-500">주문 번호</p>
                  <p className="text-base font-semibold text-black">{order.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">주문 일시</p>
                  <p className="text-base font-semibold text-black">
                    {new Date(order.createdAt).toLocaleString('ko-KR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">구매자</p>
                  <p className="text-base font-semibold text-black">{order.buyer.name}</p>
                  <p className="text-xs text-gray-500">{order.buyer.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">총 결제 금액</p>
                  <p className="text-lg font-bold text-black">{formatCurrency(order.totalAmount)}</p>
                </div>
              </div>

              <div className="space-y-4 px-4 py-4">
                <div className="flex flex-col gap-2 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm text-gray-500">받는 분</p>
                    <p className="text-sm font-medium text-black">{order.buyerName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">이메일</p>
                    <p className="text-sm font-medium text-black">{order.buyerEmail || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">배송지</p>
                    <p className="text-sm font-medium text-black">{order.shippingAddress}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">연락처</p>
                    <p className="text-sm font-medium text-black">{order.phone}</p>
                  </div>
                  {order.notes && (
                    <div className="md:text-right">
                      <p className="text-sm text-gray-500">요청사항</p>
                      <p className="text-sm font-medium text-black">{order.notes}</p>
                    </div>
                  )}
                </div>

                <div>
                  <p className="mb-3 text-sm font-medium text-gray-700">주문 상품</p>
                  <div className="space-y-3">
                    {order.orderItems.map((item) => {
                      const options = parseOptions(item.selectedOptions)
                      const thumbnail = item.product?.images?.[0]
                      const isPartnerUp = item.product.type === 'PARTNER_UP'
                      const isFund = item.product.type === 'FUND'
                      const currentStatus = isPartnerUp ? order.partnerUpStatus : isFund ? order.fundStatus : null
                      const statusUpdatedAt = isPartnerUp ? order.partnerUpStatusUpdatedAt : isFund ? order.fundStatusUpdatedAt : null
                      const currentStatusNote = isPartnerUp ? order.partnerUpStatusNote : isFund ? order.fundStatusNote : null
                      const isSelected = selectedOrderId === order.id && selectedProductType === (isPartnerUp ? 'PARTNER_UP' : 'FUND')

                      return (
                        <div
                          key={item.id}
                          className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 md:flex-row"
                        >
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
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <h4 className="text-base font-semibold text-gray-900">
                                {item.product?.name}
                              </h4>
                              <div className="text-right">
                                <p className="text-xs text-gray-500">판매가</p>
                                <p className="text-sm font-medium text-black">
                                  {formatCurrency(item.price)}
                                </p>
                              </div>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                              타입: {isPartnerUp ? 'Partner up' : isFund ? 'Fund' : '일반'}
                            </p>
                            {options.length > 0 && (
                              <ul className="mt-3 space-y-1 text-sm text-gray-600">
                                {options.map((option) => (
                                  <li key={`${item.id}-${option}`}>{option}</li>
                                ))}
                              </ul>
                            )}
                            <p className="mt-3 text-sm text-gray-500">수량 {item.quantity}개</p>

                            {/* 주문 단계 표시 및 업데이트 */}
                            {(isPartnerUp || isFund) && (
                              <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-3">
                                <div className="mb-3 flex items-center justify-between">
                                  <div>
                                    <p className="text-xs font-medium text-orange-900">현재 주문 단계</p>
                                    <p className="mt-1 text-sm font-semibold text-orange-900">
                                      {currentStatus
                                        ? isPartnerUp
                                          ? getPartnerUpStatusLabel(currentStatus)
                                          : getFundStatusLabel(currentStatus)
                                        : '미설정'}
                                    </p>
                                    {statusUpdatedAt && (
                                      <p className="mt-1 text-xs text-orange-600">
                                        업데이트: {new Date(statusUpdatedAt).toLocaleString('ko-KR')}
                                      </p>
                                    )}
                                    {currentStatusNote && (
                                      <p className="mt-1 text-xs text-orange-700">{currentStatusNote}</p>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => {
                                      setSelectedOrderId(order.id)
                                      setSelectedProductType(isPartnerUp ? 'PARTNER_UP' : 'FUND')
                                      setNewStatus(currentStatus || '')
                                      setStatusNote(currentStatusNote || '')
                                    }}
                                    className="rounded-lg bg-[#f57520] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#e06510] transition-colors"
                                  >
                                    단계 변경
                                  </button>
                                </div>

                                {isSelected && (
                                  <div className="mt-3 space-y-3 rounded-lg border border-orange-300 bg-white p-3">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        주문 단계 선택
                                      </label>
                                      <select
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#f57520] focus:outline-none focus:ring-2 focus:ring-[#f57520]"
                                      >
                                        <option value="">선택하세요</option>
                                        {getAvailableStatuses(isPartnerUp ? 'PARTNER_UP' : 'FUND').map(
                                          (status) => (
                                            <option key={status} value={status}>
                                              {isPartnerUp
                                                ? getPartnerUpStatusLabel(status)
                                                : getFundStatusLabel(status)}
                                            </option>
                                          )
                                        )}
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        메모 (선택사항)
                                      </label>
                                      <textarea
                                        value={statusNote}
                                        onChange={(e) => setStatusNote(e.target.value)}
                                        placeholder="단계 변경 메모를 입력하세요"
                                        rows={2}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#f57520] focus:outline-none focus:ring-2 focus:ring-[#f57520]"
                                      />
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleStatusUpdate(order.id, isPartnerUp ? 'PARTNER_UP' : 'FUND')}
                                        disabled={!newStatus || updatingOrderId === order.id}
                                        className="flex-1 rounded-lg bg-[#f57520] px-4 py-2 text-sm font-medium text-white hover:bg-[#e06510] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                      >
                                        {updatingOrderId === order.id ? '업데이트 중...' : '저장'}
                                      </button>
                                      <button
                                        onClick={() => {
                                          setSelectedOrderId(null)
                                          setSelectedProductType(null)
                                          setNewStatus('')
                                          setStatusNote('')
                                        }}
                                        disabled={updatingOrderId === order.id}
                                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        취소
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            이전
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            다음
          </button>
        </div>
      )}
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
              {myProducts.map((product) => {
                const typeLabel = getProductTypeLabel(product.type)
                return (
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
                          {typeLabel && (
                            <span className="uppercase tracking-wide text-gray-500">{typeLabel}</span>
                          )}
                          {!product.isActive && (
                            <span className="text-red-500">판매 중단</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
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

function ForbiddenTabNotice() {
  return (
    <div className="text-center py-12 text-gray-500 border border-dashed border-gray-300 rounded-lg">
      <h2 className="text-2xl font-bold text-black mb-3">현 계정의 권한으로는 접근할 수 없는 페이지입니다.</h2>
      <p className="text-sm text-gray-600">권한을 확인한 뒤 다시 시도해주세요.</p>
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
