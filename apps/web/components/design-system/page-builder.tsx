'use client';

import React, { useState, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  GripVertical,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Settings,
  Layout,
  Users,
  Calendar,
  Building,
  MessageSquare,
  BarChart3,
  Clock,
  Image,
  Type,
  Sparkles,
  Map,
  Megaphone,
  X,
  ChevronRight,
} from 'lucide-react';

// =============================================
// SECTION TYPES
// =============================================

interface PageSection {
  id: string;
  sectionType: string;
  config: Record<string, unknown>;
  isVisible: boolean;
}

interface SectionDefinition {
  type: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'content' | 'engagement' | 'layout' | 'custom';
  defaultConfig: Record<string, unknown>;
}

const SECTION_DEFINITIONS: SectionDefinition[] = [
  // Content sections
  {
    type: 'hero',
    name: 'Hero Banner',
    description: 'Large header with image, title, and countdown',
    icon: <Image className="h-5 w-5" />,
    category: 'content',
    defaultConfig: { style: 'full', showCountdown: true, showCta: true },
  },
  {
    type: 'featured_sessions',
    name: 'Featured Sessions',
    description: 'Highlight key sessions or keynotes',
    icon: <Sparkles className="h-5 w-5" />,
    category: 'content',
    defaultConfig: { count: 3, style: 'card' },
  },
  {
    type: 'upcoming_sessions',
    name: 'Upcoming Sessions',
    description: "Show what's happening next",
    icon: <Clock className="h-5 w-5" />,
    category: 'content',
    defaultConfig: { count: 5, showTime: true },
  },
  {
    type: 'session_list',
    name: 'Session List',
    description: 'Scrollable list of all sessions',
    icon: <Calendar className="h-5 w-5" />,
    category: 'content',
    defaultConfig: { groupBy: 'time', showFilters: true },
  },
  {
    type: 'speaker_grid',
    name: 'Speaker Grid',
    description: 'Grid of speaker photos and names',
    icon: <Users className="h-5 w-5" />,
    category: 'content',
    defaultConfig: { columns: 3, style: 'avatar' },
  },
  {
    type: 'speaker_carousel',
    name: 'Speaker Carousel',
    description: 'Swipeable carousel of speakers',
    icon: <Users className="h-5 w-5" />,
    category: 'content',
    defaultConfig: { autoplay: true, style: 'featured' },
  },
  {
    type: 'sponsor_grid',
    name: 'Sponsor Grid',
    description: 'Grid of sponsor logos by tier',
    icon: <Building className="h-5 w-5" />,
    category: 'content',
    defaultConfig: { groupByTier: true, style: 'logo' },
  },
  {
    type: 'sponsor_ticker',
    name: 'Sponsor Ticker',
    description: 'Scrolling sponsor logos',
    icon: <Building className="h-5 w-5" />,
    category: 'content',
    defaultConfig: { speed: 'normal', direction: 'left' },
  },
  {
    type: 'tracks_overview',
    name: 'Tracks Overview',
    description: 'Show conference tracks/themes',
    icon: <Layout className="h-5 w-5" />,
    category: 'content',
    defaultConfig: { style: 'cards', showSessionCount: true },
  },
  {
    type: 'venue_map',
    name: 'Venue Map',
    description: 'Interactive venue floor plan',
    icon: <Map className="h-5 w-5" />,
    category: 'content',
    defaultConfig: { interactive: true, showRooms: true },
  },

  // Engagement sections
  {
    type: 'countdown',
    name: 'Countdown Timer',
    description: 'Countdown to event start',
    icon: <Clock className="h-5 w-5" />,
    category: 'engagement',
    defaultConfig: { style: 'large', showLabels: true },
  },
  {
    type: 'live_poll',
    name: 'Live Poll',
    description: 'Interactive poll widget',
    icon: <BarChart3 className="h-5 w-5" />,
    category: 'engagement',
    defaultConfig: { showResults: true, animated: true },
  },
  {
    type: 'announcements',
    name: 'Announcements',
    description: 'Latest news and updates',
    icon: <Megaphone className="h-5 w-5" />,
    category: 'engagement',
    defaultConfig: { count: 3, style: 'card' },
  },
  {
    type: 'networking_cta',
    name: 'Networking CTA',
    description: 'Call to action for networking',
    icon: <MessageSquare className="h-5 w-5" />,
    category: 'engagement',
    defaultConfig: { style: 'banner', showStats: true },
  },

  // Layout sections
  {
    type: 'divider',
    name: 'Divider',
    description: 'Visual separator',
    icon: <Type className="h-5 w-5" />,
    category: 'layout',
    defaultConfig: { style: 'line' },
  },
  {
    type: 'spacer',
    name: 'Spacer',
    description: 'Empty space between sections',
    icon: <Layout className="h-5 w-5" />,
    category: 'layout',
    defaultConfig: { height: 'md' },
  },
  {
    type: 'custom_html',
    name: 'Custom HTML',
    description: 'Embed custom content',
    icon: <Type className="h-5 w-5" />,
    category: 'custom',
    defaultConfig: { html: '' },
  },
];

// =============================================
// SORTABLE SECTION COMPONENT
// =============================================

interface SortableSectionProps {
  section: PageSection;
  onToggleVisibility: (id: string) => void;
  onRemove: (id: string) => void;
  onConfigure: (id: string) => void;
}

