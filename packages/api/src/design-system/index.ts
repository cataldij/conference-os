// =============================================
// CONFERENCE OS: Design System API
// =============================================

import { supabase } from '../supabase';
import type {
  DesignTokens,
  DesignTokensRecord,
  ComponentVariant,
  ComponentType,
  PageSection,
  PageType,
  SectionType,
  DesignPreset,
  AIStyleGeneration,
  AIStylePrompt,
  CSSVariables,
  DEFAULT_TOKENS,
} from './types';

export * from './types';

// =============================================
// CSS VARIABLE GENERATION
// =============================================

/**
 * Convert design tokens to CSS custom properties
 */
export function tokensToCSSVariables(tokens: DesignTokens): CSSVariables {
  const vars: CSSVariables = {};

  // Colors
  Object.entries(tokens.colors).forEach(([key, value]) => {
    if (typeof value === 'string') {
      vars[`--color-${kebabCase(key)}`] = value;
    }
  });

  // Typography - Font Families
  Object.entries(tokens.typography.fontFamily).forEach(([key, value]) => {
    vars[`--font-${key}`] = value;
  });

  // Typography - Font Sizes
  Object.entries(tokens.typography.fontSize).forEach(([key, value]) => {
    vars[`--text-${key}`] = value;
  });

  // Typography - Font Weights
  Object.entries(tokens.typography.fontWeight).forEach(([key, value]) => {
    vars[`--font-weight-${key}`] = String(value);
  });

  // Typography - Line Heights
  Object.entries(tokens.typography.lineHeight).forEach(([key, value]) => {
    vars[`--leading-${key}`] = String(value);
  });

  // Spacing
  Object.entries(tokens.spacing).forEach(([key, value]) => {
    vars[`--space-${key}`] = value;
  });

  // Border Radius
  Object.entries(tokens.borderRadius).forEach(([key, value]) => {
    vars[`--radius-${key}`] = value;
  });

  // Shadows
  Object.entries(tokens.shadows).forEach(([key, value]) => {
    vars[`--shadow-${key}`] = value;
  });

  // Animation
  Object.entries(tokens.animation.duration).forEach(([key, value]) => {
    vars[`--duration-${key}`] = value;
  });
  Object.entries(tokens.animation.easing).forEach(([key, value]) => {
    vars[`--ease-${key}`] = value;
  });

  return vars;
}

/**
 * Generate a CSS stylesheet from tokens
 */
export function tokensToCSS(tokens: DesignTokens): string {
  const vars = tokensToCSSVariables(tokens);
  const lines = Object.entries(vars).map(([key, value]) => `  ${key}: ${value};`);
  return `:root {\n${lines.join('\n')}\n}`;
}

function kebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

// =============================================
// DESIGN TOKENS CRUD
// =============================================

/**
 * Get active design tokens for a conference
 */
export async function getDesignTokens(conferenceId: string): Promise<DesignTokensRecord | null> {
  const { data, error } = await supabase
    .from('design_tokens')
    .select('*')
    .eq('conference_id', conferenceId)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error fetching design tokens:', error);
    return null;
  }

  return data ? mapDesignTokensRecord(data) : null;
}

/**
 * Get all versions of design tokens for a conference (for undo/redo)
 */
export async function getDesignTokensHistory(conferenceId: string): Promise<DesignTokensRecord[]> {
  const { data, error } = await supabase
    .from('design_tokens')
    .select('*')
    .eq('conference_id', conferenceId)
    .order('version', { ascending: false });

  if (error) {
    console.error('Error fetching design tokens history:', error);
    return [];
  }

  return data?.map(mapDesignTokensRecord) || [];
}

/**
 * Save new design tokens (creates new version)
 */
