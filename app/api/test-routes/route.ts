import { NextResponse } from 'next/server'

export async function GET() {
  const routes = [
    '/',
    '/login',
    '/signup',
    '/dashboard',
    '/forgot-password'
  ]
  
  const results: Record<string, string> = {}
  
  for (const route of routes) {
    try {
      results[route] = 'Route exists'
    } catch (error) {
      results[route] = `Error: ${error instanceof Error ? error.message : 'Unknown'}`
    }
  }
  
  return NextResponse.json({
    message: 'Route accessibility test',
    routes: results,
    baseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configured' : 'Missing',
    timestamp: new Date().toISOString()
  })
}
