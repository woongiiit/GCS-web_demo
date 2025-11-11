'use client'

import {
  Suspense,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ChangeEvent,
  type FormEvent
} from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getProductTypeMeta, normalizeProductType } from '@/lib/shop/product-types'

function getProductTypeLabel(typeId?: string | null) {
  if (!typeId) return ''
  const normalizedType = normalizeProductType(typeId)
  if (!normalizedType) return ''
  return getProductTypeMeta(normalizedType)?.name ?? ''
}

export default function AdminPage() {
  return (
    <Suspense fallback={<AdminPageSuspenseFallback />}>
      <AdminPageContent />
    </Suspense>
  )
}

function AdminPageContent() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<
    'users' | 'content' | 'profile' | 'cart' | 'archive' | 'orders' | 'my-orders'
  >('users')
  const searchParams = useSearchParams()

  const isValidTab = (
    value: string | null
  ): value is 'users' | 'content' | 'profile' | 'cart' | 'archive' | 'orders' | 'my-orders' => {
    return (
      value === 'users' ||
      value === 'content' ||
      value === 'profile' ||
      value === 'cart' ||
      value === 'archive' ||
      value === 'orders' ||
      value === 'my-orders'
    )
  }

  const handleTabChange = useCallback(
    (tab: 'users' | 'content' | 'profile' | 'cart' | 'archive' | 'orders' | 'my-orders') => {
      setActiveTab(tab)
      const params = new URLSearchParams(searchParams ? searchParams.toString() : '')
      params.set('tab', tab)
      const queryString = params.toString()
      router.replace(queryString ? `/admin?${queryString}` : '/admin', { scroll: false })
    },
    [router, searchParams]
  )

  // 로그인하지 않은 경우 또는 관리자가 아닌 경우 리다이렉트
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/')
    }
  }, [user, isLoading, router])

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

  if (!user || user.role !== 'ADMIN') {
    return null
  }

  useEffect(() => {
    const tabParam = searchParams ? searchParams.get('tab') : null
    if (isValidTab(tabParam) && tabParam !== activeTab) {
      setActiveTab(tabParam)
    }
  }, [searchParams, activeTab])

  return (
    <div className="fixed inset-0 bg-white overflow-auto" style={{ overflowY: 'scroll' }}>
      <div className="relative min-h-screen bg-white">
        {/* 상단 검은색 영역 */}
        <div className="bg-black pt-32 pb-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-0">
            {/* 페이지 제목 */}
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">관리자 페이지</h1>
              <p className="text-white text-sm mb-8">사용자 관리 및 콘텐츠 관리를 수행하세요.</p>
              
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
            <div className="flex flex-wrap justify-center gap-6 py-4">
              <button
                onClick={() => handleTabChange('users')}
                className={`pb-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'users'
                    ? 'text-black border-black'
                    : 'text-gray-400 border-transparent hover:text-black hover:border-gray-300'
                }`}
              >
                사용자 관리
              </button>
              <button
                onClick={() => handleTabChange('content')}
                className={`pb-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'content'
                    ? 'text-black border-black'
                    : 'text-gray-400 border-transparent hover:text-black hover:border-gray-300'
                }`}
              >
                콘텐츠 관리
              </button>
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
              <button
                onClick={() => handleTabChange('my-orders')}
                className={`pb-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'my-orders'
                    ? 'text-black border-black'
                    : 'text-gray-400 border-transparent hover:text-black hover:border-gray-300'
                }`}
              >
                내 주문내역
              </button>
              <button
                onClick={() => handleTabChange('orders')}
                className={`pb-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'orders'
                    ? 'text-black border-black'
                    : 'text-gray-400 border-transparent hover:text-black hover:border-gray-300'
                }`}
              >
                모든 주문내역
              </button>
            </div>
          </div>
        </div>

        {/* 메인 컨텐츠 영역 */}
        <div className="bg-white min-h-screen">
          <div className="max-w-6xl mx-auto px-4 py-6 sm:px-0">
            <div className="bg-white px-4 py-8">
              {activeTab === 'users' && <UserManagement />}
              {activeTab === 'content' && (
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
              )}
              {activeTab === 'profile' && <AdminProfileTab user={user} />}
              {activeTab === 'cart' && <AdminCartTab />}
              {activeTab === 'archive' && <AdminArchiveTab user={user} />}
              {activeTab === 'my-orders' && <AdminMyOrdersTab />}
              {activeTab === 'orders' && <AdminOrdersTab />}
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

type CartOptionSummary = {
  name: string
  label: string
  priceAdjustment: number
}

type CartProductInfo = {
  id: string
  name: string
  price: number
  images: string[]
  brand?: string | null
  isActive: boolean
}

type CartItem = {
  id: string
  productId: string
  quantity: number
  unitPrice: number
  selectedOptions?: CartOptionSummary[] | null
  product: CartProductInfo
}

function AdminPageSuspenseFallback() {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
        <p className="text-gray-600">로딩 중...</p>
      </div>
    </div>
  )
}

