import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET() {
  try {
    const logoPath = join(process.cwd(), 'public', 'snapclaim-logo.png')
    const logoBuffer = await readFile(logoPath)
    
    return new NextResponse(logoBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-cache'
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Logo not found', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 404 }
    )
  }
}
