import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user session
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { message, previousMessages } = body

    if (!message) {
      return NextResponse.json(
        { error: 'Missing message' },
        { status: 400 }
      )
    }

    // Call the Supabase edge function with chat type
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-conference-builder`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          type: 'chat',
          context: { message },
          previousMessages: previousMessages?.slice(-10), // Keep last 10 messages
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: error.error || 'Chat failed' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error: any) {
    console.error('AI chat error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