function SortableSection({
  section,
  onToggleVisibility,
  onRemove,
  onConfigure,
}: SortableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const definition = SECTION_DEFINITIONS.find((d) => d.type === section.sectionType);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative flex items-center gap-3 rounded-lg border bg-card p-4 transition-all',
        isDragging && 'opacity-50 shadow-lg',
        !section.isVisible && 'opacity-60'
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none rounded p-1 hover:bg-muted active:cursor-grabbing"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>

      {/* Section info */}
      <div className="flex flex-1 items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {definition?.icon}
        </div>
        <div>
          <p className="font-medium">{definition?.name || section.sectionType}</p>
          <p className="text-sm text-muted-foreground">{definition?.description}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onToggleVisibility(section.id)}
          className="h-8 w-8"
        >
          {section.isVisible ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onConfigure(section.id)}
          className="h-8 w-8"
        >
          <Settings className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(section.id)}
          className="h-8 w-8 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// =============================================
// SECTION PICKER PANEL
// =============================================

interface SectionPickerProps {
  onSelect: (type: string) => void;
  onClose: () => void;
}

function SectionPicker({ onSelect, onClose }: SectionPickerProps) {
  const categories = ['content', 'engagement', 'layout', 'custom'] as const;
  const categoryNames: Record<string, string> = {
    content: 'Content',
    engagement: 'Engagement',
    layout: 'Layout',
    custom: 'Custom',
  };

  return (
    <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border bg-card p-4 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">Add Section</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="max-h-96 space-y-4 overflow-y-auto">
        {categories.map((category) => {
          const sections = SECTION_DEFINITIONS.filter((s) => s.category === category);
          if (sections.length === 0) return null;

          return (
            <div key={category}>
              <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                {categoryNames[category]}
              </p>
              <div className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.type}
                    onClick={() => {
                      onSelect(section.type);
                      onClose();
                    }}
                    className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary">
                      {section.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{section.name}</p>
                      <p className="text-xs text-muted-foreground">{section.description}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =============================================
// MAIN PAGE BUILDER COMPONENT
// =============================================

interface PageBuilderProps {
  pageType: string;
  sections: PageSection[];
  onSectionsChange: (sections: PageSection[]) => void;
  onSectionConfigure?: (sectionId: string) => void;
}

export function PageBuilder({
  pageType,
  sections,
  onSectionsChange,
  onSectionConfigure,
}: PageBuilderProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      onSectionsChange(arrayMove(sections, oldIndex, newIndex));
    }

    setActiveId(null);
  };

  const handleAddSection = useCallback((type: string) => {
    const definition = SECTION_DEFINITIONS.find((d) => d.type === type);
    if (!definition) return;

    const newSection: PageSection = {
      id: crypto.randomUUID(),
      sectionType: type,
      config: { ...definition.defaultConfig },
      isVisible: true,
    };

    onSectionsChange([...sections, newSection]);
  }, [sections, onSectionsChange]);

  const handleToggleVisibility = useCallback((id: string) => {
    onSectionsChange(
      sections.map((s) =>
        s.id === id ? { ...s, isVisible: !s.isVisible } : s
      )
    );
  }, [sections, onSectionsChange]);

  const handleRemove = useCallback((id: string) => {
    onSectionsChange(sections.filter((s) => s.id !== id));
  }, [sections, onSectionsChange]);

  const handleConfigure = useCallback((id: string) => {
    onSectionConfigure?.(id);
  }, [onSectionConfigure]);

  const activeSection = activeId
    ? sections.find((s) => s.id === activeId)
    : null;
  const activeDefinition = activeSection
    ? SECTION_DEFINITIONS.find((d) => d.type === activeSection.sectionType)
    : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg">Page Sections</CardTitle>
          <p className="text-sm text-muted-foreground">
            Drag to reorder, click to configure
          </p>
        </div>
        <div className="relative">
          <Button
            onClick={() => setShowPicker(!showPicker)}
            size="sm"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Section
          </Button>
          {showPicker && (
            <SectionPicker
              onSelect={handleAddSection}
              onClose={() => setShowPicker(false)}
            />
          )}
        </div>
      </CardHeader>

      <CardContent>
        {sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-12 text-center">
            <Layout className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="mb-2 font-medium">No sections yet</p>
            <p className="mb-4 text-sm text-muted-foreground">
              Add sections to build your page layout
            </p>
            <Button
              variant="outline"
              onClick={() => setShowPicker(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add First Section
            </Button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {sections.map((section) => (
                  <SortableSection
                    key={section.id}
                    section={section}
                    onToggleVisibility={handleToggleVisibility}
                    onRemove={handleRemove}
                    onConfigure={handleConfigure}
                  />
                ))}
              </div>
            </SortableContext>

            <DragOverlay>
              {activeSection && activeDefinition && (
                <div className="flex items-center gap-3 rounded-lg border bg-card p-4 shadow-xl">
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {activeDefinition.icon}
                  </div>
                  <div>
                    <p className="font-medium">{activeDefinition.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {activeDefinition.description}
                    </p>
                  </div>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </CardContent>
    </Card>
  );
}

// =============================================
// SECTION CONFIG PANEL
// =============================================

interface SectionConfigPanelProps {
  section: PageSection | null;
  onConfigChange: (config: Record<string, unknown>) => void;
  onClose: () => void;
}

export function SectionConfigPanel({
  section,
  onConfigChange,
  onClose,
}: SectionConfigPanelProps) {
  if (!section) return null;

  const definition = SECTION_DEFINITIONS.find((d) => d.type === section.sectionType);

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-96 border-l bg-background shadow-xl">
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {definition?.icon}
          </div>
          <div>
            <p className="font-semibold">{definition?.name}</p>
            <p className="text-sm text-muted-foreground">Configure section</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="p-4">
        <p className="text-sm text-muted-foreground">
          Section configuration options will appear here based on the section type.
        </p>
        {/* TODO: Add section-specific config UI */}
        <pre className="mt-4 rounded bg-muted p-4 text-xs">
          {JSON.stringify(section.config, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export { SECTION_DEFINITIONS };
export type { PageSection, SectionDefinition };
