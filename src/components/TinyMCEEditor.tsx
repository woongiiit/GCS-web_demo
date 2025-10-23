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

  useEffect(() => {
    setMounted(true)
  }, [])

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
    ],
    // 이미지 정렬을 위한 커스텀 핸들러
    handlers: {
      image: function() {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = () => {
          const files = input.files;
          if (files && files.length > 0) {
            const file = files[0];
            const reader = new FileReader();
            reader.onload = () => {
              const quill = this.quill;
              const range = quill.getSelection();
              if (range) {
                // 이미지를 가운데 정렬로 삽입
                quill.insertEmbed(range.index, 'image', reader.result, 'user');
                quill.formatLine(range.index, 1, 'align', 'center');
              }
            };
            reader.readAsDataURL(file);
          }
        };
      }
    }
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
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={disabled}
        style={{ height: `${height}px` }}
      />
    </div>
  )
}
