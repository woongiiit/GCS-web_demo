/**
 * SendGrid HTTP API를 사용한 이메일 전송
 */

interface SendGridEmailData {
  to: string
  resetLink: string
  userName: string
}

/**
 * SendGrid HTTP API를 통해 비밀번호 재설정 이메일을 전송합니다.
 */
export async function sendPasswordResetEmailViaSendGrid(
  to: string,
  resetLink: string,
  userName: string
): Promise<void> {
  const apiKey = process.env.SENDGRID_API_KEY
  
  if (!apiKey) {
    console.log('='.repeat(60))
    console.log('📧 SendGrid API 키가 설정되지 않음 - 개발 모드로 전환')
    console.log('='.repeat(60))
    console.log(`수신자: ${to}`)
    console.log(`사용자: ${userName}`)
    console.log(`재설정 링크: ${resetLink}`)
    console.log('='.repeat(60))
    console.log('💡 SendGrid API 키를 Railway 환경변수에 추가하세요.')
    console.log('💡 SENDGRID_API_KEY=your_api_key_here')
    console.log('='.repeat(60))
    return
  }

  const emailData = {
    personalizations: [
      {
        to: [{ email: to, name: userName }],
        subject: '[GCS:Web] 비밀번호 재설정 요청'
      }
    ],
    from: {
      email: process.env.SENDGRID_FROM_EMAIL || 'noreply@yourdomain.com',
      name: 'GCS:Web'
    },
    content: [
      {
        type: 'text/html',
        value: generatePasswordResetEmailTemplate(userName, resetLink)
      }
    ]
  }

  try {
    console.log('📧 SendGrid API로 이메일 전송 시도 중...')
    console.log(`API Key: ${apiKey.substring(0, 10)}...`)
    console.log(`From: ${emailData.from.email}`)
    console.log(`To: ${to}`)
    
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    })

    if (response.ok) {
      console.log(`✅ SendGrid 이메일 전송 완료: ${to}`)
      console.log(`Status: ${response.status}`)
    } else {
      const errorData = await response.text()
      console.error('❌ SendGrid 이메일 전송 실패:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      })
      throw new Error(`SendGrid API 오류: ${response.status} - ${errorData}`)
    }
  } catch (error) {
    console.error('❌ SendGrid 이메일 전송 실패:', error)
    console.error('오류 타입:', error instanceof Error ? error.constructor.name : typeof error)
    
    // SendGrid API 실패 시 개발 모드로 fallback
    console.log('='.repeat(60))
    console.log('⚠️  SendGrid API 실패 - 개발 모드로 전환')
    console.log('='.repeat(60))
    console.log(`수신자: ${to}`)
    console.log(`사용자: ${userName}`)
    console.log(`재설정 링크: ${resetLink}`)
    console.log('='.repeat(60))
    console.log('💡 SendGrid API 키를 확인하거나 다른 이메일 서비스를 사용하세요.')
    console.log('='.repeat(60))
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
            <a href="mailto:gcsweb01234@gcsweb.kr" class="link">gcsweb01234@gcsweb.kr</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * SendGrid HTTP API를 통해 이메일 인증번호를 전송합니다.
 * @param to 수신자 이메일 주소
 * @param code 인증번호
 */
export async function sendEmailVerificationCodeViaSendGrid(
  to: string,
  code: string
): Promise<void> {
  const apiKey = process.env.SENDGRID_API_KEY
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@yourdomain.com'

  if (!apiKey) {
    console.log('='.repeat(60))
    console.log('⚠️  SendGrid API Key 누락 - 개발 모드로 전환')
    console.log('='.repeat(60))
    console.log(`수신자: ${to}`)
    console.log(`인증번호: ${code}`)
    console.log('='.repeat(60))
    console.log('💡 SENDGRID_API_KEY=your_api_key_here')
    console.log('='.repeat(60))
    return
  }

  const emailData = {
    personalizations: [
      {
        to: [{ email: to }],
        subject: '[GCS:Web] 이메일 인증번호'
      }
    ],
    from: {
      email: fromEmail,
      name: 'GCS:Web'
    },
    content: [
      {
        type: 'text/html',
        value: generateEmailVerificationTemplate(code)
      }
    ]
  }

  try {
    console.log('📧 SendGrid API로 이메일 인증번호 전송 시도 중...')
    console.log(`API Key: ${apiKey.substring(0, 10)}...`)
    console.log(`From: ${emailData.from.email}`)
    console.log(`To: ${to}`)

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('SendGrid 이메일 인증번호 전송 실패', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      })
      throw new Error(`SendGrid API 오류: ${response.status} - ${errorText}`)
    }

    console.log(`✅ SendGrid 이메일 인증번호 전송 완료: ${to}`)
  } catch (error) {
    console.error('❌ SendGrid 이메일 인증번호 전송 실패:', error)
    console.log('='.repeat(60))
    console.log('⚠️  SendGrid API 실패 - 개발 모드로 전환')
    console.log('='.repeat(60))
    console.log(`수신자: ${to}`)
    console.log(`인증번호: ${code}`)
    console.log('='.repeat(60))
    console.log('💡 SendGrid API 키를 확인하거나 다른 이메일 서비스를 사용하세요.')
    console.log('='.repeat(60))
    return
  }
}

/**
 * 이메일 인증번호 HTML 템플릿을 생성합니다.
 */
function generateEmailVerificationTemplate(code: string): string {
  return `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>이메일 인증번호</title>
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
        .code-container {
          background-color: #f8f9fa;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          margin: 20px 0;
        }
        .verification-code {
          font-size: 32px;
          font-weight: bold;
          color: #000;
          letter-spacing: 8px;
          font-family: 'Courier New', monospace;
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
          <div class="title">이메일 인증번호</div>
        </div>

        <div class="content">
          <p>안녕하세요!</p>

          <p>GCS:Web 회원가입을 위한 이메일 인증번호입니다.</p>

          <div class="code-container">
            <div class="verification-code">${code}</div>
          </div>

          <p>위의 인증번호를 회원가입 페이지에 입력해주세요.</p>

          <div class="warning">
            <strong>⚠️ 주의사항:</strong>
            <ul>
              <li>인증번호는 5분 후에 만료됩니다.</li>
              <li>인증번호는 한 번만 사용할 수 있습니다.</li>
              <li>인증번호는 3회까지 시도할 수 있습니다.</li>
              <li>본인이 요청하지 않은 인증번호라면 이 이메일을 무시해주세요.</li>
            </ul>
          </div>
        </div>

        <div class="footer">
          <p>이 이메일은 GCS:Web 시스템에서 자동으로 발송되었습니다.</p>
          <p>문의사항이 있으시면 관리자에게 연락해주세요.</p>
          <p>
            <a href="mailto:gcsweb01234@gcsweb.kr" class="link">gcsweb01234@gcsweb.kr</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * SendGrid API 연결을 테스트합니다.
 */
export async function testSendGridConnection(): Promise<boolean> {
  const apiKey = process.env.SENDGRID_API_KEY
  
  if (!apiKey) {
    console.log('SendGrid API 키가 설정되지 않았습니다.')
    return false
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/user/profile', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    })

    if (response.ok) {
      console.log('SendGrid API 연결 성공')
      return true
    } else {
      console.error('SendGrid API 연결 실패:', response.status)
      return false
    }
  } catch (error) {
    console.error('SendGrid API 연결 실패:', error)
    return false
  }
}