function AdminProfileTab({ user }: { user: any }) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
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

  return (
    <div>
      <h2 className="text-2xl font-bold text-black mb-6">개인정보</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <InfoField label="이름" value={user.name} />
        <InfoField label="학번" value={user.studentId || '-'} />
        <InfoField label="주전공" value={user.major || '-'} />
        <InfoField label="전화번호" value={user.phone || '-'} />
        <InfoField label="이메일" value={user.email} />
        <InfoField
          label="역할"
          value={`관리자${user.isSeller ? ' / 판매자 권한' : ''}`}
        />
      </div>

      <div>
        <h3 className="text-xl font-bold text-black mb-6">비밀번호 변경</h3>

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
          <PasswordInput
            id="currentPassword"
            name="currentPassword"
            label="현재 비밀번호"
            value={formData.currentPassword}
            onChange={handleChange}
          />
          <PasswordInput
            id="newPassword"
            name="newPassword"
            label="새 비밀번호"
            value={formData.newPassword}
            onChange={handleChange}
          />
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            label="새 비밀번호 확인"
            value={formData.confirmPassword}
            onChange={handleChange}
          />

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
  )
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">
        {value}
      </div>
    </div>
  )
}

function PasswordInput({
  id,
  name,
  label,
  value,
  onChange
}: {
  id: string
  name: string
  label: string
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type="password"
        required
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
        value={value}
        onChange={onChange}
      />
    </div>
  )
}


type AdminOrderItem = {
  id: string
  quantity: number
  price: number
  selectedOptions?: unknown
  product: {
    id: string
    name: string
    author?: {
      id: string
      name: string | null
      email: string | null
    } | null
  }
}

type AdminOrder = {
  id: string
  status: string
  totalAmount: number
  shippingAddress: string
  phone: string
  notes?: string | null
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    phone: string
    role: string
  }
  orderItems: AdminOrderItem[]
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

