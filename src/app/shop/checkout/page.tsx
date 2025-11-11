'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import {
  calculateUnitPrice,
  normalizeProductOptions,
  validateSelectedOptions,
  type NormalizedProductOption,
  type NormalizedOptionValueWithName,
  type SelectedOptionInput
} from '@/lib/shop/options'

type CheckoutMode = 'cart' | 'direct'

type CheckoutPayload =
  | {
      mode: 'cart'
      cartItemIds: string[]
    }
  | {
      mode: 'direct'
      productId: string
      quantity: number
      selectedOptions?: SelectedOptionInput[]
    }

type CartApiItem = {
  id: string
  productId: string
  quantity: number
  unitPrice: number
  selectedOptions?: NormalizedOptionValueWithName[] | null
  product: {
    id: string
    name: string
    price: number
    images: string[]
    brand?: string | null
    isActive: boolean
  }
}

type CheckoutItem = {
  key: string
  source: CheckoutMode
  productId: string
  name: string
  brand?: string | null
  image?: string
  quantity: number
  unitPrice: number
  selectedOptions: NormalizedOptionValueWithName[]
}

type PortOneResponse = {
  success: boolean
  imp_uid: string
  merchant_uid: string
  paid_amount: number
  pay_method: string
  card_name?: string
  buyer_name?: string
  buyer_email?: string
  buyer_tel?: string
  receipt_url?: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { user, isLoading: isAuthLoading } = useAuth()

  const [mode, setMode] = useState<CheckoutMode>('cart')
  const [items, setItems] = useState<CheckoutItem[]>([])
  const [payloadReady, setPayloadReady] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [shippingAddress, setShippingAddress] = useState('')
  const [buyerName, setBuyerName] = useState('')
  const [buyerEmail, setBuyerEmail] = useState('')
  const [buyerPhone, setBuyerPhone] = useState('')
  const [orderMemo, setOrderMemo] = useState('')
  const [isPaying, setIsPaying] = useState(false)
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setBuyerName(user.name || '')
      setBuyerEmail(user.email || '')
      setBuyerPhone(user.phone || '')
    }
  }, [user])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const raw = window.sessionStorage.getItem('gcs_checkout_payload')
    if (!raw) {
      setError('결제할 상품 정보가 없습니다.')
      setLoading(false)
      return
    }

    try {
      const parsed = JSON.parse(raw)
      if (parsed && parsed.mode === 'cart' && Array.isArray(parsed.cartItemIds) && parsed.cartItemIds.length > 0) {
        setMode('cart')
        loadCartItems(parsed.cartItemIds)
      } else if (
        parsed &&
        parsed.mode === 'direct' &&
        typeof parsed.productId === 'string' &&
        parsed.productId.length > 0 &&
        typeof parsed.quantity === 'number' &&
        parsed.quantity > 0
      ) {
        setMode('direct')
        loadDirectItem(parsed.productId, parsed.quantity, parsed.selectedOptions)
      } else {
        setError('유효하지 않은 결제 정보입니다.')
        setLoading(false)
      }
    } catch (parseError) {
      console.error('결제 정보 파싱 오류:', parseError)
      setError('결제 정보 확인 중 오류가 발생했습니다.')
      setLoading(false)
    } finally {
      setPayloadReady(true)
    }
  }, [])

  useEffect(() => {
    if (!isAuthLoading && !user && payloadReady) {
      alert('로그인이 필요합니다.')
      router.replace('/login')
    }
  }, [isAuthLoading, payloadReady, router, user])

  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  }, [items])

  const mainProductName = useMemo(() => {
    if (items.length === 0) return ''
    if (items.length === 1) return items[0].name
    return `${items[0].name} 외 ${items.length - 1}건`
  }, [items])

  const handlePayment = async () => {
    if (!user) {
      alert('로그인이 필요합니다.')
      router.push('/login')
      return
    }

    if (!shippingAddress.trim()) {
      setError('배송지를 입력해주세요.')
      return
    }

    if (!buyerPhone.trim()) {
      setError('연락처를 입력해주세요.')
      return
    }

    if (items.length === 0) {
      setError('결제할 상품이 없습니다.')
      return
    }

    setError('')
    setIsPaying(true)

    try {
      const IMP = await loadPortOne()
      if (!IMP) {
        throw new Error('결제 모듈을 로드하지 못했습니다.')
      }

      const merchantUid =
        window.crypto?.randomUUID?.() ??
        `gcs-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const amount = totalAmount
      const merchantCode = process.env.NEXT_PUBLIC_PORTONE_MERCHANT_CODE || 'imp10391932'

      IMP.init(merchantCode)

      const paymentParams = {
        pg: 'html5_inicis.INIpayTest',
        pay_method: 'card',
        merchant_uid: merchantUid,
        name: mainProductName,
        amount,
        buyer_name: buyerName,
        buyer_email: buyerEmail,
        buyer_tel: buyerPhone,
        buyer_addr: shippingAddress
      }

      IMP.request_pay(paymentParams, async (rsp: PortOneResponse) => {
        if (!rsp.success) {
          setIsPaying(false)
          setError('결제가 취소되거나 실패했습니다. 다시 시도해주세요.')
          return
        }

        try {
          const response = await fetch('/api/shop/purchase', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
              cartItemIds: mode === 'cart' ? items.map((item) => item.key) : undefined,
              items:
                mode === 'direct'
                  ? items.map((item) => ({
                      productId: item.productId,
                      quantity: item.quantity,
                      selectedOptions: item.selectedOptions.map(({ name, label }) => ({
                        name,
                        label
                      }))
                    }))
                  : undefined,
              shippingAddress: shippingAddress.trim(),
              phone: buyerPhone.trim(),
              notes: orderMemo.trim() || undefined,
              payment: {
                impUid: rsp.imp_uid,
                merchantUid: rsp.merchant_uid,
                amount: rsp.paid_amount,
                payMethod: rsp.pay_method,
                cardName: rsp.card_name,
                buyerName: rsp.buyer_name,
                buyerEmail: rsp.buyer_email,
                buyerTel: rsp.buyer_tel,
                receiptUrl: rsp.receipt_url
              }
            })
          })

          const data = await response.json()
          if (!response.ok || !data.success) {
            setError(data.error || '주문 처리 중 오류가 발생했습니다.')
          } else {
            setSuccessOrderId(data.data?.id ?? null)
            window.sessionStorage.removeItem('gcs_checkout_payload')
          }
        } catch (purchaseError) {
          console.error('주문 처리 오류:', purchaseError)
          setError('주문 처리 중 오류가 발생했습니다.')
        } finally {
          setIsPaying(false)
        }
      })
    } catch (paymentError) {
      console.error('결제 요청 오류:', paymentError)
      setError(
        paymentError instanceof Error ? paymentError.message : '결제 준비 중 오류가 발생했습니다.'
      )
      setIsPaying(false)
    }
  }

  const handleBackToShop = () => {
    router.push(mode === 'cart' ? '/mypage?tab=cart' : '/shop')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">결제 정보를 불러오는 중입니다...</p>
        </div>
      </div>
    )
  }

  if (error && items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">결제를 진행할 수 없습니다.</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleBackToShop}
            className="inline-flex items-center justify-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-black text-white pt-32 pb-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">Checkout</h1>
            <p className="text-sm">
              안전한 결제를 위해 PG 연동 테스트 모드로 결제가 진행됩니다.
            </p>
            <div className="mt-6">
              <Link href="/" className="inline-block text-white hover:text-gray-300">
                홈으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-10">
        {successOrderId ? (
          <SuccessPanel orderId={successOrderId} onClose={handleBackToShop} />
        ) : (
          <>
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <CheckoutItemsPanel items={items} />
                <ShippingForm
                  buyerName={buyerName}
                  buyerEmail={buyerEmail}
                  buyerPhone={buyerPhone}
                  shippingAddress={shippingAddress}
                  orderMemo={orderMemo}
                  onBuyerNameChange={setBuyerName}
                  onBuyerEmailChange={setBuyerEmail}
                  onBuyerPhoneChange={setBuyerPhone}
                  onShippingAddressChange={setShippingAddress}
                  onOrderMemoChange={setOrderMemo}
                />
              </div>
              <aside>
                <OrderSummary
                  totalAmount={totalAmount}
                  items={items}
                  error={error}
                  isPaying={isPaying}
                  onPay={handlePayment}
                />
                <button
                  onClick={handleBackToShop}
                  className="w-full mt-4 border border-gray-300 text-gray-600 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  이전 화면으로 돌아가기
                </button>
              </aside>
            </section>
          </>
        )}
      </div>
    </div>
  )

  async function loadCartItems(cartItemIds: string[]) {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/shop/cart', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store'
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.error || '장바구니 정보를 불러오지 못했습니다.')
        setItems([])
        return
      }

      const cartItems: CartApiItem[] = Array.isArray(data.data) ? data.data : []
      const filtered = cartItems.filter((item) => cartItemIds.includes(item.id))

      if (filtered.length === 0) {
        setError('선택한 장바구니 상품을 찾을 수 없습니다.')
        setItems([])
        return
      }

      const inactiveItem = filtered.find((item) => !item.product?.isActive)
      if (inactiveItem) {
        setError(`판매 중단된 상품이 포함되어 있어 결제를 진행할 수 없습니다.`)
        setItems([])
        return
      }

      const checkoutItems: CheckoutItem[] = filtered.map((item) => ({
        key: item.id,
        source: 'cart',
        productId: item.productId,
        name: item.product.name,
        brand: item.product.brand,
        image: item.product.images?.[0],
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        selectedOptions: Array.isArray(item.selectedOptions) ? item.selectedOptions : []
      }))

      setItems(checkoutItems)
    } catch (cartError) {
      console.error('장바구니 로드 오류:', cartError)
      setError('장바구니 정보를 불러오는 중 오류가 발생했습니다.')
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  async function loadDirectItem(
    productId: string,
    quantity: number,
    selectedOptions?: SelectedOptionInput[]
  ) {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/shop/products/${productId}`, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store'
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.error || '상품 정보를 불러오지 못했습니다.')
        setItems([])
        return
      }

      const product = data.data?.product
      if (!product) {
        setError('상품 정보를 찾을 수 없습니다.')
        setItems([])
        return
      }

      if (!product.isActive) {
        setError('판매 중단된 상품은 결제할 수 없습니다.')
        setItems([])
        return
      }

      if (typeof product.stock === 'number' && product.stock < quantity) {
        setError('재고가 부족하여 결제를 진행할 수 없습니다.')
        setItems([])
        return
      }

      const normalizedOptions: NormalizedProductOption[] = normalizeProductOptions(
        product.options
      )
      const { normalizedSelectedOptions } = validateSelectedOptions(
        normalizedOptions,
        selectedOptions
      )

      if (
        normalizedOptions.length > 0 &&
        normalizedSelectedOptions.length !== normalizedOptions.length
      ) {
        setError('모든 옵션을 선택한 뒤 다시 시도해주세요.')
        setItems([])
        return
      }

      const unitPrice = calculateUnitPrice(product.price, normalizedSelectedOptions)

      setItems([
        {
          key: productId,
          source: 'direct',
          productId,
          name: product.name,
          brand: product.brand,
          image: product.images?.[0],
          quantity,
          unitPrice,
          selectedOptions: normalizedSelectedOptions
        }
      ])
    } catch (directError) {
      console.error('바로구매 상품 로드 오류:', directError)
      setError('상품 정보를 불러오는 중 오류가 발생했습니다.')
      setItems([])
    } finally {
      setLoading(false)
    }
  }
}

