import nodemailer from 'nodemailer'
import { sendPasswordResetEmailViaSendGrid } from './email-sendgrid'
import { sendPasswordResetEmailViaBrevo } from './email-brevo'

// 이메일 전송 방식 선택
const EMAIL_METHOD = process.env.EMAIL_METHOD || 'smtp' // 'smtp', 'sendgrid', 또는 'brevo'
// Railway 배포 강제 업데이트를 위한 주석

// SMTP 설정 (기존 방식)
let transporter: any = null
if (EMAIL_METHOD === 'smtp') {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // 465 포트는 true, 587 포트는 false
    auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    } : undefined,
    // Railway에서 연결 안정성을 위한 추가 설정
    connectionTimeout: 60000, // 60초
    greetingTimeout: 30000,   // 30초
    socketTimeout: 60000,     // 60초
  })
}

/**
 * 비밀번호 재설정 이메일을 전송합니다.
 * @param to 수신자 이메일 주소
 * @param resetLink 비밀번호 재설정 링크
 * @param userName 사용자 이름
 */
export async function sendPasswordResetEmail(
  to: string,
  resetLink: string,
  userName: string
): Promise<void> {
  // SendGrid HTTP API 사용
  if (EMAIL_METHOD === 'sendgrid') {
    return await sendPasswordResetEmailViaSendGrid(to, resetLink, userName)
  }

  // Brevo HTTP API 사용
  if (EMAIL_METHOD === 'brevo') {
    return await sendPasswordResetEmailViaBrevo(to, resetLink, userName)
  }

  // SMTP 설정이 없거나 연결 실패 시 개발 모드로 fallback
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('='.repeat(60))
    console.log('📧 비밀번호 재설정 이메일 (개발 모드)')
    console.log('='.repeat(60))
    console.log(`수신자: ${to}`)
    console.log(`사용자: ${userName}`)
    console.log(`재설정 링크: ${resetLink}`)
    console.log('='.repeat(60))
    console.log('💡 실제 이메일 전송을 위해서는 Railway 환경변수에 설정을 추가하세요.')
    console.log('💡 SMTP: SMTP_HOST, SMTP_USER, SMTP_PASS 설정')
    console.log('💡 SendGrid: SENDGRID_API_KEY, SENDGRID_FROM_EMAIL 설정')
    console.log('💡 Brevo: BREVO_API_KEY, BREVO_FROM_EMAIL 설정')
    console.log('='.repeat(60))
    return
  }

  const mailOptions = {
    from: `"GCS:Web" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to,
    subject: '[GCS:Web] 비밀번호 재설정 요청',
    html: generatePasswordResetEmailTemplate(userName, resetLink),
  }

  try {
    console.log('📧 SMTP 연결 시도 중...')
    console.log(`Host: ${process.env.SMTP_HOST}`)
    console.log(`Port: ${process.env.SMTP_PORT}`)
    console.log(`User: ${process.env.SMTP_USER}`)
    console.log(`From: ${process.env.SMTP_FROM}`)
    
    await transporter.sendMail(mailOptions)
    console.log(`✅ 비밀번호 재설정 이메일 전송 완료: ${to}`)
  } catch (error) {
    console.error('❌ 이메일 전송 실패:', error)
    console.error('오류 타입:', error instanceof Error ? error.constructor.name : typeof error)
    console.error('오류 코드:', (error as any).code)
    console.error('오류 명령:', (error as any).command)
    
    // Railway에서 SMTP 연결이 차단된 경우 개발 모드로 fallback
    if (error instanceof Error && (error.message.includes('timeout') || (error as any).code === 'ETIMEDOUT')) {
      console.log('='.repeat(60))
      console.log('⚠️  SMTP 연결 타임아웃 - 개발 모드로 전환')
      console.log('='.repeat(60))
      console.log(`수신자: ${to}`)
      console.log(`사용자: ${userName}`)
      console.log(`재설정 링크: ${resetLink}`)
      console.log('='.repeat(60))
      console.log('💡 Railway에서 SMTP 연결이 차단되었습니다.')
      console.log('💡 SendGrid 또는 Mailgun 사용을 권장합니다.')
      console.log('='.repeat(60))
      return
    }
    
    throw new Error('이메일 전송에 실패했습니다.')
  }
}

/**
 * 비밀번호 재설정 이메일 HTML 템플릿을 생성합니다.
 */
function generatePasswordResetEmailTemplate(userName: string, resetLink: string): string {
  return `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>비밀번호 재설정</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .container {
          background-color: white;
          border-radius: 8px;
          padding: 40px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #000;
          margin-bottom: 10px;
        }
        .logo .highlight {
          color: #f57520;
        }
        .title {
          font-size: 20px;
          font-weight: bold;
          color: #000;
          margin-bottom: 20px;
        }
        .content {
          margin-bottom: 30px;
        }
        .button {
          display: inline-block;
          background-color: #000;
          color: white;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
          margin: 20px 0;
        }
        .button:hover {
          background-color: #333;
        }
        .warning {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 4px;
          padding: 15px;
          margin: 20px 0;
          color: #856404;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          font-size: 14px;
          color: #666;
          text-align: center;
        }
        .link {
          color: #f57520;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">GCS<span class="highlight">:</span>Web</div>
          <div class="title">비밀번호 재설정 요청</div>
        </div>
        
        <div class="content">
          <p>안녕하세요, <strong>${userName}</strong>님!</p>
          
          <p>GCS:Web에서 비밀번호 재설정을 요청하셨습니다.</p>
          
          <p>아래 버튼을 클릭하여 새 비밀번호를 설정해주세요:</p>
          
          <div style="text-align: center;">
            <a href="${resetLink}" class="button">비밀번호 재설정하기</a>
          </div>
          
          <div class="warning">
            <strong>⚠️ 주의사항:</strong>
            <ul>
              <li>이 링크는 1시간 후에 만료됩니다.</li>
              <li>링크는 한 번만 사용할 수 있습니다.</li>
              <li>비밀번호 재설정을 요청하지 않으셨다면 이 이메일을 무시해주세요.</li>
            </ul>
          </div>
          
          <p>버튼이 작동하지 않는 경우, 아래 링크를 복사하여 브라우저에 붙여넣으세요:</p>
          <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace;">
            ${resetLink}
          </p>
        </div>
        
        <div class="footer">
          <p>이 이메일은 GCS:Web 시스템에서 자동으로 발송되었습니다.</p>
          <p>문의사항이 있으시면 관리자에게 연락해주세요.</p>
          <p>
            <a href="mailto:admin@gcs-demo.com" class="link">admin@gcs-demo.com</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * 이메일 전송 설정을 테스트합니다.
 */
export async function testEmailConnection(): Promise<boolean> {
  if (EMAIL_METHOD === 'sendgrid') {
    const { testSendGridConnection } = await import('./email-sendgrid')
    return await testSendGridConnection()
  }

  if (EMAIL_METHOD === 'brevo') {
    const { testBrevoConnection } = await import('./email-brevo')
    return await testBrevoConnection()
  }

  if (!transporter) {
    console.log('SMTP 설정이 없습니다.')
    return false
  }

  try {
    await transporter.verify()
    console.log('이메일 서버 연결 성공')
    return true
  } catch (error) {
    console.error('이메일 서버 연결 실패:', error)
    return false
  }
}
