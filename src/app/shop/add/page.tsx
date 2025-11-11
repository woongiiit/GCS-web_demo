'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePermissions } from '@/contexts/AuthContext'
import { permissions } from '@/lib/permissions'
import Link from 'next/link'
import RichTextEditor from '@/components/TinyMCEEditor'
import { PRODUCT_TYPES } from '@/lib/shop/product-types'

type ProductOptionValueInput = {
  id: string
  label: string
  priceAdjustment: string
}

type ProductOptionInput = {
  id: string
  name: string
  values: ProductOptionValueInput[]
}

export default function ShopAddPage() {
  const router = useRouter()
  const { role, isSeller } = usePermissions()
  const [formData, setFormData] = useState({
    type: 'FUND',
    name: '',
    description: '',
    shortDescription: '',
    price: '',
    originalPrice: '',
    discount: '',
    brand: '',
    fundingGoalAmount: '',
    fundingDeadline: '',
    stock: '',
  })
  const [customOptions, setCustomOptions] = useState<ProductOptionInput[]>([])
  // 상품 대표 이미지들 (상단 갤러리용)
  const [coverImages, setCoverImages] = useState<File[]>([])
  const [coverImagePreviews, setCoverImagePreviews] = useState<string[]>([])
  
  // React Quill 에디터 상태
  const [editorContent, setEditorContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  const selectedProductType = PRODUCT_TYPES.find((type) => type.id === formData.type) ?? PRODUCT_TYPES[0]

  // 상품 등록 권한이 없는 경우 접근 차단
  useEffect(() => {
    if (!permissions.canAddProduct(role, isSeller)) {
      router.push('/shop')
    }
  }, [role, isSeller, router])

  // 할인율 자동 계산
  useEffect(() => {
    if (formData.price && formData.originalPrice) {
      const price = parseInt(formData.price)
      const originalPrice = parseInt(formData.originalPrice)
      
      if (originalPrice > price && originalPrice > 0) {
        const discount = Math.round(((originalPrice - price) / originalPrice) * 100)
        setFormData(prev => ({
          ...prev,
          discount: discount.toString()
        }))
      } else {
        setFormData(prev => ({
          ...prev,
          discount: ''
        }))
      }
    } else {
      setFormData(prev => ({
        ...prev,
        discount: ''
      }))
    }
  }, [formData.price, formData.originalPrice])

  // 상품 대표 이미지 업로드
  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    
    const newImages = [...coverImages, ...files]
    setCoverImages(newImages)
    
    // 미리보기 생성
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverImagePreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  // 상품 대표 이미지 제거
  const removeCoverImage = (index: number) => {
    const newImages = coverImages.filter((_, i) => i !== index)
    const newPreviews = coverImagePreviews.filter((_, i) => i !== index)
    setCoverImages(newImages)
    setCoverImagePreviews(newPreviews)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // React Quill 에디터 핸들러
  const handleEditorChange = (content: string) => {
    setEditorContent(content)
    setFormData(prev => ({ ...prev, description: content }))
  }

  const createOptionId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID()
    }
    return `${Date.now()}-${Math.random()}`
  }

  const addOption = () => {
    setCustomOptions(prev => ([
      ...prev,
      {
        id: createOptionId(),
        name: '',
        values: [{
          id: createOptionId(),
          label: '',
          priceAdjustment: ''
        }]
      }
    ]))
  }

  const removeOption = (optionId: string) => {
    setCustomOptions(prev => prev.filter(option => option.id !== optionId))
  }

  const updateOptionName = (optionId: string, value: string) => {
    setCustomOptions(prev => prev.map(option => {
      if (option.id !== optionId) return option
      return {
        ...option,
        name: value
      }
    }))
  }

  const updateOptionValue = (optionId: string, valueIndex: number, field: 'label' | 'priceAdjustment', value: string) => {
    setCustomOptions(prev => prev.map(option => {
      if (option.id !== optionId) return option
      const newValues = option.values.map((optionValue, index) => {
        if (index !== valueIndex) return optionValue
        return {
          ...optionValue,
          [field]: value
        }
      })
      return {
        ...option,
        values: newValues
      }
    }))
  }

  const addOptionValue = (optionId: string) => {
    setCustomOptions(prev => prev.map(option => {
      if (option.id !== optionId) return option
      return {
        ...option,
        values: [
          ...option.values,
          {
            id: createOptionId(),
            label: '',
            priceAdjustment: ''
          }
        ]
      }
    }))
  }

  const removeOptionValue = (optionId: string, valueIndex: number) => {
    setCustomOptions(prev => prev.map(option => {
      if (option.id !== optionId) return option
      const newValues = option.values.filter((_, index) => index !== valueIndex)
      return {
        ...option,
        values: newValues.length > 0 ? newValues : [{
          id: createOptionId(),
          label: '',
          priceAdjustment: ''
        }]
      }
    }))
  }





  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      let hasIncompleteOption = false
      let hasInvalidPrice = false

      const sanitizedOptions = customOptions
        .map(option => {
          const trimmedName = option.name.trim()
          const sanitizedValues = option.values
            .map(value => {
              const label = value.label.trim()
              const priceText = value.priceAdjustment.trim()

              if (!label && !priceText) {
                return null
              }

              if (!label) {
                hasIncompleteOption = true
                return null
              }

              const parsedPrice = priceText === ''
                ? 0
                : Number(priceText.replace(/,/g, ''))

              if (Number.isNaN(parsedPrice)) {
                hasInvalidPrice = true
                return null
              }

              return {
                label,
                priceAdjustment: parsedPrice
              }
            })
            .filter((value): value is { label: string; priceAdjustment: number } => value !== null)

          if (!trimmedName && sanitizedValues.length === 0) {
            return null
          }

          if (!trimmedName && sanitizedValues.length > 0) {
            hasIncompleteOption = true
            return null
          }

          if (trimmedName && sanitizedValues.length === 0) {
            hasIncompleteOption = true
            return null
          }

          return {
            name: trimmedName,
            values: sanitizedValues
          }
        })
        .filter((option): option is { name: string; values: { label: string; priceAdjustment: number }[] } => option !== null)

      if (hasIncompleteOption) {
        setMessage('옵션을 추가하려면 옵션 이름과 선택지 이름을 모두 입력해주세요.')
        setMessageType('error')
        setIsSubmitting(false)
        return
      }

      if (hasInvalidPrice) {
        setMessage('가격 변동에는 숫자만 입력해주세요.')
        setMessageType('error')
        setIsSubmitting(false)
        return
      }

      const isFundType = formData.type === 'FUND'
      const isPartnerUpType = formData.type === 'PARTNER_UP'

      let parsedStock = 0
      if (isPartnerUpType) {
        if (formData.stock.trim() === '') {
          setMessage('재고 수량을 입력해주세요.')
          setMessageType('error')
          setIsSubmitting(false)
          return
        }

        parsedStock = parseInt(formData.stock, 10)

        if (Number.isNaN(parsedStock) || parsedStock < 0) {
          setMessage('재고 수량은 0 이상의 정수를 입력해주세요.')
          setMessageType('error')
          setIsSubmitting(false)
          return
        }
      }

      let parsedFundingGoal: number | null = null
      if (isFundType) {
        if (!formData.fundingGoalAmount.trim()) {
          setMessage('Fund 상품의 펀딩 목표 금액을 입력해주세요.')
          setMessageType('error')
          setIsSubmitting(false)
          return
        }

        parsedFundingGoal = parseInt(formData.fundingGoalAmount.replace(/,/g, ''), 10)
        if (Number.isNaN(parsedFundingGoal) || parsedFundingGoal <= 0) {
          setMessage('펀딩 목표 금액은 0보다 큰 숫자여야 합니다.')
          setMessageType('error')
          setIsSubmitting(false)
          return
        }
      } else if (formData.fundingGoalAmount.trim()) {
        parsedFundingGoal = parseInt(formData.fundingGoalAmount.replace(/,/g, ''), 10)
        if (Number.isNaN(parsedFundingGoal) || parsedFundingGoal < 0) {
          setMessage('펀딩 목표 금액은 0 이상의 숫자여야 합니다.')
          setMessageType('error')
          setIsSubmitting(false)
          return
        }
      }

      const fundingDeadlineValue = formData.fundingDeadline.trim()

      // 상품 대표 이미지들을 Base64로 인코딩
      const coverImagesBase64: string[] = []
      for (const file of coverImages) {
        const reader = new FileReader()
        const base64String = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => {
            resolve(reader.result as string)
          }
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
        coverImagesBase64.push(base64String)
      }

      const response = await fetch('/api/shop/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          shortDescription: formData.shortDescription,
          price: parseInt(formData.price),
          originalPrice: formData.originalPrice ? parseInt(formData.originalPrice) : null,
          discount: formData.discount ? parseInt(formData.discount) : null,
          type: formData.type,
          fundingGoalAmount: parsedFundingGoal,
          fundingDeadline: isFundType && fundingDeadlineValue ? fundingDeadlineValue : null,
          brand: formData.brand,
          options: sanitizedOptions,
          images: coverImagesBase64, // 상품 대표 이미지들
          stock: isPartnerUpType ? parsedStock : 0,
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('상품이 성공적으로 등록되었습니다.')
        setMessageType('success')
        setFormData({
          type: 'FUND',
          name: '',
          description: '',
          shortDescription: '',
          price: '',
          originalPrice: '',
          discount: '',
          brand: '',
          fundingGoalAmount: '',
          fundingDeadline: '',
          stock: '',
        })
        setEditorContent('')
        setCoverImages([])
        setCoverImagePreviews([])
        setCustomOptions([])
        
        // 성공 후 Shop 페이지로 이동
        setTimeout(() => {
          router.push('/shop')
        }, 1500)
      } else {
        setMessage(data.error || '상품 등록 중 오류가 발생했습니다.')
        setMessageType('error')
      }
    } catch (error) {
      console.error('상품 등록 오류:', error)
      setMessage('서버 오류가 발생했습니다. 다시 시도해주세요.')
      setMessageType('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!permissions.canAddProduct(role, isSeller)) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-white overflow-auto" style={{ overflowY: 'scroll' }}>
      <div className="relative min-h-screen bg-white">
        {/* 상단 검은색 영역 */}
        <div className="bg-black pt-32 pb-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-0">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">상품 등록</h1>
              <p className="text-white text-sm mb-8">새로운 상품을 등록하세요.</p>
              
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

        {/* 메인 컨텐츠 영역 */}
        <div className="bg-white min-h-screen">
          <div className="max-w-4xl mx-auto px-4 py-6 sm:px-0">
            <div className="bg-white px-4 py-8">
              
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
                {/* 상품 대표 이미지 */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-black mb-4">상품 대표 이미지</h3>
                  
                  <div className="space-y-4">
                    {/* 이미지 업로드 영역 */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleCoverImageUpload}
                        className="hidden"
                        id="cover-image-upload"
                      />
                      <label htmlFor="cover-image-upload" className="cursor-pointer">
                        <div className="text-gray-500 mb-2">
                          <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-600">
                          클릭하여 상품 대표 이미지들을 업로드하세요
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          여러 이미지를 선택할 수 있습니다 (JPG, PNG, GIF)
                        </p>
                      </label>
                    </div>

                    {/* 업로드된 이미지들 미리보기 */}
                    {coverImagePreviews.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {coverImagePreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`대표 이미지 ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeCoverImage(index)}
                              className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                            >
                              ×
                            </button>
                            <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                              대표 이미지
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 기본 정보 */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-black mb-4">기본 정보</h3>
                  
                  <div className="space-y-4">
                    {/* 상품 유형 */}
                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                        상품 유형 *
                      </label>
                      <select
                        id="type"
                        name="type"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                        value={formData.type}
                        onChange={handleInputChange}
                      >
                        {PRODUCT_TYPES.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                      <p className="mt-2 text-xs text-gray-500">
                        {selectedProductType.description}
                      </p>
                    </div>

                    {/* 상품명 */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        상품명 *
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="상품명을 입력하세요"
                      />
                    </div>

                    {/* 브랜드 / 프로젝트 */}
                    <div>
                      <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                        브랜드 / 프로젝트
                      </label>
                      <input
                        id="brand"
                        name="brand"
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                        value={formData.brand}
                        onChange={handleInputChange}
                        placeholder="브랜드 또는 프로젝트명을 입력하세요"
                      />
                    </div>

                    {/* 짧은 설명 */}
                    <div>
                      <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 mb-2">
                        짧은 설명
                      </label>
                      <input
                        id="shortDescription"
                        name="shortDescription"
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                        value={formData.shortDescription}
                        onChange={handleInputChange}
                        placeholder="한 줄 소개"
                      />
                    </div>

                    {formData.type === 'FUND' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="fundingGoalAmount" className="block text-sm font-medium text-gray-700 mb-2">
                            펀딩 목표 금액 *
                          </label>
                          <input
                            id="fundingGoalAmount"
                            name="fundingGoalAmount"
                            type="number"
                            min={1}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                            value={formData.fundingGoalAmount}
                            onChange={handleInputChange}
                            placeholder="예: 500000"
                          />
                          <p className="mt-2 text-xs text-gray-500">
                            펀딩이 목표 금액을 달성하면 자동 결제가 진행됩니다.
                          </p>
                        </div>
                        <div>
                          <label htmlFor="fundingDeadline" className="block text-sm font-medium text-gray-700 mb-2">
                            펀딩 마감일
                          </label>
                          <input
                            id="fundingDeadline"
                            name="fundingDeadline"
                            type="date"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                            value={formData.fundingDeadline}
                            onChange={handleInputChange}
                          />
                          <p className="mt-2 text-xs text-gray-500">
                            펀딩이 종료되는 날짜를 설정하세요. 설정하지 않으면 상시 펀딩으로 운영됩니다.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 상세 설명 */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-black mb-4">상세 설명</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      상세 설명 *
                    </label>
                    
                    <RichTextEditor
                      value={editorContent}
                      onChange={handleEditorChange}
                      placeholder="상품에 대한 자세한 설명을 입력하세요..."
                      height={300}
                    />
                  </div>
                </div>

                {/* 가격 정보 */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-black mb-4">가격 정보</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* 판매가 */}
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                        판매가 *
                      </label>
                      <input
                        id="price"
                        name="price"
                        type="number"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="25000"
                      />
                    </div>

                    {/* 정가 */}
                    <div>
                      <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-700 mb-2">
                        정가
                      </label>
                      <input
                        id="originalPrice"
                        name="originalPrice"
                        type="number"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                        value={formData.originalPrice}
                        onChange={handleInputChange}
                        placeholder="30000"
                      />
                    </div>

                    {/* 할인율 (자동 계산) */}
                    <div>
                      <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-2">
                        할인율 (%) - 자동 계산
                      </label>
                      <input
                        id="discount"
                        name="discount"
                        type="number"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                        value={formData.discount}
                        readOnly
                        placeholder="정가와 판매가를 입력하면 자동으로 계산됩니다"
                      />
                    </div>

                    {/* 재고 수량 */}
                    <div>
                      <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                        재고 수량 {formData.type === 'PARTNER_UP' ? '*' : ''}
                      </label>
                      <input
                        id="stock"
                        name="stock"
                        type="number"
                        min={0}
                        required={formData.type === 'PARTNER_UP'}
                        disabled={formData.type === 'FUND'}
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors ${formData.type === 'FUND' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        value={formData.stock}
                        onChange={handleInputChange}
                        placeholder={formData.type === 'PARTNER_UP' ? '재고 수량을 입력하세요' : 'Fund 상품은 재고를 관리하지 않습니다.'}
                      />
                      {formData.type === 'FUND' && (
                        <p className="mt-2 text-xs text-gray-500">
                          펀딩 상품은 재고를 선확보하지 않으며, 목표 달성 후 제작이 시작됩니다.
                        </p>
                      )}
                    </div>
                  </div>

                </div>

                {/* 상품 옵션 */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                    <h3 className="text-lg font-semibold text-black">상품 옵션</h3>
                    <button
                      type="button"
                      onClick={addOption}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <span>옵션 추가</span>
                    </button>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">
                    상품마다 필요한 옵션과 선택지를 자유롭게 추가해주세요. 예: 옵션 이름은 "색상", 선택지는 "블랙", "화이트" 등으로 입력할 수 있습니다.
                  </p>

                  <div className="space-y-4">
                    {customOptions.length === 0 && (
                      <div className="bg-white border border-dashed border-gray-300 rounded-lg px-4 py-6 text-center text-sm text-gray-500">
                        옵션이 필요하지 않다면 이 단계를 건너뛰어도 됩니다. 옵션이 필요한 경우 상단의 "옵션 추가" 버튼을 눌러주세요.
                      </div>
                    )}

                    {customOptions.map((option, optionIndex) => (
                      <div key={option.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              옵션명
                            </label>
                            <input
                              type="text"
                              value={option.name}
                              onChange={(e) => updateOptionName(option.id, e.target.value)}
                              placeholder={`예: 옵션 ${optionIndex + 1}`}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeOption(option.id)}
                            className="inline-flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            삭제
                          </button>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-sm font-medium text-gray-700">선택지</label>
                          <p className="text-xs text-gray-500">
                            선택지 이름과 가격 변동을 입력하세요. 가격 변동이 없으면 0 또는 빈 값으로 두세요. (예: +2000, -1000)
                          </p>
                          {option.values.map((value, valueIndex) => (
                            <div key={`${option.id}-value-${valueIndex}`} className="flex flex-col lg:flex-row gap-3">
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={value.label}
                                  onChange={(e) => updateOptionValue(option.id, valueIndex, 'label', e.target.value)}
                                  placeholder="선택지를 입력하세요 (예: 블랙)"
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                                />
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-600">가격 변동</span>
                                  <input
                                    type="number"
                                    value={value.priceAdjustment}
                                    onChange={(e) => updateOptionValue(option.id, valueIndex, 'priceAdjustment', e.target.value)}
                                    placeholder="0"
                                    className="w-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                                  />
                                  <span className="text-sm text-gray-600">원</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeOptionValue(option.id, valueIndex)}
                                  className="inline-flex items-center justify-center px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                  disabled={option.values.length === 1}
                                >
                                  제거
                                </button>
                              </div>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() => addOptionValue(option.id)}
                            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            선택지 추가
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 버튼들 */}
                <div className="flex space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => router.push('/shop')}
                    className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 py-3 px-6 rounded-lg font-medium text-white transition-colors ${
                      isSubmitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2'
                    }`}
                  >
                    {isSubmitting ? '등록 중...' : '상품 등록'}
                  </button>
                </div>
              </form>
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

