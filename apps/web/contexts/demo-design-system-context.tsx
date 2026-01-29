'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { DEMO_DESIGN_TOKENS } from '@/lib/demo-data';

// =============================================
// DESIGN TOKEN TYPES (same as main context)
// =============================================

interface ColorTokens {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  background: string;
  backgroundAlt: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  [key: string]: string;
}

interface TypographyTokens {
  fontFamily: {
    heading: string;
    body: string;
    mono: string;
  };
  fontSize: Record<string, string>;
  fontWeight: Record<string, number>;
  lineHeight: Record<string, number>;
}

interface DesignTokens {
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
  animation: {
    duration: Record<string, string>;
    easing: Record<string, string>;
  };
}

// =============================================
// CONTEXT TYPES
// =============================================

interface DesignSystemContextValue {
  tokens: DesignTokens;
  isLoading: boolean;
  conferenceId: string | null;
  setTokens: (tokens: DesignTokens) => void;
  updateColor: (key: string, value: string) => void;
  updateFont: (type: 'heading' | 'body' | 'mono', value: string) => void;
  generateFromPrompt: (prompt: string) => Promise<DesignTokens | null>;
  isGenerating: boolean;
  saveTokens: () => Promise<boolean>;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  applyPreset: (presetSlug: string) => Promise<boolean>;
  getCSSVariables: () => Record<string, string>;
  getCSSString: () => string;
}

const DemoDesignSystemContext = createContext<DesignSystemContextValue | null>(null);

// =============================================
// DEMO PROVIDER - Uses mock data, no persistence
// =============================================

interface DemoDesignSystemProviderProps {
  children: React.ReactNode;
  initialTokens?: DesignTokens;
}

export function DemoDesignSystemProvider({
  children,
  initialTokens,
}: DemoDesignSystemProviderProps) {
  const [tokens, setTokensState] = useState<DesignTokens>(
    initialTokens || (DEMO_DESIGN_TOKENS as unknown as DesignTokens)
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<DesignTokens[]>([tokens]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [savedTokens] = useState<DesignTokens>(tokens);

  const setTokens = useCallback((newTokens: DesignTokens) => {
    setTokensState(newTokens);
    setHistory(prev => [...prev.slice(0, historyIndex + 1), newTokens]);
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const updateColor = useCallback((key: string, value: string) => {
    setTokens({
      ...tokens,
      colors: { ...tokens.colors, [key]: value },
    });
  }, [tokens, setTokens]);

  const updateFont = useCallback((type: 'heading' | 'body' | 'mono', value: string) => {
    setTokens({
      ...tokens,
      typography: {
        ...tokens.typography,
        fontFamily: { ...tokens.typography.fontFamily, [type]: value },
      },
    });
  }, [tokens, setTokens]);

  const generateFromPrompt = useCallback(async (prompt: string): Promise<DesignTokens | null> => {
    setIsGenerating(true);
    try {
      // Still call the AI API - it's read-only and doesn't persist
      const response = await fetch('/api/ai/design-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      if (data.tokens) {
        setTokens(data.tokens);
        return data.tokens;
      }
      return null;
    } catch (error) {
      console.error('Generation error:', error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [setTokens]);

  // Demo mode - save shows alert instead of persisting
  const saveTokens = useCallback(async (): Promise<boolean> => {
    alert('Saving is disabled in demo mode. Sign up to save your designs!');
    return false;
  }, []);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setTokensState(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setTokensState(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  const applyPreset = useCallback(async (presetSlug: string): Promise<boolean> => {
    // For demo, just show alert
    alert('Presets are disabled in demo mode. Sign up to use design presets!');
    return false;
  }, []);

  const getCSSVariables = useCallback(() => {
    const vars: Record<string, string> = {};
    Object.entries(tokens.colors).forEach(([key, value]) => {
      vars[`--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`] = value;
    });
    return vars;
  }, [tokens]);

  const getCSSString = useCallback(() => {
    const vars = getCSSVariables();
    const lines = Object.entries(vars).map(([key, value]) => `  ${key}: ${value};`);
    return `:root {\n${lines.join('\n')}\n}`;
  }, [getCSSVariables]);

  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(tokens) !== JSON.stringify(savedTokens);
  }, [tokens, savedTokens]);

  const value: DesignSystemContextValue = {
    tokens,
    isLoading: false,
    conferenceId: 'demo',
    setTokens,
    updateColor,
    updateFont,
    generateFromPrompt,
    isGenerating,
    saveTokens,
    isSaving: false,
    hasUnsavedChanges,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    applyPreset,
    getCSSVariables,
    getCSSString,
  };

  return (
    <DemoDesignSystemContext.Provider value={value}>
      {children}
    </DemoDesignSystemContext.Provider>
  );
}

export function useDemoDesignSystem() {
  const context = useContext(DemoDesignSystemContext);
  if (!context) {
    throw new Error('useDemoDesignSystem must be used within a DemoDesignSystemProvider');
  }
  return context;
}

// Re-export as useDesignSystem for compatibility with DesignEditor
export { useDemoDesignSystem as useDesignSystem };
