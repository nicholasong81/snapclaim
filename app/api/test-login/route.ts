import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: 'Test endpoint working',
    timestamp: new Date().toISOString(),
    loginPageUrl: 'http://localhost:3000/login',
    instructions: 'Try accessing the login page directly in your browser'
  })
}
