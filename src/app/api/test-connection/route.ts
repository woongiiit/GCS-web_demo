import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const results = {
    timestamp: new Date().toISOString(),
    tests: [] as any[]
  }

  // 1. 기본 네트워크 연결 테스트
  try {
    const response = await fetch('https://httpbin.org/get', {
      method: 'GET',
      signal: AbortSignal.timeout(10000)
    })
    results.tests.push({
      name: 'HTTP 연결 테스트',
      status: 'success',
      details: `Status: ${response.status}`
    })
  } catch (error) {
    results.tests.push({
      name: 'HTTP 연결 테스트',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }

  // 2. Gmail SMTP 포트 테스트
  try {
    const net = await import('net')
    const socket = new net.Socket()
    
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        socket.destroy()
        reject(new Error('Connection timeout'))
      }, 5000)

      socket.connect(587, 'smtp.gmail.com', () => {
        clearTimeout(timeout)
        socket.destroy()
        resolve(true)
      })

      socket.on('error', (err) => {
        clearTimeout(timeout)
        reject(err)
      })
    })

    results.tests.push({
      name: 'Gmail SMTP 포트 587',
      status: 'success',
      details: 'Connection successful'
    })
  } catch (error) {
    results.tests.push({
      name: 'Gmail SMTP 포트 587',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }

  // 3. Brevo SMTP 포트 테스트
  try {
    const net = await import('net')
    const socket = new net.Socket()
    
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        socket.destroy()
        reject(new Error('Connection timeout'))
      }, 5000)

      socket.connect(587, 'smtp-relay.brevo.com', () => {
        clearTimeout(timeout)
        socket.destroy()
        resolve(true)
      })

      socket.on('error', (err) => {
        clearTimeout(timeout)
        reject(err)
      })
    })

    results.tests.push({
      name: 'Brevo SMTP 포트 587',
      status: 'success',
      details: 'Connection successful'
    })
  } catch (error) {
    results.tests.push({
      name: 'Brevo SMTP 포트 587',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }

  // 4. SendGrid SMTP 포트 테스트
  try {
    const net = await import('net')
    const socket = new net.Socket()
    
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        socket.destroy()
        reject(new Error('Connection timeout'))
      }, 5000)

      socket.connect(587, 'smtp.sendgrid.net', () => {
        clearTimeout(timeout)
        socket.destroy()
        resolve(true)
      })

      socket.on('error', (err) => {
        clearTimeout(timeout)
        reject(err)
      })
    })

    results.tests.push({
      name: 'SendGrid SMTP 포트 587',
      status: 'success',
      details: 'Connection successful'
    })
  } catch (error) {
    results.tests.push({
      name: 'SendGrid SMTP 포트 587',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }

  return NextResponse.json(results, { status: 200 })
}
