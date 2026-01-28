import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.24.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DesignRequest {
  prompt: string;
  referenceUrl?: string;
  brandAssets?: {
    logoUrl?: string;
    colors?: string[];
    fonts?: string[];
    mood?: string[];
  };
  category?: string;
  refinement?: string; // "darker", "more playful", etc.
  generateMultiple?: boolean; // generate 3 options
}

const DESIGN_SYSTEM_PROMPT = `You are a world-class UI/UX designer who has worked at Apple, Stripe, and Linear. You specialize in creating stunning, memorable conference and event experiences that attendees talk about for years.

Your task is to generate a COMPLETE design system that captures the essence and emotion of the event - not just colors, but a cohesive visual identity.

OUTPUT THIS EXACT JSON STRUCTURE:

{
  "designConcept": {
    "name": "A catchy 2-3 word name for this design direction (e.g., 'Midnight Aurora', 'Coral Sunrise', 'Deep Focus')",
    "tagline": "A one-line description of the vibe (e.g., 'Sophisticated elegance meets bold innovation')",
    "personality": ["3-4 personality traits like 'bold', 'warm', 'innovative', 'approachable'"],
    "inspiration": "What this design is inspired by (e.g., 'Northern lights over a winter landscape', 'A clean minimal gallery space')"
  },
  "colors": {
    "primary": "#HEX - the hero color that defines the brand",
    "primaryLight": "#HEX - lighter variant for hover states",
    "primaryDark": "#HEX - darker variant for depth",
    "secondary": "#HEX - complementary supporting color",
    "accent": "#HEX - eye-catching highlight color for CTAs",
    "background": "#HEX - main background",
    "backgroundAlt": "#HEX - alternate background for sections",
    "surface": "#HEX - card/elevated surface background",
    "text": "#HEX - primary text color",
    "textMuted": "#HEX - secondary/muted text",
    "border": "#HEX - subtle borders",
    "error": "#HEX",
    "success": "#HEX",
    "warning": "#HEX"
  },
  "gradients": {
    "hero": "A stunning gradient for hero sections (CSS gradient syntax)",
    "accent": "A subtle gradient for accent areas",
    "card": "A very subtle gradient for premium card backgrounds"
  },
  "typography": {
    "fontFamily": {
      "heading": "Google Font name for headlines - distinctive and impactful",
      "body": "Google Font name for body text - highly readable",
      "mono": "Google Font name for code/numbers - clear and technical"
    },
    "fontSize": {
      "xs": "0.75rem",
      "sm": "0.875rem",
      "base": "1rem",
      "lg": "1.125rem",
      "xl": "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
      "5xl": "3rem",
      "6xl": "3.75rem",
      "7xl": "4.5rem"
    },
    "fontWeight": {
      "normal": 400,
      "medium": 500,
      "semibold": 600,
      "bold": 700,
      "extrabold": 800
    },
    "lineHeight": {
      "tight": 1.1,
      "snug": 1.25,
      "normal": 1.5,
      "relaxed": 1.75
    }
  },
  "spacing": {
    "xs": "0.25rem",
    "sm": "0.5rem",
    "md": "1rem",
    "lg": "1.5rem",
    "xl": "2rem",
    "2xl": "3rem",
    "3xl": "4rem",
    "4xl": "6rem"
  },
  "borderRadius": {
    "none": "0",
    "sm": "value based on personality - sharp for corporate, rounded for friendly",
    "md": "value",
    "lg": "value",
    "xl": "value",
    "2xl": "value",
    "full": "9999px"
  },
  "shadows": {
    "none": "none",
    "sm": "subtle shadow",
    "md": "medium shadow with brand-tinted color",
    "lg": "larger shadow for cards",
    "xl": "dramatic shadow for modals",
    "glow": "a subtle glow effect using the primary color"
  },
  "animation": {
    "duration": {
      "fast": "150ms",
      "normal": "300ms",
      "slow": "500ms",
      "slower": "700ms"
    },
    "easing": {
      "default": "cubic-bezier(0.4, 0, 0.2, 1)",
      "in": "cubic-bezier(0.4, 0, 1, 1)",
      "out": "cubic-bezier(0, 0, 0.2, 1)",
      "bounce": "cubic-bezier(0.68, -0.55, 0.265, 1.55)"
    }
  },
  "componentStyle": {
    "buttons": {
      "style": "rounded/pill/sharp - describe the button aesthetic",
      "hover": "describe the hover effect (glow, lift, color shift)"
    },
    "cards": {
      "style": "describe card aesthetic - glassmorphism, solid, gradient border, etc.",
      "elevation": "flat, subtle, floating, dramatic"
    },
    "inputs": {
      "style": "outlined, filled, underlined - describe the input aesthetic"
    }
  },
  "darkMode": {
    "background": "#HEX - dark mode background",
    "backgroundAlt": "#HEX - dark mode section background",
    "surface": "#HEX - dark mode card background",
    "text": "#HEX - dark mode text",
    "textMuted": "#HEX - dark mode muted text",
    "border": "#HEX - dark mode borders"
  },
  "designRationale": "2-3 sentences explaining why these specific choices work together for this type of event. Reference color psychology, typography pairing logic, and overall coherence."
}

DESIGN PHILOSOPHY:
1. Colors should tell a story - the primary color should evoke the event's energy
2. Gradients add depth and modernity - use them strategically
3. Typography pairing is crucial - heading fonts should contrast with body fonts
4. Shadows should use brand colors subtly (not pure black)
5. Border radius communicates personality - rounded = friendly, sharp = professional
6. The design should feel cohesive and intentional, not generic

REFERENCE VIBES TO UNDERSTAND:
- "Apple keynote": Minimalist, confident, premium blacks with colorful accents
- "Stripe": Technical sophistication, purple/blue gradients, clean geometry
- "Linear": Dark mode excellence, purple glow effects, sharp precision
- "Notion": Warm and approachable, creamy backgrounds, friendly typography
- "Vercel": Bold black/white contrast, dramatic gradients, developer-focused
- "TED": Confident red, intellectual gravitas, serif/sans pairing
- "WWDC": Multicolor vibrancy, playful yet professional, SF Pro elegance
- "Google I/O": Bright, optimistic, material design with personality

Return ONLY valid JSON. No markdown, no explanations outside the JSON.`;

