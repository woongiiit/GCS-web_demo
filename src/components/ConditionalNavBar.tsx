'use client'

import { usePathname } from 'next/navigation'
import NavBar from './NavBar'

const HIDE_NAVBAR_PATHS = [
  '/login',
  '/signup',
  '/forgot-id',
  '/forgot-password',
]

export default function ConditionalNavBar() {
  const pathname = usePathname()
  
  // 인증 관련 페이지에서는 NavBar를 숨김
  if (HIDE_NAVBAR_PATHS.includes(pathname)) {
    return null
  }
  
  return <NavBar />
}