export async function saveDesignTokens(
  conferenceId: string,
  tokens: DesignTokens
): Promise<DesignTokensRecord | null> {
  // Get current version
  const current = await getDesignTokens(conferenceId);
  const newVersion = current ? current.version + 1 : 1;

  // Deactivate current version
  if (current) {
    await supabase
      .from('design_tokens')
      .update({ is_active: false })
      .eq('id', current.id);
  }

  // Insert new version
  const { data, error } = await supabase
    .from('design_tokens')
    .insert({
      conference_id: conferenceId,
      version: newVersion,
      is_active: true,
      tokens,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving design tokens:', error);
    return null;
  }

  return data ? mapDesignTokensRecord(data) : null;
}

/**
 * Revert to a previous version
 */
export async function revertToVersion(
  conferenceId: string,
  version: number
): Promise<DesignTokensRecord | null> {
  // Get the version to revert to
  const { data: oldVersion, error: fetchError } = await supabase
    .from('design_tokens')
    .select('*')
    .eq('conference_id', conferenceId)
    .eq('version', version)
    .single();

  if (fetchError || !oldVersion) {
    console.error('Error fetching version:', fetchError);
    return null;
  }

  // Save as new version
  return saveDesignTokens(conferenceId, oldVersion.tokens);
}

function mapDesignTokensRecord(data: any): DesignTokensRecord {
  return {
    id: data.id,
    conferenceId: data.conference_id,
    version: data.version,
    isActive: data.is_active,
    tokens: data.tokens,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    createdBy: data.created_by,
  };
}

// =============================================
// COMPONENT VARIANTS
// =============================================

/**
 * Get all system variants for a component type
 */
export async function getSystemVariants(componentType: ComponentType): Promise<ComponentVariant[]> {
  const { data, error } = await supabase
    .from('component_variants')
    .select('*')
    .eq('component_type', componentType)
    .eq('is_system', true);

  if (error) {
    console.error('Error fetching system variants:', error);
    return [];
  }

  return data?.map(mapComponentVariant) || [];
}

/**
 * Get all variants for a conference (system + custom)
 */
export async function getConferenceVariants(
  conferenceId: string,
  componentType?: ComponentType
): Promise<ComponentVariant[]> {
  let query = supabase
    .from('component_variants')
    .select('*')
    .or(`is_system.eq.true,conference_id.eq.${conferenceId}`);

  if (componentType) {
    query = query.eq('component_type', componentType);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching variants:', error);
    return [];
  }

  return data?.map(mapComponentVariant) || [];
}

/**
 * Create a custom variant for a conference
 */
export async function createCustomVariant(
  conferenceId: string,
  componentType: ComponentType,
  variantName: string,
  config: Record<string, unknown>
): Promise<ComponentVariant | null> {
  const { data, error } = await supabase
    .from('component_variants')
    .insert({
      component_type: componentType,
      variant_name: variantName,
      is_system: false,
      conference_id: conferenceId,
      config,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating variant:', error);
    return null;
  }

  return data ? mapComponentVariant(data) : null;
}

function mapComponentVariant(data: any): ComponentVariant {
  return {
    id: data.id,
    componentType: data.component_type,
    variantName: data.variant_name,
    isSystem: data.is_system,
    conferenceId: data.conference_id,
    config: data.config,
    previewImageUrl: data.preview_image_url,
  };
}

// =============================================
// PAGE SECTIONS
// =============================================

/**
 * Get all sections for a page
 */
export async function getPageSections(
  conferenceId: string,
  pageType: PageType
): Promise<PageSection[]> {
  const { data, error } = await supabase
    .from('page_sections')
    .select('*')
    .eq('conference_id', conferenceId)
    .eq('page_type', pageType)
    .order('section_order');

  if (error) {
    console.error('Error fetching page sections:', error);
    return [];
  }

  return data?.map(mapPageSection) || [];
}

/**
 * Save page sections (replaces all sections for a page)
 */
export async function savePageSections(
  conferenceId: string,
  pageType: PageType,
  sections: Omit<PageSection, 'id' | 'conferenceId' | 'pageType'>[]
): Promise<PageSection[]> {
  // Delete existing sections
  await supabase
    .from('page_sections')
    .delete()
    .eq('conference_id', conferenceId)
    .eq('page_type', pageType);

  // Insert new sections
  const { data, error } = await supabase
    .from('page_sections')
    .insert(
      sections.map((section, index) => ({
        conference_id: conferenceId,
        page_type: pageType,
        section_type: section.sectionType,
        section_order: section.sectionOrder ?? index,
        config: section.config,
        variant_id: section.variantId,
        is_visible: section.isVisible ?? true,
        visible_from: section.visibleFrom,
        visible_until: section.visibleUntil,
      }))
    )
    .select();

  if (error) {
    console.error('Error saving page sections:', error);
    return [];
  }

  return data?.map(mapPageSection) || [];
}

/**
 * Reorder sections
 */
export async function reorderSections(
  conferenceId: string,
  pageType: PageType,
  sectionIds: string[]
): Promise<boolean> {
  const updates = sectionIds.map((id, index) =>
    supabase
      .from('page_sections')
      .update({ section_order: index })
      .eq('id', id)
      .eq('conference_id', conferenceId)
  );

  const results = await Promise.all(updates);
  return results.every((r) => !r.error);
}

function mapPageSection(data: any): PageSection {
  return {
    id: data.id,
    conferenceId: data.conference_id,
    pageType: data.page_type,
    sectionType: data.section_type,
    sectionOrder: data.section_order,
    config: data.config,
    variantId: data.variant_id,
    isVisible: data.is_visible,
    visibleFrom: data.visible_from,
    visibleUntil: data.visible_until,
  };
}

// =============================================
// DESIGN PRESETS
// =============================================

/**
 * Get all public design presets
 */
export async function getDesignPresets(category?: string): Promise<DesignPreset[]> {
  let query = supabase
    .from('design_presets')
    .select('*')
    .eq('is_public', true)
    .order('is_featured', { ascending: false })
    .order('name');

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching presets:', error);
    return [];
  }

  return data?.map(mapDesignPreset) || [];
}

/**
 * Get featured presets
 */
export async function getFeaturedPresets(): Promise<DesignPreset[]> {
  const { data, error } = await supabase
    .from('design_presets')
    .select('*')
    .eq('is_public', true)
    .eq('is_featured', true)
    .order('name');

  if (error) {
    console.error('Error fetching featured presets:', error);
    return [];
  }

  return data?.map(mapDesignPreset) || [];
}

/**
 * Apply a preset to a conference
 */
export async function applyPreset(
  conferenceId: string,
  presetSlug: string
): Promise<boolean> {
  const { data: preset, error: fetchError } = await supabase
    .from('design_presets')
    .select('*')
    .eq('slug', presetSlug)
    .single();

  if (fetchError || !preset) {
    console.error('Error fetching preset:', fetchError);
    return false;
  }

  // Save the tokens
  const saved = await saveDesignTokens(conferenceId, preset.tokens);
  if (!saved) return false;

  // Apply default sections if provided
  if (preset.default_sections && preset.default_sections.length > 0) {
    // Group sections by page type
    const sectionsByPage = preset.default_sections.reduce((acc: Record<string, any[]>, section: any) => {
      const pageType = section.pageType || 'home';
      if (!acc[pageType]) acc[pageType] = [];
      acc[pageType].push(section);
      return acc;
    }, {});

    // Save sections for each page
    for (const [pageType, sections] of Object.entries(sectionsByPage)) {
      await savePageSections(conferenceId, pageType as PageType, sections as any[]);
    }
  }

  return true;
}

function mapDesignPreset(data: any): DesignPreset {
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description,
    category: data.category,
    tokens: data.tokens,
    defaultSections: data.default_sections || [],
    defaultVariants: data.default_variants || {},
    previewImageUrl: data.preview_image_url,
    previewColors: data.preview_colors || [],
    isPublic: data.is_public,
    isFeatured: data.is_featured,
    tags: data.tags || [],
  };
}