const REFINEMENT_PROMPTS: Record<string, string> = {
  darker: 'Make the design darker and moodier while keeping the same personality. Deepen the colors, use darker backgrounds, add more dramatic shadows.',
  lighter: 'Make the design lighter and airier. Use softer colors, more white space feeling, lighter backgrounds.',
  playful: 'Make it more playful and energetic. Brighter accent colors, more rounded corners, friendlier typography.',
  professional: 'Make it more corporate and professional. More muted colors, sharper corners, traditional typography.',
  bold: 'Make it bolder and more striking. Higher contrast, more saturated colors, dramatic typography.',
  minimal: 'Make it more minimal and refined. Reduce color palette, subtle shadows, cleaner lines.',
  warm: 'Add more warmth. Introduce warm tones, softer shadows, approachable feeling.',
  cool: 'Add a cooler, more tech-forward feeling. Blue tones, sharper edges, futuristic vibe.',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { prompt, referenceUrl, brandAssets, category, refinement, generateMultiple } = (await req.json()) as DesignRequest;

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build the user prompt
    let userPrompt = `Create a stunning, memorable design system for this event:

EVENT DESCRIPTION: ${prompt}`;

    if (category) {
      userPrompt += `\n\nEVENT CATEGORY: ${category}`;
    }

    if (referenceUrl) {
      userPrompt += `\n\nINSPIRATION/REFERENCE: ${referenceUrl}`;
    }

    if (brandAssets) {
      if (brandAssets.colors && brandAssets.colors.length > 0) {
        userPrompt += `\n\nMUST INCORPORATE THESE BRAND COLORS: ${brandAssets.colors.join(', ')}`;
      }
      if (brandAssets.fonts && brandAssets.fonts.length > 0) {
        userPrompt += `\n\nPREFERRED FONTS TO CONSIDER: ${brandAssets.fonts.join(', ')}`;
      }
      if (brandAssets.mood && brandAssets.mood.length > 0) {
        userPrompt += `\n\nDESIRED MOOD: ${brandAssets.mood.join(', ')}`;
      }
    }

    if (refinement && REFINEMENT_PROMPTS[refinement]) {
      userPrompt += `\n\nDESIGN DIRECTION: ${REFINEMENT_PROMPTS[refinement]}`;
    }

    if (generateMultiple) {
      userPrompt += `\n\nGENERATE 3 DISTINCT DESIGN OPTIONS as an array. Each should have a different personality while still fitting the event description. Return as: { "options": [design1, design2, design3] }`;
    }

    userPrompt += `\n\nCreate a design that attendees will remember. Make it feel intentional and premium, not generic.`;

    console.log('Generating design for:', prompt);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.8, // More creative
        topP: 0.95,
        maxOutputTokens: 4096,
      }
    });

    const result = await model.generateContent([
      { text: DESIGN_SYSTEM_PROMPT },
      { text: userPrompt },
    ]);

    const response = result.response;
    const text = response.text();

    console.log('Generated response length:', text.length);

    // Parse JSON
    let design;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        design = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch (parseError) {
      console.error('Parse error, raw response:', text.substring(0, 1000));
      return new Response(
        JSON.stringify({
          error: 'Failed to parse design',
          rawResponse: text.substring(0, 500)
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle multiple options
    if (generateMultiple && design.options) {
      return new Response(
        JSON.stringify({
          options: design.options,
          prompt,
          model: 'gemini-2.5-flash'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract tokens in the expected format for backwards compatibility
    const tokens = {
      colors: design.colors || {},
      typography: design.typography || {},
      spacing: design.spacing || {},
      borderRadius: design.borderRadius || {},
      shadows: design.shadows || {},
      animation: design.animation || {},
    };

    // Clean up color values (remove comments)
    if (tokens.colors) {
      Object.keys(tokens.colors).forEach(key => {
        const value = tokens.colors[key];
        if (typeof value === 'string' && value.includes(' - ')) {
          tokens.colors[key] = value.split(' - ')[0].trim();
        }
      });
    }

    return new Response(
      JSON.stringify({
        tokens,
        designConcept: design.designConcept,
        gradients: design.gradients,
        componentStyle: design.componentStyle,
        darkMode: design.darkMode,
        designRationale: design.designRationale,
        prompt,
        model: 'gemini-2.5-flash'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
