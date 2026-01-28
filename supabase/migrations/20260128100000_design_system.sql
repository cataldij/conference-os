-- =============================================
-- CONFERENCE OS: Design System Foundation
-- A powerful, flexible design token system
-- =============================================

-- =============================================
-- DESIGN TOKENS TABLE
-- Stores the complete design system for each conference
-- =============================================
CREATE TABLE IF NOT EXISTS design_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conference_id UUID NOT NULL REFERENCES conferences(id) ON DELETE CASCADE,

  -- Versioning for undo/redo
  version INT NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- The complete token system stored as JSONB
  tokens JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Only one active version per conference (partial unique index)
CREATE UNIQUE INDEX IF NOT EXISTS idx_design_tokens_active
  ON design_tokens(conference_id) WHERE is_active = true;

-- =============================================
-- COMPONENT VARIANTS TABLE
-- Different visual styles for each component type
-- =============================================
CREATE TABLE IF NOT EXISTS component_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Component identification
  component_type TEXT NOT NULL, -- 'session_card', 'speaker_card', 'nav_bar', etc.
  variant_name TEXT NOT NULL,   -- 'minimal', 'card', 'bold', 'glass', etc.

  -- Is this a system variant or custom?
  is_system BOOLEAN NOT NULL DEFAULT false,
  conference_id UUID REFERENCES conferences(id) ON DELETE CASCADE, -- NULL for system variants

  -- Variant configuration
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  preview_image_url TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- System variants are unique by type+name
CREATE UNIQUE INDEX IF NOT EXISTS idx_component_variants_system
  ON component_variants(component_type, variant_name) WHERE is_system = true;

-- Custom variants are unique by conference+type+name
CREATE UNIQUE INDEX IF NOT EXISTS idx_component_variants_custom
  ON component_variants(conference_id, component_type, variant_name) WHERE is_system = false;

-- =============================================
-- PAGE SECTIONS TABLE
-- Defines the structure of each page
-- =============================================
CREATE TABLE IF NOT EXISTS page_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conference_id UUID NOT NULL REFERENCES conferences(id) ON DELETE CASCADE,

  -- Page identification
  page_type TEXT NOT NULL, -- 'home', 'agenda', 'speakers', 'sponsors', 'networking', etc.

  -- Section configuration
  section_type TEXT NOT NULL, -- 'hero', 'featured_sessions', 'speaker_grid', 'countdown', etc.
  section_order INT NOT NULL DEFAULT 0,

  -- Section settings
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  variant_id UUID REFERENCES component_variants(id),

  -- Visibility
  is_visible BOOLEAN NOT NULL DEFAULT true,
  visible_from TIMESTAMPTZ,
  visible_until TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- DESIGN PRESETS TABLE
-- AI-generated or curated complete design systems
-- =============================================
CREATE TABLE IF NOT EXISTS design_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Preset info
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT, -- 'tech', 'corporate', 'creative', 'academic', 'medical', etc.

  -- The complete design system
  tokens JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Default page layouts
  default_sections JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Default component variants
  default_variants JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Preview
  preview_image_url TEXT,
  preview_colors TEXT[], -- Quick preview of main colors

  -- Metadata
  is_public BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Search
  tags TEXT[] DEFAULT '{}'::text[]
);

-- =============================================
-- AI STYLE GENERATIONS TABLE
-- Track AI-generated styles for learning/improvement
-- =============================================
CREATE TABLE IF NOT EXISTS ai_style_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conference_id UUID REFERENCES conferences(id) ON DELETE SET NULL,

  -- Input
  prompt TEXT NOT NULL,
  reference_url TEXT,
  brand_assets JSONB, -- uploaded logos, colors, etc.

  -- Output
  generated_tokens JSONB NOT NULL,
  generation_model TEXT NOT NULL DEFAULT 'gemini-1.5-flash',

  -- Feedback
  was_accepted BOOLEAN,
  user_rating INT CHECK (user_rating BETWEEN 1 AND 5),

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_design_tokens_conference ON design_tokens(conference_id);
CREATE INDEX IF NOT EXISTS idx_component_variants_type ON component_variants(component_type);
CREATE INDEX IF NOT EXISTS idx_component_variants_conference ON component_variants(conference_id);
CREATE INDEX IF NOT EXISTS idx_page_sections_conference ON page_sections(conference_id);
CREATE INDEX IF NOT EXISTS idx_page_sections_page ON page_sections(conference_id, page_type);
CREATE INDEX IF NOT EXISTS idx_design_presets_category ON design_presets(category);
CREATE INDEX IF NOT EXISTS idx_design_presets_featured ON design_presets(is_featured) WHERE is_featured = true;