// =============================================
// AI STYLE GENERATION
// =============================================

/**
 * Generate styles using AI
 */
export async function generateStyles(prompt: AIStylePrompt): Promise<DesignTokens | null> {
  const response = await fetch('/api/ai/design-tokens', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prompt),
  });

  if (!response.ok) {
    console.error('Error generating styles');
    return null;
  }

  const data = await response.json();
  return data.tokens;
}

/**
 * Save AI generation for tracking
 */
export async function saveAIGeneration(
  generation: Omit<AIStyleGeneration, 'id' | 'createdAt'>
): Promise<AIStyleGeneration | null> {
  const { data, error } = await supabase
    .from('ai_style_generations')
    .insert({
      conference_id: generation.conferenceId,
      prompt: generation.prompt,
      reference_url: generation.referenceUrl,
      brand_assets: generation.brandAssets,
      generated_tokens: generation.generatedTokens,
      generation_model: generation.generationModel,
      was_accepted: generation.wasAccepted,
      user_rating: generation.userRating,
      created_by: generation.createdBy,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving AI generation:', error);
    return null;
  }

  return data ? {
    id: data.id,
    conferenceId: data.conference_id,
    prompt: data.prompt,
    referenceUrl: data.reference_url,
    brandAssets: data.brand_assets,
    generatedTokens: data.generated_tokens,
    generationModel: data.generation_model,
    wasAccepted: data.was_accepted,
    userRating: data.user_rating,
    createdAt: data.created_at,
    createdBy: data.created_by,
  } : null;
}

/**
 * Rate an AI generation
 */
export async function rateAIGeneration(
  generationId: string,
  rating: number,
  wasAccepted: boolean
): Promise<boolean> {
  const { error } = await supabase
    .from('ai_style_generations')
    .update({
      user_rating: rating,
      was_accepted: wasAccepted,
    })
    .eq('id', generationId);

  return !error;
}
