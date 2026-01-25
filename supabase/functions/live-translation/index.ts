import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, targetLanguage, sourceLanguage } = await req.json()

    if (!text || !targetLanguage) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: text, targetLanguage' }),
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
      'ar': 'AR', // Note: DeepL may not support all languages
    }

    const deeplTargetLang = languageMap[targetLanguage.toLowerCase()] || targetLanguage.toUpperCase()
    const deeplSourceLang = sourceLanguage ? (languageMap[sourceLanguage.toLowerCase()] || sourceLanguage.toUpperCase()) : undefined

    // Call DeepL API
    const formData = new URLSearchParams()
    formData.append('text', text)
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
          translatedText: text,
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