-- =============================================
-- RLS POLICIES
-- =============================================
ALTER TABLE design_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE component_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_style_generations ENABLE ROW LEVEL SECURITY;

-- Design tokens: conference members can view, organizers can edit
CREATE POLICY "Members can view design tokens" ON design_tokens
  FOR SELECT TO authenticated
  USING (public.is_conference_member(conference_id, auth.uid()));

CREATE POLICY "Organizers can manage design tokens" ON design_tokens
  FOR ALL TO authenticated
  USING (public.is_conference_organizer(conference_id, auth.uid()));

-- Component variants: system variants are public, custom are per-conference
CREATE POLICY "Anyone can view system variants" ON component_variants
  FOR SELECT TO authenticated
  USING (is_system = true);

CREATE POLICY "Members can view custom variants" ON component_variants
  FOR SELECT TO authenticated
  USING (conference_id IS NOT NULL AND public.is_conference_member(conference_id, auth.uid()));

CREATE POLICY "Organizers can manage custom variants" ON component_variants
  FOR ALL TO authenticated
  USING (conference_id IS NOT NULL AND public.is_conference_organizer(conference_id, auth.uid()));

-- Page sections: members can view, organizers can edit
CREATE POLICY "Members can view page sections" ON page_sections
  FOR SELECT TO authenticated
  USING (public.is_conference_member(conference_id, auth.uid()));

CREATE POLICY "Organizers can manage page sections" ON page_sections
  FOR ALL TO authenticated
  USING (public.is_conference_organizer(conference_id, auth.uid()));

-- Design presets: public ones visible to all
CREATE POLICY "Anyone can view public presets" ON design_presets
  FOR SELECT TO authenticated
  USING (is_public = true);

-- AI generations: users can view their own
CREATE POLICY "Users can view own generations" ON ai_style_generations
  FOR SELECT TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can create generations" ON ai_style_generations
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

-- =============================================
-- SEED DATA: System Component Variants
-- =============================================
INSERT INTO component_variants (component_type, variant_name, is_system, config) VALUES
-- Session Card Variants
('session_card', 'minimal', true, '{
  "style": "minimal",
  "showTime": true,
  "showTrack": true,
  "showSpeakerAvatars": true,
  "showLocation": true,
  "borderRadius": "sm",
  "shadow": "none",
  "padding": "md"
}'::jsonb),
('session_card', 'card', true, '{
  "style": "card",
  "showTime": true,
  "showTrack": true,
  "showSpeakerAvatars": true,
  "showLocation": true,
  "showDescription": true,
  "borderRadius": "lg",
  "shadow": "md",
  "padding": "lg"
}'::jsonb),
('session_card', 'compact', true, '{
  "style": "compact",
  "showTime": true,
  "showTrack": false,
  "showSpeakerAvatars": false,
  "showLocation": false,
  "borderRadius": "sm",
  "shadow": "sm",
  "padding": "sm"
}'::jsonb),
('session_card', 'featured', true, '{
  "style": "featured",
  "showTime": true,
  "showTrack": true,
  "showSpeakerAvatars": true,
  "showLocation": true,
  "showDescription": true,
  "showImage": true,
  "borderRadius": "xl",
  "shadow": "lg",
  "padding": "xl",
  "gradient": true
}'::jsonb),
('session_card', 'glass', true, '{
  "style": "glass",
  "showTime": true,
  "showTrack": true,
  "showSpeakerAvatars": true,
  "showLocation": true,
  "borderRadius": "lg",
  "shadow": "none",
  "padding": "lg",
  "blur": true,
  "opacity": 0.8
}'::jsonb),

