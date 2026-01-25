import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Verify authorization
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const payload: PushNotificationPayload = await req.json()
    const { userIds, conferenceId, title, body, data } = payload

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
      query = query.in('user_id', memberIds)
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
      title,
      body,
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
        title,
        body,
        notification_type: 'push',
        reference_id: conferenceId,
      })
    }

    return new Response(
      JSON.stringify({ success: true, sent: sentCount, total: tokens.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
