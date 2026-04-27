import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Max base64 size ~6MB original file
const MAX_IMAGE_SIZE = 6_000_000

const CATEGORIES = [
  'Meals',
  'Transport', 
  'Software',
  'Equipment',
  'Supplies',
  'Marketing',
  'Professional Services',
  'Travel',
  'Home Office',
  'Courses & Learning',
  'Other',
] as const

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json()

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      )
    }

    // File size guard — reject oversized images
    if (image.length > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { 
          error: 'Image too large. Please use a ' +
            'smaller image under 4MB.' 
        },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // Remove data URL prefix if present
    const base64Image = image.includes('base64,')
      ? image.split('base64,')[1]
      : image

    // Use gpt-4o-mini for cost efficiency
    // ~$0.00015 per receipt scan
    // Sufficient for clear receipt text extraction
    const response = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 400,
          temperature: 0,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: 
                'You are a receipt data extractor. ' +
                'Extract receipt information and ' +
                'return ONLY valid JSON. ' +
                'Never add explanation or markdown.',
            },
            {
              role: 'user',
              content: [
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`,
                    detail: 'high',
                  },
                },
                {
                  type: 'text',
                  text: `You are a precise receipt data extractor 
for a Singapore expense app.

Carefully read this receipt image and extract
the following. Return ONLY valid JSON.

AMOUNT RULES (very important):
- Find the FINAL TOTAL amount only
- Look for words: Total, Grand Total, 
  Amount Due, Net Total, Subtotal
- Ignore tax lines, service charge lines,
  and individual item prices
- The total is usually the LARGEST amount 
  or the LAST amount on the receipt
- Read each digit carefully one at a time
- Amount must be a positive number

DATE RULES (very important):
- Read each digit of the date carefully
- Singapore receipts use DD/MM/YYYY format
- Convert to YYYY-MM-DD for output
- If only partial date is visible, use today:
  ${new Date().toISOString().split('T')[0]}
- Double check: month must be 01-12, 
  day must be 01-31

VENDOR RULES:
- Use the business name at the TOP of receipt
- Not the address or tagline
- Use proper capitalisation

GST RULES:
- Singapore GST is currently 9%
- Look for GST, GST 9%, or Tax on receipt
- Return as a number or null if not shown

CATEGORY: Choose exactly one from this list:
${CATEGORIES.join(', ')}

Return this exact JSON:
{
  "vendor": "business name",
  "amount": 0.00,
  "date": "YYYY-MM-DD", 
  "gst_amount": null,
  "category": "chosen category"
}`,
                },
              ],
            },
          ],
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      
      // If rate limited by OpenAI
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Too many requests. Please wait a moment.' },
          { status: 429 }
        )
      }

      return NextResponse.json(
        { 
          error: 'AI service error. Please try again.',
          details: errorData.error?.message 
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message
      ?.content

    if (!content) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      )
    }

    // Parse JSON — response_format ensures 
    // valid JSON so no cleanup needed
    try {
      const parsed = JSON.parse(content)

      // Validate and sanitise all fields
      const category = CATEGORIES.includes(
        parsed.category as typeof CATEGORIES[number]
      )
        ? parsed.category
        : 'Other'

      const amount = parseFloat(parsed.amount)
      const gstAmount = parsed.gst_amount
        ? parseFloat(parsed.gst_amount)
        : null

      const result = {
        vendor: typeof parsed.vendor === 'string' && 
          parsed.vendor.trim()
          ? parsed.vendor.trim()
          : 'Unknown vendor',
        amount: isNaN(amount) ? 0 : amount,
        date: typeof parsed.date === 'string' && 
          parsed.date.match(/^\d{4}-\d{2}-\d{2}$/)
          ? parsed.date
          : new Date().toISOString().split('T')[0],
        gst_amount: gstAmount && 
          !isNaN(gstAmount) 
          ? gstAmount 
          : null,
        category,
      }

      return NextResponse.json({ 
        success: true,
        data: result,
        model: 'gpt-4o-mini',
      })
    } catch {
      // JSON parse failed — return manual entry prompt
      return NextResponse.json(
        { 
          error: 'Could not read receipt clearly. ' +
            'Please enter details manually.',
          fallback: true,
        },
        { status: 422 }
      )
    }
  } catch (e: unknown) {
    const msg = e instanceof Error 
      ? e.message 
      : 'Unknown error'
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    )
  }
}
