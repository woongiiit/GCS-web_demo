/**
 * 로그 레벨
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

/**
 * 로그 컨텍스트
 */
export interface LogContext {
  userId?: string
  email?: string
  ip?: string
  userAgent?: string
  action?: string
  [key: string]: any
}

/**
 * 보안 이벤트 타입
 */
export type SecurityEvent = 
  | 'password_reset_requested'
  | 'password_reset_completed'
  | 'password_reset_failed'
  | 'invalid_token_attempt'
  | 'rate_limit_exceeded'
  | 'suspicious_activity'
  | 'invalid_login_attempt'
  | 'login_success'
  | 'login_error'

/**
 * 로거 클래스
 */
class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  /**
   * 로그를 출력합니다.
   */
  private log(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      level,
      message,
      ...context
    }

    if (this.isDevelopment) {
      // 개발 환경에서는 콘솔에 출력
      const emoji = {
        debug: '🐛',
        info: 'ℹ️',
        warn: '⚠️',
        error: '❌'
      }[level]

      console.log(`${emoji} [${timestamp}] ${message}`, context ? JSON.stringify(context, null, 2) : '')
    } else {
      // 프로덕션 환경에서는 구조화된 로그 출력
      console.log(JSON.stringify(logEntry))
    }
  }

  /**
   * 디버그 로그
   */
  debug(message: string, context?: LogContext) {
    this.log('debug', message, context)
  }

  /**
   * 정보 로그
   */
  info(message: string, context?: LogContext) {
    this.log('info', message, context)
  }

  /**
   * 경고 로그
   */
  warn(message: string, context?: LogContext) {
    this.log('warn', message, context)
  }

  /**
   * 에러 로그
   */
  error(message: string, context?: LogContext) {
    this.log('error', message, context)
  }

  /**
   * 보안 이벤트 로그
   */
  security(event: SecurityEvent, message: string, context?: LogContext) {
    this.warn(`[SECURITY] ${event}: ${message}`, {
      ...context,
      securityEvent: event,
      severity: this.getSecuritySeverity(event)
    })
  }

  /**
   * 보안 이벤트 심각도 반환
   */
  private getSecuritySeverity(event: SecurityEvent): 'low' | 'medium' | 'high' | 'critical' {
    const severityMap: Record<SecurityEvent, 'low' | 'medium' | 'high' | 'critical'> = {
      'password_reset_requested': 'low',
      'password_reset_completed': 'low',
      'password_reset_failed': 'medium',
      'invalid_token_attempt': 'high',
      'rate_limit_exceeded': 'medium',
      'suspicious_activity': 'high',
      'invalid_login_attempt': 'medium',
      'login_success': 'low',
      'login_error': 'high'
    }
    return severityMap[event]
  }

  /**
   * API 요청 로그
   */
  apiRequest(method: string, path: string, context?: LogContext) {
    this.info(`API Request: ${method} ${path}`, context)
  }

  /**
   * API 응답 로그
   */
  apiResponse(method: string, path: string, statusCode: number, context?: LogContext) {
    const level = statusCode >= 400 ? 'error' : 'info'
    this.log(level, `API Response: ${method} ${path} - ${statusCode}`, context)
  }
}

// 싱글톤 인스턴스
export const logger = new Logger()

/**
 * 에러를 안전하게 로깅합니다.
 */
export function logError(error: unknown, context?: LogContext) {
  if (error instanceof Error) {
    logger.error(error.message, {
      ...context,
      stack: error.stack,
      name: error.name
    })
  } else {
    logger.error('Unknown error occurred', {
      ...context,
      error: String(error)
    })
  }
}

/**
 * 보안 이벤트를 로깅합니다.
 */
export function logSecurityEvent(
  event: SecurityEvent,
  message: string,
  context?: LogContext
) {
  logger.security(event, message, context)
}