function CheckoutItemsPanel({ items }: { items: CheckoutItem[] }) {
  if (items.length === 0) {
    return (
      <div className="border border-gray-200 rounded-lg p-6">
        <p className="text-gray-600">결제할 상품이 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6 space-y-4">
      <h2 className="text-xl font-semibold text-black">주문 상품</h2>
      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item.key} className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
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
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-black truncate">{item.name}</h3>
                <span className="text-sm text-gray-500">수량 {item.quantity}개</span>
              </div>
              {item.brand && (
                <p className="text-sm text-gray-500 mt-1">{item.brand}</p>
              )}
              {item.selectedOptions.length > 0 && (
                <ul className="mt-2 space-y-1 text-sm text-gray-600">
                  {item.selectedOptions.map((option) => (
                    <li key={`${item.key}-${option.name}-${option.label}`}>
                      {option.name}:{' '}
                      <span className="font-medium text-black">{option.label}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-3 text-sm text-gray-700">
                <span className="font-medium text-black">
                  {(item.unitPrice * item.quantity).toLocaleString()}원
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ShippingForm(props: {
  buyerName: string
  buyerEmail: string
  buyerPhone: string
  shippingAddress: string
  orderMemo: string
  onBuyerNameChange: (value: string) => void
  onBuyerEmailChange: (value: string) => void
  onBuyerPhoneChange: (value: string) => void
  onShippingAddressChange: (value: string) => void
  onOrderMemoChange: (value: string) => void
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-6 space-y-6">
      <h2 className="text-xl font-semibold text-black">배송지 정보</h2>
      <div className="space-y-4">
        <FormField
          label="받는 분 성함"
          required
          value={props.buyerName}
          onChange={props.onBuyerNameChange}
          placeholder="받는 분 성함을 입력해주세요."
        />
        <FormField
          label="연락처"
          required
          value={props.buyerPhone}
          onChange={props.onBuyerPhoneChange}
          placeholder="연락 가능한 전화번호를 입력해주세요."
        />
        <FormField
          label="이메일"
          value={props.buyerEmail}
          onChange={props.onBuyerEmailChange}
          placeholder="주문 확인용 이메일을 입력해주세요."
          type="email"
        />
        <FormField
          label="배송지 주소"
          required
          value={props.shippingAddress}
          onChange={props.onShippingAddressChange}
          placeholder="배송지를 입력해주세요."
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            요청사항 (선택)
          </label>
          <textarea
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black resize-none"
            rows={3}
            value={props.orderMemo}
            onChange={(e) => props.onOrderMemoChange(e.target.value)}
            placeholder="배송 관련 요청사항이 있다면 입력해주세요."
          />
        </div>
      </div>
    </div>
  )
}

function FormField({
  label,
  required,
  value,
  onChange,
  placeholder,
  type = 'text'
}: {
  label: string
  required?: boolean
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black"
        placeholder={placeholder}
      />
    </div>
  )
}

function OrderSummary({
  totalAmount,
  items,
  error,
  isPaying,
  onPay
}: {
  totalAmount: number
  items: CheckoutItem[]
  error: string
  isPaying: boolean
  onPay: () => void
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-6 space-y-4">
      <h2 className="text-xl font-semibold text-black">결제 금액</h2>
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>상품 금액</span>
        <span>{totalAmount.toLocaleString()}원</span>
      </div>
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>배송비</span>
        <span>0원</span>
      </div>
      <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
        <span className="text-base font-semibold text-black">총 결제 금액</span>
        <span className="text-2xl font-bold text-black">{totalAmount.toLocaleString()}원</span>
      </div>
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </div>
      )}
      <button
        onClick={onPay}
        disabled={items.length === 0 || isPaying}
        className={`w-full py-3 rounded-lg text-white font-medium transition-colors ${
          items.length === 0 || isPaying
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-black hover:bg-gray-800'
        }`}
      >
        {isPaying ? '결제 진행 중...' : '결제하기'}
      </button>
      <p className="text-xs text-gray-500">
        현재 테스트 결제 환경입니다. 실 결제 전에는 PG사의 실제 API Key로 교체해야 합니다.
      </p>
    </div>
  )
}

function SuccessPanel({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  return (
    <div className="border border-green-200 bg-green-50 rounded-lg p-8 text-center space-y-4">
      <div className="mx-auto w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-green-700">결제가 완료되었습니다!</h2>
      <p className="text-sm text-green-700">
        주문 번호 <span className="font-semibold">{orderId}</span>에 대한 결제가 성공적으로 완료되었습니다.
      </p>
      <p className="text-xs text-green-700">
        주문 상세는 운영자 확인 절차 후 별도로 안내드릴 예정입니다.
      </p>
      <button
        onClick={onClose}
        className="inline-flex items-center justify-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
      >
        확인
      </button>
    </div>
  )
}

let portOneLoader: Promise<typeof window.IMP | null> | null = null

async function loadPortOne(): Promise<typeof window.IMP | null> {
  if (typeof window === 'undefined') return null
  if (window.IMP) return window.IMP

  if (!portOneLoader) {
    portOneLoader = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://cdn.iamport.kr/v1/iamport.js'
      script.onload = () => {
        resolve(window.IMP ?? null)
      }
      script.onerror = () => {
        portOneLoader = null
        reject(new Error('PortOne 스크립트를 불러오지 못했습니다.'))
      }
      document.body.appendChild(script)
    })
  }

  return portOneLoader
}

