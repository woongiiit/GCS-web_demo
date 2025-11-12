'use client'

import { useCallback, useEffect, useState, useMemo } from 'react'

export function parseOrderOptions(selectedOptions: unknown): string[] {
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

export type AdminOrderItem = {
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

export type AdminOrder = {
  id: string
  status: string
  totalAmount: number
  shippingAddress: string
  phone: string
  notes?: string | null
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string | null
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

export function AdminOrdersTab() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
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

  const filteredOrders = useMemo(() => {
    if (!appliedSearch) return orders
    const keyword = appliedSearch.trim().toLowerCase()
    return orders.filter((order) =>
      order.orderItems.some((item) => item.product.name.toLowerCase().includes(keyword))
    )
  }, [orders, appliedSearch])

  const handleSearchSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setAppliedSearch(searchTerm)
    },
    [searchTerm]
  )

  const handleResetSearch = useCallback(() => {
    setSearchTerm('')
    setAppliedSearch('')
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

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
      ) : filteredOrders.length === 0 ? (
        <div className="py-12 text-center text-gray-500 border border-dashed border-gray-300 rounded-lg">
          표시할 주문 내역이 없습니다.
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
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
                      {order.orderItems.map((item) => (
                        <div key={item.id} className="flex flex-col md:grid md:grid-cols-12">
                          <div className="md:col-span-4 px-4 py-3">
                            <p className="font-medium text-gray-900">{item.product.name}</p>
                            {parseOrderOptions(item.selectedOptions).length > 0 && (
                              <ul className="mt-2 space-y-1 text-xs text-gray-500">
                                {parseOrderOptions(item.selectedOptions).map((label) => (
                                  <li key={`${item.id}-${label}`}>• {label}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                          <div className="md:col-span-2 px-4 py-3 text-sm text-gray-600 md:text-center">
                            {item.product.author?.name ?? '관리자'}
                            {item.product.author?.email && (
                              <div className="text-xs text-gray-400">{item.product.author.email}</div>
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
                      ))}
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
        <div className="flex justify-center mt-6">
          <div className="flex gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              이전
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => setPage(pageNumber)}
                className={`px-3 py-2 text-sm border rounded-lg ${
                  page === pageNumber ? 'bg-black text-white border-black' : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {pageNumber}
              </button>
            ))}
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
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

export function AdminUserManagementTab() {
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
    const targetUser = users.find((user) => user.id === userId)
    if (!targetUser) {
      setMessage('사용자 정보를 찾을 수 없습니다.')
      setMessageType('error')
      return
    }

    try {
      const response = await fetch('/api/admin/users/role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, role: newRole, isSeller: !!targetUser.isSeller })
      })

      const data = await response.json()

      if (data.success) {
        setMessage(data.message || '사용자 역할이 성공적으로 변경되었습니다.')
        setMessageType('success')
        fetchUsers()
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
    const targetUser = users.find((user) => user.id === userId)
    if (!targetUser) {
      setMessage('사용자 정보를 찾을 수 없습니다.')
      setMessageType('error')
      return
    }

    try {
      const response = await fetch('/api/admin/users/role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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
      case 'ADMIN':
        return '관리자'
      case 'MAJOR':
        return '전공회원'
      case 'GENERAL':
        return verificationStatus === 'REQUESTED' ? '일반회원 (인증 대기 중)' : '일반회원'
      default:
        return '비회원'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800'
      case 'MAJOR':
        return 'bg-purple-100 text-purple-800'
      case 'GENERAL':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-black mb-6">사용자 관리</h2>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            messageType === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message}
        </div>
      )}

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
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(
                            user.role
                          )}`}
                        >
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
                          className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black ${
                            user.isSeller ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                          aria-pressed={user.isSeller}
                        >
                          <span className="sr-only">판매자 권한 토글</span>
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                              user.isSeller ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          ></span>
                        </button>
                        <span className={`font-medium ${user.isSeller ? 'text-green-600' : 'text-gray-500'}`}>
                          {user.isSeller ? '활성화됨' : '비활성화'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.verificationStatus === 'APPROVED'
                            ? 'bg-green-100 text-green-800'
                            : user.verificationStatus === 'REQUESTED'
                            ? 'bg-yellow-100 text-yellow-800'
                            : user.verificationStatus === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {user.verificationStatus === 'APPROVED'
                          ? '승인됨'
                          : user.verificationStatus === 'REQUESTED'
                          ? '대기중'
                          : user.verificationStatus === 'REJECTED'
                          ? '거부됨'
                          : '미요청'}
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

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              이전
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 text-sm border rounded-lg ${
                  currentPage === page ? 'bg-black text-white border-black' : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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
