'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { UserRole, VerificationStatus } from '@/lib/permissions'

interface User {
  id: string
  email: string
  name: string
  studentId: string
  major: string
  phone: string
  role: UserRole
  verificationStatus?: VerificationStatus
  verificationImageUrl?: string
  verificationRequestedAt?: string
  verificationApprovedAt?: string
  verificationRejectedAt?: string
  verificationNote?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 컴포넌트 마운트 시 사용자 정보 확인
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      }
    } catch (error) {
      console.error('인증 상태 확인 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = (userData: User) => {
    setUser(userData)
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('로그아웃 오류:', error)
    } finally {
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

/**
 * 권한 체크 커스텀 훅
 * permissions 유틸리티와 함께 사용
 */
export function usePermissions() {
  const { user } = useAuth()
  
  return {
    user,
    role: user?.role,
    verificationStatus: user?.verificationStatus,
    isGuest: !user,
    isGeneral: user?.role === 'GENERAL',
    isStudent: user?.role === 'STUDENT',
    isAdmin: user?.role === 'ADMIN',
    isVerified: user?.verificationStatus === 'APPROVED',
    isVerificationPending: user?.verificationStatus === 'PENDING',
    isVerificationRequested: user?.verificationStatus === 'REQUESTED',
    isVerificationRejected: user?.verificationStatus === 'REJECTED',
  }
}
