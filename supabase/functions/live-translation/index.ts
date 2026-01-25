import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders, verifyAuth, sanitizeString, checkRateLimit } from '../_shared/auth.ts'

// Valid language codes for DeepL
const VALID_LANGUAGES = new Set([
  'en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'pl', 'ru', 'ja', 'zh', 'ko', 'ar',
  'bg', 'cs', 'da', 'el', 'et', 'fi', 'hu', 'id', 'lv', 'lt', 'nb', 'ro', 'sk', 'sl', 'sv', 'tr', 'uk'
])

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Rate limiting by IP (translation can be expensive)
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(clientIP, 50, 60000)) {
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

    const { text, targetLanguage, sourceLanguage } = await req.json()

    if (!text || !targetLanguage) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: text, targetLanguage' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate language codes
    const targetLangLower = targetLanguage.toLowerCase()
    if (!VALID_LANGUAGES.has(targetLangLower)) {
      return new Response(
        JSON.stringify({ error: 'Invalid target language code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (sourceLanguage) {
      const sourceLangLower = sourceLanguage.toLowerCase()
      if (!VALID_LANGUAGES.has(sourceLangLower)) {
        return new Response(
          JSON.stringify({ error: 'Invalid source language code' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Sanitize and limit text length (DeepL has limits)
    const sanitizedText = sanitizeString(text, 5000)
    if (sanitizedText.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Text is empty after sanitization' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const deeplApiKey = Deno.env.get('DEEPL_API_KEY')
    if (!deeplApiKey) {
      return new Response(
        JSON.stringify({ error: 'DeepL API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Map common language codes to DeepL format
    const languageMap: Record<string, string> = {
      'en': 'EN',
      'es': 'ES',
      'fr': 'FR',
      'de': 'DE',
      'it': 'IT',
      'pt': 'PT',
      'nl': 'NL',
      'pl': 'PL',
      'ru': 'RU',
      'ja': 'JA',
      'zh': 'ZH',
      'ko': 'KO',
      'ar': 'AR',
    }

    const deeplTargetLang = languageMap[targetLangLower] || targetLanguage.toUpperCase()
    const deeplSourceLang = sourceLanguage ? (languageMap[sourceLanguage.toLowerCase()] || sourceLanguage.toUpperCase()) : undefined

    // Call DeepL API
    const formData = new URLSearchParams()
    formData.append('text', sanitizedText)
    formData.append('target_lang', deeplTargetLang)
    if (deeplSourceLang) {
      formData.append('source_lang', deeplSourceLang)
    }
    formData.append('formality', 'default')
    formData.append('preserve_formatting', '1')

    const deeplResponse = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${deeplApiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    })

    if (!deeplResponse.ok) {
      const errorText = await deeplResponse.text()
      console.error('DeepL API error:', errorText)

      // Fallback: Return original text if translation fails
      return new Response(
        JSON.stringify({
          translatedText: sanitizedText,
          detectedSourceLanguage: sourceLanguage || 'unknown',
          error: 'Translation service temporarily unavailable',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const deeplData = await deeplResponse.json()

    if (!deeplData.translations || deeplData.translations.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No translation returned' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const translation = deeplData.translations[0]

    return new Response(
      JSON.stringify({
        translatedText: translation.text,
        detectedSourceLanguage: translation.detected_source_language?.toLowerCase() || sourceLanguage,
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
