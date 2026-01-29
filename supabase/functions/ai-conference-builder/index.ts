import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders, verifyAuth, sanitizeString, checkRateLimit } from '../_shared/auth.ts'

// Generation types supported
type GenerationType =
  | 'conference_details'    // Name, tagline, description
  | 'tracks'                // Suggested tracks for a conference
  | 'sessions'              // Sessions for a track
  | 'session_description'   // Enhance/generate session description
  | 'speaker_bio'           // Generate speaker bio
  | 'schedule'              // Suggested schedule/agenda
  | 'marketing_copy'        // Email, social, website copy
  | 'chat'                  // Free-form chat assistant

interface GenerationRequest {
  type: GenerationType
  context: Record<string, any>
  previousMessages?: Array<{ role: 'user' | 'assistant'; content: string }>
}

// System prompts for different generation types
const systemPrompts: Record<GenerationType, string> = {
  conference_details: `You are an expert conference planner and branding specialist.
Generate creative, professional conference details based on the provided context.
Always respond with valid JSON containing: name (string), tagline (string), description (string - 2-3 paragraphs).
Make suggestions modern, engaging, and appropriate for the target audience.`,

  tracks: `You are an expert conference program designer.
Generate relevant session tracks for a conference based on the theme and audience.
Always respond with valid JSON containing: tracks (array of objects with: name, description, color (hex), suggestedSessionCount).
Suggest 4-6 tracks that cover the topic comprehensively without overlap.`,

  sessions: `You are an expert conference content curator.
Generate engaging session ideas for a specific track.
Always respond with valid JSON containing: sessions (array of objects with: title, description, sessionType (keynote/talk/panel/workshop), durationMinutes, level (beginner/intermediate/advanced), suggestedSpeakerProfile).
Suggest 5-8 diverse sessions that would appeal to attendees.`,

  session_description: `You are an expert technical writer for conference sessions.
Enhance or generate a compelling session description that will attract attendees.
Always respond with valid JSON containing: description (string - 2-3 paragraphs), keyTakeaways (array of 3-5 strings), targetAudience (string).
Make it informative, engaging, and clearly communicate value to attendees.`,

  speaker_bio: `You are an expert at writing professional speaker biographies.
Generate a compelling speaker bio based on the provided information.
Always respond with valid JSON containing: bio (string - 2-3 sentences), extendedBio (string - 1 paragraph), suggestedTopics (array of 3-5 strings).
Make it professional, engaging, and highlight expertise.`,

  schedule: `You are an expert conference scheduler and program manager.
Generate an optimal schedule/agenda for the conference.
Always respond with valid JSON containing: days (array of objects with: date, blocks (array with: startTime, endTime, type (keynote/session/break/networking/lunch), title, room, trackId if applicable)).
Consider attendee energy levels, networking opportunities, and session variety.`,

  marketing_copy: `You are an expert conference marketing copywriter.
Generate compelling marketing copy for the conference.
Always respond with valid JSON containing the requested format (email, social, website, etc.) with appropriate fields.
Make it engaging, action-oriented, and highlight unique value propositions.`,

  chat: `You are a helpful AI assistant for conference organizers.
Help them plan and build their conference by answering questions, providing suggestions, and offering best practices.
You can help with: naming, branding, track design, session planning, scheduling, speaker management, marketing, logistics, and more.
Be conversational but professional. When providing structured suggestions, format them clearly.
If you're suggesting something that could be auto-filled into a form, mention that you can help generate that content.`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(clientIP, 30, 60000)) {
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please wait a moment.' }),
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

    const body: GenerationRequest = await req.json()
    const { type, context, previousMessages } = body

    // Validate generation type
    if (!type || !systemPrompts[type]) {
      return new Response(
        JSON.stringify({ error: 'Invalid generation type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get Gemini API key
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: 'Gemini API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Build the prompt based on type
    let userPrompt = ''

    switch (type) {
      case 'conference_details':
        userPrompt = `Generate conference details for:
Topic/Theme: ${sanitizeString(context.topic || '', 200)}
Industry: ${sanitizeString(context.industry || '', 100)}
Target Audience: ${sanitizeString(context.audience || '', 200)}
Expected Size: ${sanitizeString(context.size || '', 50)}
Duration: ${sanitizeString(context.duration || '', 50)}
${context.additionalNotes ? `Additional Notes: ${sanitizeString(context.additionalNotes, 500)}` : ''}`
        break

      case 'tracks':
        userPrompt = `Generate tracks for this conference:
Conference Name: ${sanitizeString(context.conferenceName || '', 200)}
Theme: ${sanitizeString(context.theme || '', 200)}
Target Audience: ${sanitizeString(context.audience || '', 200)}
Duration: ${sanitizeString(context.duration || '', 50)}
${context.existingTracks ? `Existing tracks to avoid overlap with: ${sanitizeString(context.existingTracks, 500)}` : ''}`
        break

      case 'sessions':
        userPrompt = `Generate session ideas for:
Track Name: ${sanitizeString(context.trackName || '', 100)}
Track Description: ${sanitizeString(context.trackDescription || '', 300)}
Conference Theme: ${sanitizeString(context.conferenceTheme || '', 200)}
Target Audience: ${sanitizeString(context.audience || '', 200)}
${context.existingSessions ? `Existing sessions (avoid duplicates): ${sanitizeString(context.existingSessions, 500)}` : ''}`
        break

      case 'session_description':
        userPrompt = `${context.enhance ? 'Enhance this session description' : 'Generate a session description'}:
Session Title: ${sanitizeString(context.title || '', 200)}
Speaker: ${sanitizeString(context.speaker || '', 100)}
Track: ${sanitizeString(context.track || '', 100)}
Session Type: ${sanitizeString(context.sessionType || 'talk', 50)}
${context.currentDescription ? `Current Description: ${sanitizeString(context.currentDescription, 1000)}` : ''}
${context.notes ? `Notes/Key Points: ${sanitizeString(context.notes, 500)}` : ''}`
        break

      case 'speaker_bio':
        userPrompt = `Generate a speaker bio for:
Name: ${sanitizeString(context.name || '', 100)}
Company: ${sanitizeString(context.company || '', 100)}
Role/Title: ${sanitizeString(context.role || '', 100)}
${context.expertise ? `Areas of Expertise: ${sanitizeString(context.expertise, 300)}` : ''}
${context.achievements ? `Key Achievements: ${sanitizeString(context.achievements, 500)}` : ''}
${context.currentBio ? `Current Bio (enhance this): ${sanitizeString(context.currentBio, 500)}` : ''}`
        break

      case 'schedule':
        userPrompt = `Generate a schedule for:
Conference Name: ${sanitizeString(context.conferenceName || '', 200)}
Start Date: ${sanitizeString(context.startDate || '', 20)}
End Date: ${sanitizeString(context.endDate || '', 20)}
Daily Start Time: ${sanitizeString(context.startTime || '9:00 AM', 20)}
Daily End Time: ${sanitizeString(context.endTime || '5:00 PM', 20)}
Tracks: ${sanitizeString(JSON.stringify(context.tracks || []), 500)}
Number of Rooms: ${context.roomCount || 3}
Include networking breaks: ${context.includeNetworking !== false}
Include lunch: ${context.includeLunch !== false}`
        break

      case 'marketing_copy':
        userPrompt = `Generate ${sanitizeString(context.copyType || 'email', 50)} marketing copy for:
Conference Name: ${sanitizeString(context.conferenceName || '', 200)}
Tagline: ${sanitizeString(context.tagline || '', 200)}
Key Highlights: ${sanitizeString(context.highlights || '', 500)}
Target Audience: ${sanitizeString(context.audience || '', 200)}
Dates: ${sanitizeString(context.dates || '', 50)}
Location: ${sanitizeString(context.location || '', 100)}
Call to Action: ${sanitizeString(context.cta || 'Register now', 100)}
Tone: ${sanitizeString(context.tone || 'professional and exciting', 50)}`
        break

      case 'chat':
        userPrompt = sanitizeString(context.message || '', 2000)
        break
    }

    // Build messages array for Gemini
    const messages: Array<{ role: string; parts: Array<{ text: string }> }> = []

    // Add previous messages for chat context
    if (type === 'chat' && previousMessages) {
      for (const msg of previousMessages.slice(-10)) { // Keep last 10 messages for context
        messages.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        })
      }
    }

    // Add current user message
    messages.push({
      role: 'user',
      parts: [{ text: userPrompt }]
    })

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: messages,
          systemInstruction: {
            parts: [{ text: systemPrompts[type] }]
          },
          generationConfig: {
            temperature: type === 'chat' ? 0.8 : 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: type === 'chat' ? 1000 : 2000,
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          ]
        }),
      }
    )

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      console.error('Gemini API error:', errorText)
      return new Response(
        JSON.stringify({ error: 'Failed to generate content' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const geminiData = await geminiResponse.json()

    if (!geminiData.candidates || !geminiData.candidates[0]?.content?.parts?.[0]?.text) {
      return new Response(
        JSON.stringify({ error: 'No content generated' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const generatedText = geminiData.candidates[0].content.parts[0].text

    // For chat type, return as plain text
    if (type === 'chat') {
      return new Response(
        JSON.stringify({
          type: 'chat',
          content: generatedText,
          usage: geminiData.usageMetadata
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // For other types, parse JSON response
    let parsedContent
    try {
      // Extract JSON from response (might be wrapped in markdown code blocks)
      const jsonMatch = generatedText.match(/```json\n?([\s\S]*?)\n?```/) ||
                       generatedText.match(/```\n?([\s\S]*?)\n?```/) ||
                       [null, generatedText]
      const jsonString = jsonMatch[1] || generatedText
      parsedContent = JSON.parse(jsonString.trim())
    } catch (e) {
      console.error('Failed to parse JSON response:', e)
      // Return raw text if parsing fails
      parsedContent = { rawContent: generatedText }
    }

    return new Response(
      JSON.stringify({
        type,
        content: parsedContent,
        usage: geminiData.usageMetadata
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