-- Speaker Card Variants
('speaker_card', 'avatar', true, '{
  "style": "avatar",
  "avatarSize": "lg",
  "showTitle": true,
  "showCompany": true,
  "showBio": false,
  "layout": "vertical"
}'::jsonb),
('speaker_card', 'horizontal', true, '{
  "style": "horizontal",
  "avatarSize": "md",
  "showTitle": true,
  "showCompany": true,
  "showBio": true,
  "layout": "horizontal"
}'::jsonb),
('speaker_card', 'featured', true, '{
  "style": "featured",
  "avatarSize": "xl",
  "showTitle": true,
  "showCompany": true,
  "showBio": true,
  "showSocials": true,
  "layout": "vertical",
  "gradient": true
}'::jsonb),
('speaker_card', 'minimal', true, '{
  "style": "minimal",
  "avatarSize": "sm",
  "showTitle": true,
  "showCompany": false,
  "showBio": false,
  "layout": "horizontal"
}'::jsonb),

-- Navigation Variants
('nav_bar', 'solid', true, '{
  "style": "solid",
  "position": "top",
  "showLogo": true,
  "blur": false
}'::jsonb),
('nav_bar', 'transparent', true, '{
  "style": "transparent",
  "position": "top",
  "showLogo": true,
  "blur": false
}'::jsonb),
('nav_bar', 'glass', true, '{
  "style": "glass",
  "position": "top",
  "showLogo": true,
  "blur": true
}'::jsonb),
('nav_bar', 'bottom', true, '{
  "style": "solid",
  "position": "bottom",
  "showLogo": false,
  "iconOnly": true
}'::jsonb),

-- Hero Variants
('hero', 'full', true, '{
  "style": "full",
  "height": "100vh",
  "overlay": true,
  "overlayOpacity": 0.5,
  "textAlign": "center",
  "showCountdown": true,
  "showCta": true
}'::jsonb),
('hero', 'split', true, '{
  "style": "split",
  "height": "80vh",
  "imagePosition": "right",
  "textAlign": "left",
  "showCountdown": true,
  "showCta": true
}'::jsonb),
('hero', 'minimal', true, '{
  "style": "minimal",
  "height": "50vh",
  "overlay": false,
  "textAlign": "center",
  "showCountdown": false,
  "showCta": true
}'::jsonb),
('hero', 'video', true, '{
  "style": "video",
  "height": "100vh",
  "overlay": true,
  "overlayOpacity": 0.6,
  "textAlign": "center",
  "showCountdown": true,
  "showCta": true,
  "autoplay": true,
  "muted": true
}'::jsonb),

-- Button Variants
('button', 'solid', true, '{
  "style": "solid",
  "borderRadius": "md",
  "shadow": "sm"
}'::jsonb),
('button', 'outline', true, '{
  "style": "outline",
  "borderRadius": "md",
  "borderWidth": 2
}'::jsonb),
('button', 'ghost', true, '{
  "style": "ghost",
  "borderRadius": "md"
}'::jsonb),
('button', 'pill', true, '{
  "style": "solid",
  "borderRadius": "full",
  "shadow": "md"
}'::jsonb),

-- Sponsor Card Variants
('sponsor_card', 'logo', true, '{
  "style": "logo",
  "showName": false,
  "showDescription": false,
  "grayscale": true,
  "hoverColor": true
}'::jsonb),
('sponsor_card', 'card', true, '{
  "style": "card",
  "showName": true,
  "showDescription": true,
  "grayscale": false
}'::jsonb),
('sponsor_card', 'featured', true, '{
  "style": "featured",
  "showName": true,
  "showDescription": true,
  "showCta": true,
  "gradient": true
}'::jsonb)

ON CONFLICT DO NOTHING;