type AdminMyOrder = {
  id: string
  status: string
  totalAmount: number
  shippingAddress: string
  phone: string
  notes?: string | null
  createdAt: string
  orderItems: AdminOrderItem[]
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

function parseOrderOptions(selectedOptions: unknown): string[] {
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
}

function AdminOrdersTab() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10

  const formatCurrency = useCallback((value: number) => `${value.toLocaleString()}원`, [])

  const fetchOrders = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      })
      const response = await fetch(`/api/admin/orders?${params.toString()}`, { cache: 'no-store' })
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || '주문 내역을 불러오지 못했습니다.')
      }

      setOrders(Array.isArray(data.data?.orders) ? (data.data.orders as AdminOrder[]) : [])
      setTotalPages(data.data?.pagination?.totalPages ?? 1)
    } catch (fetchError) {
      console.error('관리자 주문 내역 조회 오류:', fetchError)
      setError(fetchError instanceof Error ? fetchError.message : '주문 내역을 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [limit, page])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  return (
    <div>
      <h2 className="text-2xl font-bold text-black mb-6">모든 주문내역</h2>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-black"></div>
            <p className="text-gray-600">주문 내역을 불러오는 중...</p>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-12 text-center text-gray-500 border border-dashed border-gray-300 rounded-lg">
          등록된 주문이 없습니다.
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 flex flex-wrap gap-4 justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">주문 번호</p>
                  <p className="text-base font-semibold text-black">{order.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">주문자</p>
                  <p className="text-base font-semibold text-black">
                    {order.user.name}{' '}
                    <span className="text-sm font-normal text-gray-500">({order.user.email})</span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">연락처</p>
                  <p className="text-base font-semibold text-black">{order.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">상태</p>
                  <span className="inline-flex items-center rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
                    {order.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">주문 일시</p>
                  <p className="text-base font-semibold text-black">
                    {new Date(order.createdAt).toLocaleString('ko-KR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">결제 금액</p>
                  <p className="text-lg font-bold text-black">{formatCurrency(order.totalAmount)}</p>
                </div>
              </div>

              <div className="px-4 py-4 space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">배송지</p>
                  <p className="text-sm text-gray-600 mt-1">{order.shippingAddress}</p>
                </div>
                {order.notes && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">요청 사항</p>
                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{order.notes}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">주문 상품</p>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="hidden md:grid grid-cols-12 bg-gray-50 text-sm font-semibold text-gray-600">
                      <div className="col-span-4 px-4 py-3">상품 정보</div>
                      <div className="col-span-2 px-4 py-3 text-center">판매자</div>
                      <div className="col-span-2 px-4 py-3 text-center">수량</div>
                      <div className="col-span-2 px-4 py-3 text-right">단가</div>
                      <div className="col-span-2 px-4 py-3 text-right">소계</div>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {order.orderItems.map((item) => {
                        const optionLabels = parseOrderOptions(item.selectedOptions)
                        return (
                          <div key={item.id} className="flex flex-col md:grid md:grid-cols-12">
                            <div className="md:col-span-4 px-4 py-3">
                              <p className="font-medium text-gray-900">{item.product.name}</p>
                              {optionLabels.length > 0 && (
                                <ul className="mt-2 space-y-1 text-xs text-gray-500">
                                  {optionLabels.map((label) => (
                                    <li key={`${item.id}-${label}`}>• {label}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                            <div className="md:col-span-2 px-4 py-3 text-sm text-gray-600 md:text-center">
                              {item.product.author?.name ?? '관리자'}
                              {item.product.author?.email && (
                                <div className="text-xs text-gray-400">
                                  {item.product.author.email}
                                </div>
                              )}
                            </div>
                            <div className="md:col-span-2 px-4 py-3 text-sm text-gray-600 md:text-center">
                              {item.quantity}개
                            </div>
                            <div className="md:col-span-2 px-4 py-3 text-sm text-gray-600 md:text-right">
                              {formatCurrency(item.price)}
                            </div>
                            <div className="md:col-span-2 px-4 py-3 text-sm font-semibold text-black md:text-right">
                              {formatCurrency(item.price * item.quantity)}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {order.paymentRecords.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">결제 정보</p>
                    <div className="space-y-2">
                      {order.paymentRecords.map((record) => (
                        <div
                          key={record.id}
                          className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2"
                        >
                          <span className="font-semibold text-black">{record.status}</span>
                          <span>{formatCurrency(record.amount)}</span>
                          {record.method && <span>결제수단: {record.method}</span>}
                          {record.impUid && <span>impUid: {record.impUid}</span>}
                          {record.merchantUid && <span>주문번호: {record.merchantUid}</span>}
                          <span className="text-gray-500">
                            {new Date(record.createdAt).toLocaleString('ko-KR')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            이전
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {page} / {totalPages}
            </span>
          </div>
          <button
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            다음
          </button>
        </div>
      )}
    </div>
  )
}

function AdminMyOrdersTab() {
  const [orders, setOrders] = useState<AdminMyOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const formatCurrency = useCallback((value: number) => `${value.toLocaleString()}원`, [])

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

      setOrders(Array.isArray(data.data) ? (data.data as AdminMyOrder[]) : [])
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

  return (
    <div>
      <h2 className="text-2xl font-bold text-black mb-6">내 주문내역</h2>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-black"></div>
            <p className="text-gray-600">주문 내역을 불러오는 중...</p>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-12 text-center text-gray-500 border border-dashed border-gray-300 rounded-lg">
          주문 내역이 없습니다.
        </div>
      ) : (
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
                      const optionLabels = parseOrderOptions(item.selectedOptions)
                      return (
                        <div
                          key={item.id}
                          className="flex flex-col md:flex-row md:items-center gap-4 border border-gray-200 rounded-lg p-4"
                        >
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
                          </div>
                          <div className="text-sm text-gray-600 md:text-right">
                            <p>단가: {formatCurrency(item.price)}</p>
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AdminCartTab() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isCartLoading, setIsCartLoading] = useState(true)
  const [cartError, setCartError] = useState('')
  const [cartMessage, setCartMessage] = useState('')
  const [cartMessageType, setCartMessageType] = useState<'success' | 'error'>('success')
  const [selectedCartIds, setSelectedCartIds] = useState<string[]>([])
  const [isDeletingCartItems, setIsDeletingCartItems] = useState(false)

  const formatCurrency = useCallback((price: number) => `${price.toLocaleString()}원`, [])

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

  useEffect(() => {
    fetchCartItems()
  }, [fetchCartItems])

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
    return selectedCartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
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

  return (
    <div>
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
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">장바구니가 비어있습니다</h3>
          <p className="text-gray-500 mb-6">원하는 상품을 장바구니에 담아보세요.</p>
          <Link
            href="/shop"
            className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
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
              const thumbnail = item.product?.images && item.product.images[0] ? item.product.images[0] : ''
              const isInactive = !item.product?.isActive

              return (
                <div
                  key={item.id}
                  className={`flex items-start gap-4 rounded-lg border p-4 transition-colors ${
                    isInactive ? 'border-red-200 bg-red-50/60' : 'border-gray-200 hover:border-black/40'
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
                      <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">No Image</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-semibold text-gray-900">{item.product?.name}</h3>
                    {item.product?.brand && <p className="mt-1 text-sm text-gray-500">{item.product.brand}</p>}
                    {optionList.length > 0 && (
                      <ul className="mt-3 space-y-1 text-sm text-gray-600">
                        {optionList.map((option) => (
                          <li key={`${item.id}-${option.name}-${option.label}`}>
                            {option.name}: <span className="font-medium text-black">{option.label}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <p className="mt-3 text-sm text-gray-500">수량 {item.quantity}개</p>
                    {isInactive && (
                      <p className="mt-2 text-sm font-medium text-red-500">판매 중단된 상품입니다. 주문할 수 없습니다.</p>
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
              <span className="text-lg font-bold text-black">{formatCurrency(selectedCartTotalAmount)}</span>
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
  )
}

function AdminArchiveTab({ user }: { user: any }) {
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            if (e.currentTarget.parentElement) {
                              e.currentTarget.parentElement.innerHTML = '<span class="flex items-center justify-center w-full h-full bg-[#f57520] text-white text-sm font-bold">GCS</span>'
                            }
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
                              if (e.currentTarget.parentElement) {
                                e.currentTarget.parentElement.innerHTML = '<span class="flex items-center justify-center w-full h-full bg-gray-300 text-gray-600 text-xs">No Image</span>'
                              }
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

// 사용자 관리 컴포넌트
function UserManagement() {
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  const usersPerPage = 10

  useEffect(() => {
    fetchUsers()
  }, [currentPage, searchTerm, roleFilter])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: usersPerPage.toString(),
        search: searchTerm,
        role: roleFilter
      })
      
      const response = await fetch(`/api/admin/users?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setUsers(data.data.users)
        setTotalPages(data.data.totalPages)
      }
    } catch (error) {
      console.error('사용자 목록 조회 오류:', error)
      setMessage('사용자 목록을 불러오는 중 오류가 발생했습니다.')
      setMessageType('error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    const targetUser = users.find(user => user.id === userId)
    if (!targetUser) {
      setMessage('사용자 정보를 찾을 수 없습니다.')
      setMessageType('error')
      return
    }

    try {
      const response = await fetch('/api/admin/users/role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role: newRole, isSeller: !!targetUser.isSeller })
      })

      const data = await response.json()
      
      if (data.success) {
        setMessage(data.message || '사용자 역할이 성공적으로 변경되었습니다.')
        setMessageType('success')
        fetchUsers() // 목록 새로고침
      } else {
        setMessage(data.error || '역할 변경 중 오류가 발생했습니다.')
        setMessageType('error')
      }
    } catch (error) {
      console.error('역할 변경 오류:', error)
      setMessage('서버 오류가 발생했습니다.')
      setMessageType('error')
    }
  }

  const handleSellerToggle = async (userId: string, newValue: boolean) => {
    const targetUser = users.find(user => user.id === userId)
    if (!targetUser) {
      setMessage('사용자 정보를 찾을 수 없습니다.')
      setMessageType('error')
      return
    }

    try {
      const response = await fetch('/api/admin/users/role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role: targetUser.role, isSeller: newValue })
      })

      const data = await response.json()

      if (data.success) {
        setMessage(newValue ? '판매자 권한이 활성화되었습니다.' : '판매자 권한이 해제되었습니다.')
        setMessageType('success')
        fetchUsers()
      } else {
        setMessage(data.error || '판매자 권한 변경 중 오류가 발생했습니다.')
        setMessageType('error')
      }
    } catch (error) {
      console.error('판매자 권한 변경 오류:', error)
      setMessage('서버 오류가 발생했습니다.')
      setMessageType('error')
    }
  }

  const getRoleLabel = (role: string, verificationStatus?: string) => {
    switch (role) {
      case 'ADMIN': return '관리자'
      case 'MAJOR': return '전공회원'
      case 'GENERAL': 
        return verificationStatus === 'REQUESTED' ? '일반회원 (인증 대기 중)' : '일반회원'
      default: return '비회원'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800'
      case 'MAJOR': return 'bg-purple-100 text-purple-800'
      case 'GENERAL': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-black mb-6">사용자 관리</h2>
      
      {/* 메시지 표시 */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          messageType === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message}
        </div>
      )}

      {/* 검색 및 필터 */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="이름, 이메일, 학번, 전공으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            />
          </div>
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            >
              <option value="ALL">모든 역할</option>
              <option value="ADMIN">관리자</option>
              <option value="MAJOR">전공회원</option>
              <option value="SELLER">판매자 권한</option>
              <option value="GENERAL">일반회원</option>
            </select>
          </div>
        </div>
      </div>

      {/* 사용자 목록 */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">사용자 목록을 불러오는 중...</p>
        </div>
      ) : users.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    사용자 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    역할
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    판매자 권한
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    인증 상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    가입일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-sm text-gray-500">
                          {user.studentId ? `학번: ${user.studentId}` : '학번: -'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.major ? `전공: ${user.major}` : '전공: -'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                          {getRoleLabel(user.role, user.verificationStatus)}
                        </span>
                        {user.isSeller && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            판매자 권한
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <button
                          type="button"
                          onClick={() => handleSellerToggle(user.id, !user.isSeller)}
                          className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black ${user.isSeller ? 'bg-green-500' : 'bg-gray-300'}`}
                          aria-pressed={user.isSeller}
                        >
                          <span className="sr-only">판매자 권한 토글</span>
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${user.isSeller ? 'translate-x-6' : 'translate-x-1'}`}
                          ></span>
                        </button>
                        <span className={`font-medium ${user.isSeller ? 'text-green-600' : 'text-gray-500'}`}>
                          {user.isSeller ? '활성화됨' : '비활성화'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.verificationStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        user.verificationStatus === 'REQUESTED' ? 'bg-yellow-100 text-yellow-800' :
                        user.verificationStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.verificationStatus === 'APPROVED' ? '승인됨' :
                         user.verificationStatus === 'REQUESTED' ? '대기중' :
                         user.verificationStatus === 'REJECTED' ? '거부됨' : '미요청'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                        >
                          <option value="GENERAL">일반회원</option>
                          <option value="MAJOR">전공회원</option>
                          <option value="ADMIN">관리자</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">등록된 사용자가 없습니다.</p>
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              이전
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 text-sm border rounded-lg ${
                  currentPage === page
                    ? 'bg-black text-white border-black'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              다음
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

