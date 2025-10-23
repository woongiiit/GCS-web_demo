'use client'

import { Editor } from '@tinymce/tinymce-react'
import { useRef } from 'react'

interface TinyMCEEditorProps {
  value: string
  onChange: (content: string) => void
  placeholder?: string
  height?: number
  disabled?: boolean
}

export default function TinyMCEEditor({
  value,
  onChange,
  placeholder = '내용을 입력하세요...',
  height = 400,
  disabled = false
}: TinyMCEEditorProps) {
  const editorRef = useRef<any>(null)

  const handleEditorChange = (content: string) => {
    onChange(content)
  }

  return (
    <div className="w-full">
      <Editor
        onInit={(evt, editor) => editorRef.current = editor}
        value={value}
        onEditorChange={handleEditorChange}
        disabled={disabled}
        init={{
          height: height,
          menubar: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help',
          content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; font-size: 14px; }',
          placeholder: placeholder,
          branding: false,
          promotion: false,
          statusbar: false,
          resize: false,
          elementpath: false,
          setup: (editor) => {
            editor.on('init', () => {
              editor.getContainer().style.border = '1px solid #d1d5db'
              editor.getContainer().style.borderRadius = '0.5rem'
            })
          }
        }}
      />
    </div>
  )
}
