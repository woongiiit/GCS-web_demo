'use client'

import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import RichTextEditor from '@/components/TinyMCEEditor'
import { useAuth } from '@/contexts/AuthContext'
import { permissions } from '@/lib/permissions'

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

export default function ProductEditPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading: isAuthLoading } = useAuth()
  const productId = params.id as string

  const [product, setProduct] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    price: '',
    originalPrice: '',
    discount: '',
    categoryId: '',
    brand: '',
    stock: '',
  })
  const [customOptions, setCustomOptions] = useState<ProductOptionInput[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])
  const [editorContent, setEditorContent] = useState('')
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (productId) {
      fetchProduct()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId])

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user) {
        router.push('/login')
        return
      }

      if (product && !permissions.canEditProduct(user.role, user.isSeller, product.authorId, user.id)) {
        router.push(`/shop/${productId}`)
      }
    }
  }, [isAuthLoading, user, product, router, productId])

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

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/shop/categories', { cache: 'no-store' })
      const data = await response.json()

      if (data.success && Array.isArray(data.data)) {
        setCategories(data.data)
      } else {
        setCategories([])
      }
    } catch (error) {
      console.error('카테고리 조회 오류:', error)
      setCategories([])
    }
  }

  const fetchProduct = async () => {
    setIsPageLoading(true)
    try {
      const response = await fetch(`/api/shop/products/${productId}`, { cache: 'no-store' })
      if (!response.ok) {
        if (response.status === 404) {
          setMessage('상품을 찾을 수 없습니다.')
          setMessageType('error')
          setProduct(null)
        }
        setIsPageLoading(false)
        return
      }

      const data = await response.json()
      if (data.success) {
        const fetchedProduct = data.data.product
        setProduct(fetchedProduct)
        setFormData({
          name: fetchedProduct.name || '',
          description: fetchedProduct.description || '',
          shortDescription: fetchedProduct.shortDescription || '',
          price: fetchedProduct.price ? fetchedProduct.price.toString() : '',
          originalPrice: fetchedProduct.originalPrice ? fetchedProduct.originalPrice.toString() : '',
          discount: fetchedProduct.discount ? fetchedProduct.discount.toString() : '',
          categoryId: fetchedProduct.categoryId || '',
          brand: fetchedProduct.brand || '',
          stock: typeof fetchedProduct.stock === 'number' ? fetchedProduct.stock.toString() : '',
        })
        setEditorContent(fetchedProduct.description || '')
        setExistingImages(Array.isArray(fetchedProduct.images) ? fetchedProduct.images : [])

        if (Array.isArray(fetchedProduct.options) && fetchedProduct.options.length > 0) {
          setCustomOptions(
            fetchedProduct.options.map((option: any) => {
              const normalizedValues = Array.isArray(option.values)
                ? (option.values as any[])
                    .map((value: any) => {
                      if (typeof value === 'string') {
                        const label = value.trim()
                        if (!label) return null
                        return {
                          id: createOptionId(),
                          label,
                          priceAdjustment: '0'
                        }
                      }

                      if (!value || typeof value !== 'object') return null

                      const label = typeof value.label === 'string' ? value.label.trim() : ''
                      if (!label) return null

                      const rawPrice = value.priceAdjustment
                      let priceAdjustment = '0'

                      if (typeof rawPrice === 'number') {
                        priceAdjustment = rawPrice.toString()
                      } else if (typeof rawPrice === 'string') {
                        priceAdjustment = rawPrice.trim() || '0'
                      }

                      return {
                        id: createOptionId(),
                        label,
                        priceAdjustment
                      }
                    })
                    .filter((value): value is ProductOptionValueInput => value !== null)
                : []

              return {
                id: createOptionId(),
                name: option.name || '',
                values: normalizedValues.length > 0
                  ? normalizedValues
                  : [{
                      id: createOptionId(),
                      label: '',
                      priceAdjustment: ''
                    }]
              }
            })
          )
        } else {
          setCustomOptions([])
        }
      } else {
        setMessage(data.error || '상품 정보를 불러오지 못했습니다.')
        setMessageType('error')
        setProduct(null)
      }
    } catch (error) {
      console.error('상품 조회 오류:', error)
      setMessage('상품 정보를 불러오는 중 오류가 발생했습니다.')
      setMessageType('error')
      setProduct(null)
    } finally {
      setIsPageLoading(false)
    }
  }

  const createOptionId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID()
    }
    return `${Date.now()}-${Math.random()}`
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleEditorChange = (content: string) => {
    setEditorContent(content)
    setFormData(prev => ({ ...prev, description: content }))
  }

  const handleCoverImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const newFiles = [...newImages, ...files]
    setNewImages(newFiles)

    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewImagePreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index))
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index))
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

  const handleSubmit = async (e: FormEvent) => {
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

      const newImagesBase64: string[] = []
      for (const file of newImages) {
        const reader = new FileReader()
        const base64String = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => {
            resolve(reader.result as string)
          }
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
        newImagesBase64.push(base64String)
      }

      if (formData.stock.trim() === '') {
        setMessage('재고 수량을 입력해주세요.')
        setMessageType('error')
        setIsSubmitting(false)
        return
      }

      const parsedStock = parseInt(formData.stock, 10)

      if (Number.isNaN(parsedStock) || parsedStock < 0) {
        setMessage('재고 수량은 0 이상의 정수를 입력해주세요.')
        setMessageType('error')
        setIsSubmitting(false)
        return
      }

      const response = await fetch(`/api/shop/products/${productId}`, {
        method: 'PATCH',
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
          categoryId: formData.categoryId,
          brand: formData.brand,
          options: sanitizedOptions,
          images: [...existingImages, ...newImagesBase64],
          stock: parsedStock,
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('상품이 성공적으로 수정되었습니다.')
        setMessageType('success')
        setNewImages([])
        setNewImagePreviews([])
        setTimeout(() => {
          router.push(`/shop/${productId}`)
        }, 1500)
      } else {
        setMessage(data.error || '상품 수정 중 오류가 발생했습니다.')
        setMessageType('error')
      }
    } catch (error) {
      console.error('상품 수정 오류:', error)
      setMessage('서버 오류가 발생했습니다. 다시 시도해주세요.')
      setMessageType('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isAuthLoading || isPageLoading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{message || '상품을 찾을 수 없습니다.'}</p>
          <Link href="/shop" className="text-black underline hover:text-gray-600">
            Shop으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  if (!user || !permissions.canEditProduct(user.role, user.isSeller, product.authorId, user.id)) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-white overflow-auto" style={{ overflowY: 'scroll' }}>
      <div className="relative min-h-screen bg-white">
        <div className="bg-black pt-32 pb-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-0">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">상품 수정</h1>
              <p className="text-white text-sm mb-8">등록한 상품 정보를 수정하세요.</p>

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
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-black mb-4">상품 대표 이미지</h3>

                  <div className="space-y-6">
                    {existingImages.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-3">등록된 대표 이미지</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {existingImages.map((image, index) => (
                            <div key={`${image}-${index}`} className="relative">
                              <img
                                src={image}
                                alt={`등록된 대표 이미지 ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => removeExistingImage(index)}
                                className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

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
                          클릭하여 상품 대표 이미지를 추가 업로드하세요
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          여러 이미지를 선택할 수 있습니다 (JPG, PNG, GIF)
                        </p>
                      </label>
                    </div>

                    {newImagePreviews.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-3">추가 예정 이미지</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {newImagePreviews.map((preview, index) => (
                            <div key={`new-${index}`} className="relative">
                              <img
                                src={preview}
                                alt={`새 대표 이미지 ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => removeNewImage(index)}
                                className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                              >
                                ×
                              </button>
                              <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                                신규 이미지
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-black mb-4">기본 정보</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">상품명 *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                        placeholder="상품명을 입력하세요"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">판매가 (원) *</label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                        min="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                        placeholder="판매가를 입력하세요"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">정가 (원)</label>
                      <input
                        type="number"
                        name="originalPrice"
                        value={formData.originalPrice}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                        placeholder="정가를 입력하세요"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">할인율 (%)</label>
                      <input
                        type="number"
                        name="discount"
                        value={formData.discount}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                        placeholder="할인율을 입력하세요"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">재고 수량 *</label>
                      <input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleInputChange}
                        required
                        min="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                        placeholder="재고 수량을 입력하세요"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">브랜드</label>
                      <input
                        type="text"
                        name="brand"
                        value={formData.brand}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                        placeholder="브랜드명을 입력하세요"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">카테고리 *</label>
                      <select
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors bg-white"
                      >
                        <option value="">카테고리를 선택하세요</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-black mb-4">상품 설명</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">짧은 설명</label>
                      <textarea
                        name="shortDescription"
                        value={formData.shortDescription}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                        placeholder="상품의 주요 특징을 간단히 작성하세요"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">상세 설명 *</label>
                      <div className="border border-gray-200 rounded-lg">
                        <RichTextEditor
                          value={editorContent}
                          onChange={handleEditorChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-black">상품 옵션</h3>
                    <button
                      type="button"
                      onClick={addOption}
                      className="px-4 py-2 text-sm font-medium border border-black text-black rounded hover:bg-gray-50 transition-colors"
                    >
                      옵션 추가
                    </button>
                  </div>

                  {customOptions.length > 0 ? (
                    <div className="space-y-4">
                      {customOptions.map(option => (
                        <div key={option.id} className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-3">
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-700 mb-2">옵션 이름</label>
                              <input
                                type="text"
                                value={option.name}
                                onChange={(e) => updateOptionName(option.id, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                                placeholder="예: 색상, 사이즈"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeOption(option.id)}
                              className="text-sm text-red-500 hover:text-red-600"
                            >
                              옵션 삭제
                            </button>
                          </div>

                          <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">옵션 선택지</label>
                            <p className="text-xs text-gray-500">
                              선택지 이름과 가격 변동을 입력하세요. 가격 변동이 없으면 0 또는 빈 값으로 두세요. (예: +2000, -1000)
                            </p>
                            {option.values.map((value, index) => (
                              <div key={`${option.id}-value-${index}`} className="flex flex-col lg:flex-row gap-3">
                                <div className="flex-1">
                                  <input
                                    type="text"
                                    value={value.label}
                                    onChange={(e) => updateOptionValue(option.id, index, 'label', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                                    placeholder="옵션 값을 입력하세요"
                                  />
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">가격 변동</span>
                                    <input
                                      type="number"
                                      value={value.priceAdjustment}
                                      onChange={(e) => updateOptionValue(option.id, index, 'priceAdjustment', e.target.value)}
                                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                                      placeholder="0"
                                    />
                                    <span className="text-sm text-gray-600">원</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeOptionValue(option.id, index)}
                                    className="px-3 py-2 text-sm text-red-500 border border-red-200 rounded hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                    disabled={option.values.length === 1}
                                  >
                                    삭제
                                  </button>
                                </div>
                              </div>
                            ))}

                            <button
                              type="button"
                              onClick={() => addOptionValue(option.id)}
                              className="px-3 py-2 text-sm font-medium border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                            >
                              선택지 추가
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">추가된 옵션이 없습니다. 옵션이 필요한 경우 위의 옵션 추가 버튼을 클릭하세요.</p>
                  )}
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-4 px-6 rounded-lg font-medium text-white transition-colors ${
                      isSubmitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2'
                    }`}
                  >
                    {isSubmitting ? '저장 중...' : '수정 내용 저장'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="bg-white py-6 border-t border-gray-200">
          <div className="px-4 flex justify-between items-start gap-4">
            <div className="flex-shrink-0">
              <p className="text-[10px] text-gray-500 mb-0.5">DONGGUK UNIVERSITY</p>
              <h3 className="text-sm font-bold text-black">
                GCS<span className="text-[#f57520]">:</span>Web
              </h3>
            </div>

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

