import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders, verifyAuth, isValidUUID, sanitizeString, checkRateLimit } from '../_shared/auth.ts'

interface PushNotificationPayload {
  userIds?: string[]
  conferenceId?: string
  title: string
  body: string
  data?: Record<string, any>
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Rate limiting by IP (stricter for push notifications)
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(clientIP, 10, 60000)) {
      return new Response(
        JSON.stringify({ error: 'Too many requests' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify authentication
    const { user, error: authError } = await verifyAuth(req)
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: authError || 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabaseClient = createClient(supabaseUrl, supabaseKey)

    const payload: PushNotificationPayload = await req.json()
    const { userIds, conferenceId, title, body, data } = payload

    // Validate required fields
    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: title, body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate UUIDs if provided
    if (conferenceId && !isValidUUID(conferenceId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid conferenceId format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (userIds) {
      for (const userId of userIds) {
        if (!isValidUUID(userId)) {
          return new Response(
            JSON.stringify({ error: 'Invalid userId format in userIds array' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }
    }

    // Verify user is an organizer or staff for this conference
    if (conferenceId) {
      const { data: membership } = await supabaseClient
        .from('conference_members')
        .select('role')
        .eq('conference_id', conferenceId)
        .eq('user_id', user.id)
        .single()

      if (!membership || !['organizer', 'staff'].includes(membership.role)) {
        return new Response(
          JSON.stringify({ error: 'Only organizers and staff can send push notifications' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Sanitize text inputs
    const sanitizedTitle = sanitizeString(title, 100)
    const sanitizedBody = sanitizeString(body, 500)

    // Get push tokens for target users
    let query = supabaseClient.from('push_tokens').select('token, user_id, platform')

    if (userIds) {
      query = query.in('user_id', userIds)
    } else if (conferenceId) {
      // Get all users in the conference
      const { data: members } = await supabaseClient
        .from('conference_members')
        .select('user_id')
        .eq('conference_id', conferenceId)

      const memberIds = members?.map((m) => m.user_id) || []
      if (memberIds.length === 0) {
        return new Response(
          JSON.stringify({ success: true, sent: 0, message: 'No members found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      query = query.in('user_id', memberIds)
    } else {
      return new Response(
        JSON.stringify({ error: 'Must provide either userIds or conferenceId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: tokens } = await query

    if (!tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No tokens found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Group tokens by platform
    const expoTokens = tokens.filter((t) => t.platform === 'ios' || t.platform === 'android')

    // Send to Expo Push Notification service
    const expoPushUrl = 'https://exp.host/--/api/v2/push/send'
    const expoMessages = expoTokens.map((t) => ({
      to: t.token,
      sound: 'default',
      title: sanitizedTitle,
      body: sanitizedBody,
      data,
    }))

    let sentCount = 0

    if (expoMessages.length > 0) {
      const response = await fetch(expoPushUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(expoMessages),
      })

      if (response.ok) {
        const result = await response.json()
        sentCount = result.data?.filter((r: any) => r.status === 'ok').length || 0
      }
    }

    // Store notification in database
    for (const token of tokens) {
      await supabaseClient.from('user_notifications').insert({
        user_id: token.user_id,
        title: sanitizedTitle,
        body: sanitizedBody,
        notification_type: 'push',
        reference_id: conferenceId,
      })
    }

    return new Response(
      JSON.stringify({ success: true, sent: sentCount, total: tokens.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
