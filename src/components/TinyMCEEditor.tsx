'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'

interface RichTextEditorProps {
  value: string
  onChange: (content: string) => void
  placeholder?: string
  height?: number
  disabled?: boolean
}

// React Quill을 동적으로 임포트 (SSR 비활성화)
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <div className="w-full h-96 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
    <p className="text-gray-500">에디터 로딩 중...</p>
  </div>
})

export default function RichTextEditor({
  value,
  onChange,
  placeholder = '내용을 입력하세요...',
  height = 400,
  disabled = false
}: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false)
  const [internalValue, setInternalValue] = useState(value)

  useEffect(() => {
    setMounted(true)
  }, [])

  // value prop이 외부에서 변경될 때만 internalValue 업데이트
  useEffect(() => {
    setInternalValue(value)
  }, [value])

  const handleChange = (content: string) => {
    setInternalValue(content)
    onChange(content)
  }

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link', 'image'],
      ['clean']
    ]
  }

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'align',
    'list', 'bullet', 'indent',
    'link', 'image'
  ]

  if (!mounted) {
    return (
      <div className="w-full h-96 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">에디터 로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <ReactQuill
        theme="snow"
        value={internalValue}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={disabled}
        style={{ height: `${height}px` }}
      />
    </div>
  )
}