-- =============================================
-- SEED DATA: Design Presets
-- =============================================
INSERT INTO design_presets (name, slug, description, category, tokens, preview_colors, is_featured, tags) VALUES
('Tech Minimal', 'tech-minimal', 'Clean, modern design inspired by Silicon Valley startups', 'tech', '{
  "colors": {
    "primary": "#0066FF",
    "primaryLight": "#3385FF",
    "primaryDark": "#0052CC",
    "secondary": "#6B7280",
    "accent": "#10B981",
    "background": "#FFFFFF",
    "backgroundAlt": "#F9FAFB",
    "surface": "#FFFFFF",
    "text": "#111827",
    "textMuted": "#6B7280",
    "border": "#E5E7EB",
    "error": "#EF4444",
    "success": "#10B981",
    "warning": "#F59E0B"
  },
  "typography": {
    "fontFamily": {
      "heading": "Inter",
      "body": "Inter",
      "mono": "JetBrains Mono"
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
      "5xl": "3rem"
    },
    "fontWeight": {
      "normal": 400,
      "medium": 500,
      "semibold": 600,
      "bold": 700
    },
    "lineHeight": {
      "tight": 1.25,
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
    "3xl": "4rem"
  },
  "borderRadius": {
    "none": "0",
    "sm": "0.25rem",
    "md": "0.5rem",
    "lg": "0.75rem",
    "xl": "1rem",
    "2xl": "1.5rem",
    "full": "9999px"
  },
  "shadows": {
    "none": "none",
    "sm": "0 1px 2px rgba(0,0,0,0.05)",
    "md": "0 4px 6px rgba(0,0,0,0.07)",
    "lg": "0 10px 15px rgba(0,0,0,0.1)",
    "xl": "0 20px 25px rgba(0,0,0,0.15)"
  },
  "animation": {
    "duration": {
      "fast": "150ms",
      "normal": "300ms",
      "slow": "500ms"
    },
    "easing": {
      "default": "cubic-bezier(0.4, 0, 0.2, 1)",
      "in": "cubic-bezier(0.4, 0, 1, 1)",
      "out": "cubic-bezier(0, 0, 0.2, 1)",
      "bounce": "cubic-bezier(0.68, -0.55, 0.265, 1.55)"
    }
  }
}'::jsonb, ARRAY['#0066FF', '#10B981', '#FFFFFF', '#111827'], true, ARRAY['tech', 'startup', 'modern', 'clean']),

('Dark Mode Pro', 'dark-mode-pro', 'Sleek dark theme for developer conferences', 'tech', '{
  "colors": {
    "primary": "#818CF8",
    "primaryLight": "#A5B4FC",
    "primaryDark": "#6366F1",
    "secondary": "#94A3B8",
    "accent": "#22D3EE",
    "background": "#0F172A",
    "backgroundAlt": "#1E293B",
    "surface": "#1E293B",
    "text": "#F1F5F9",
    "textMuted": "#94A3B8",
    "border": "#334155",
    "error": "#F87171",
    "success": "#34D399",
    "warning": "#FBBF24"
  },
  "typography": {
    "fontFamily": {
      "heading": "Space Grotesk",
      "body": "Inter",
      "mono": "JetBrains Mono"
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
      "5xl": "3rem"
    },
    "fontWeight": {
      "normal": 400,
      "medium": 500,
      "semibold": 600,
      "bold": 700
    },
    "lineHeight": {
      "tight": 1.25,
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
    "3xl": "4rem"
  },
  "borderRadius": {
    "none": "0",
    "sm": "0.375rem",
    "md": "0.5rem",
    "lg": "0.75rem",
    "xl": "1rem",
    "2xl": "1.5rem",
    "full": "9999px"
  },
  "shadows": {
    "none": "none",
    "sm": "0 1px 2px rgba(0,0,0,0.3)",
    "md": "0 4px 6px rgba(0,0,0,0.4)",
    "lg": "0 10px 15px rgba(0,0,0,0.5)",
    "xl": "0 20px 25px rgba(0,0,0,0.6)"
  },
  "animation": {
    "duration": {
      "fast": "150ms",
      "normal": "300ms",
      "slow": "500ms"
    },
    "easing": {
      "default": "cubic-bezier(0.4, 0, 0.2, 1)",
      "in": "cubic-bezier(0.4, 0, 1, 1)",
      "out": "cubic-bezier(0, 0, 0.2, 1)",
      "bounce": "cubic-bezier(0.68, -0.55, 0.265, 1.55)"
    }
  }
}'::jsonb, ARRAY['#818CF8', '#22D3EE', '#0F172A', '#F1F5F9'], true, ARRAY['dark', 'developer', 'tech', 'modern']),

('Corporate Executive', 'corporate-executive', 'Professional design for enterprise events', 'corporate', '{
  "colors": {
    "primary": "#1E3A5F",
    "primaryLight": "#2D5A8C",
    "primaryDark": "#152A47",
    "secondary": "#64748B",
    "accent": "#C9A227",
    "background": "#FFFFFF",
    "backgroundAlt": "#F8FAFC",
    "surface": "#FFFFFF",
    "text": "#1E293B",
    "textMuted": "#64748B",
    "border": "#E2E8F0",
    "error": "#DC2626",
    "success": "#16A34A",
    "warning": "#CA8A04"
  },
  "typography": {
    "fontFamily": {
      "heading": "Playfair Display",
      "body": "Source Sans Pro",
      "mono": "IBM Plex Mono"
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
      "5xl": "3rem"
    },
    "fontWeight": {
      "normal": 400,
      "medium": 500,
      "semibold": 600,
      "bold": 700
    },
    "lineHeight": {
      "tight": 1.25,
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
    "3xl": "4rem"
  },
  "borderRadius": {
    "none": "0",
    "sm": "0.125rem",
    "md": "0.25rem",
    "lg": "0.375rem",
    "xl": "0.5rem",
    "2xl": "0.75rem",
    "full": "9999px"
  },
  "shadows": {
    "none": "none",
    "sm": "0 1px 2px rgba(0,0,0,0.05)",
    "md": "0 4px 6px rgba(0,0,0,0.07)",
    "lg": "0 10px 15px rgba(0,0,0,0.1)",
    "xl": "0 20px 25px rgba(0,0,0,0.15)"
  },
  "animation": {
    "duration": {
      "fast": "150ms",
      "normal": "250ms",
      "slow": "400ms"
    },
    "easing": {
      "default": "cubic-bezier(0.4, 0, 0.2, 1)",
      "in": "cubic-bezier(0.4, 0, 1, 1)",
      "out": "cubic-bezier(0, 0, 0.2, 1)",
      "bounce": "cubic-bezier(0.68, -0.55, 0.265, 1.55)"
    }
  }
}'::jsonb, ARRAY['#1E3A5F', '#C9A227', '#FFFFFF', '#1E293B'], true, ARRAY['corporate', 'professional', 'executive', 'enterprise']),

('Creative Festival', 'creative-festival', 'Bold, vibrant design for creative events', 'creative', '{
  "colors": {
    "primary": "#EC4899",
    "primaryLight": "#F472B6",
    "primaryDark": "#DB2777",
    "secondary": "#8B5CF6",
    "accent": "#06B6D4",
    "background": "#FAFAFA",
    "backgroundAlt": "#F5F5F5",
    "surface": "#FFFFFF",
    "text": "#18181B",
    "textMuted": "#71717A",
    "border": "#E4E4E7",
    "error": "#EF4444",
    "success": "#22C55E",
    "warning": "#EAB308"
  },
  "typography": {
    "fontFamily": {
      "heading": "Outfit",
      "body": "DM Sans",
      "mono": "Fira Code"
    },
    "fontSize": {
      "xs": "0.75rem",
      "sm": "0.875rem",
      "base": "1rem",
      "lg": "1.125rem",
      "xl": "1.25rem",
      "2xl": "1.5rem",
      "3xl": "2rem",
      "4xl": "2.5rem",
      "5xl": "3.5rem"
    },
    "fontWeight": {
      "normal": 400,
      "medium": 500,
      "semibold": 600,
      "bold": 800
    },
    "lineHeight": {
      "tight": 1.2,
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
    "3xl": "4rem"
  },
  "borderRadius": {
    "none": "0",
    "sm": "0.5rem",
    "md": "0.75rem",
    "lg": "1rem",
    "xl": "1.5rem",
    "2xl": "2rem",
    "full": "9999px"
  },
  "shadows": {
    "none": "none",
    "sm": "0 2px 4px rgba(236,72,153,0.1)",
    "md": "0 4px 8px rgba(236,72,153,0.15)",
    "lg": "0 8px 16px rgba(236,72,153,0.2)",
    "xl": "0 16px 32px rgba(236,72,153,0.25)"
  },
  "animation": {
    "duration": {
      "fast": "200ms",
      "normal": "400ms",
      "slow": "600ms"
    },
    "easing": {
      "default": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      "in": "cubic-bezier(0.4, 0, 1, 1)",
      "out": "cubic-bezier(0, 0, 0.2, 1)",
      "bounce": "cubic-bezier(0.68, -0.55, 0.265, 1.55)"
    }
  }
}'::jsonb, ARRAY['#EC4899', '#8B5CF6', '#06B6D4', '#18181B'], true, ARRAY['creative', 'festival', 'bold', 'vibrant', 'colorful']),

('Academic Classic', 'academic-classic', 'Refined design for academic conferences', 'academic', '{
  "colors": {
    "primary": "#7C3AED",
    "primaryLight": "#A78BFA",
    "primaryDark": "#6D28D9",
    "secondary": "#059669",
    "accent": "#0891B2",
    "background": "#FFFBEB",
    "backgroundAlt": "#FEF3C7",
    "surface": "#FFFFFF",
    "text": "#1C1917",
    "textMuted": "#57534E",
    "border": "#D6D3D1",
    "error": "#DC2626",
    "success": "#059669",
    "warning": "#D97706"
  },
  "typography": {
    "fontFamily": {
      "heading": "Cormorant Garamond",
      "body": "Lora",
      "mono": "IBM Plex Mono"
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
      "5xl": "3rem"
    },
    "fontWeight": {
      "normal": 400,
      "medium": 500,
      "semibold": 600,
      "bold": 700
    },
    "lineHeight": {
      "tight": 1.3,
      "normal": 1.6,
      "relaxed": 1.8
    }
  },
  "spacing": {
    "xs": "0.25rem",
    "sm": "0.5rem",
    "md": "1rem",
    "lg": "1.5rem",
    "xl": "2rem",
    "2xl": "3rem",
    "3xl": "4rem"
  },
  "borderRadius": {
    "none": "0",
    "sm": "0.125rem",
    "md": "0.25rem",
    "lg": "0.375rem",
    "xl": "0.5rem",
    "2xl": "0.75rem",
    "full": "9999px"
  },
  "shadows": {
    "none": "none",
    "sm": "0 1px 2px rgba(0,0,0,0.04)",
    "md": "0 3px 6px rgba(0,0,0,0.06)",
    "lg": "0 8px 12px rgba(0,0,0,0.08)",
    "xl": "0 16px 24px rgba(0,0,0,0.1)"
  },
  "animation": {
    "duration": {
      "fast": "150ms",
      "normal": "250ms",
      "slow": "400ms"
    },
    "easing": {
      "default": "cubic-bezier(0.4, 0, 0.2, 1)",
      "in": "cubic-bezier(0.4, 0, 1, 1)",
      "out": "cubic-bezier(0, 0, 0.2, 1)",
      "bounce": "cubic-bezier(0.68, -0.55, 0.265, 1.55)"
    }
  }
}'::jsonb, ARRAY['#7C3AED', '#059669', '#FFFBEB', '#1C1917'], true, ARRAY['academic', 'university', 'research', 'classic', 'scholarly'])

ON CONFLICT (slug) DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Design System tables created successfully!';
END $$;
