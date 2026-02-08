import { z } from 'zod';

export const BriefingSchema = z.object({
  theme: z.string().min(3).max(120),
  goal: z.array(z.string()).optional(),
  tone: z.enum(['Acolhedor', 'Direto', 'Contemplativo', 'Didático']).default('Acolhedor'),
  audience: z.enum(['Geral', 'Novos convertidos', 'Jovens', 'Líderes', 'Casais', 'Mulheres', 'Homens']).optional(),
  language: z.literal('pt-BR').default('pt-BR'),
  avoid_denomination: z.boolean().default(true),
  avoid_polemics: z.boolean().default(true),
  include_prayer: z.boolean().default(true),
  include_verses: z.boolean().default(true),
  tags_suggested: z.array(z.string()).max(6).optional(),
  durations_supported: z.array(z.number()).default([7, 14, 21]),
  max_days: z.number().min(1).max(365), // Usually one of durations_supported
  reference_bible: z.string().optional(),
});

export type Briefing = z.infer<typeof BriefingSchema>;

export const AIChapterSchema = z.object({
  day_index: z.number().int().min(1),
  title: z.string(),
  focus: z.string(),
  narrative: z.string(),
  practice: z.string(),
  reflection_prompt: z.string(),
  prayer: z.string().nullable().optional(),
  verse_reference: z.string().nullable().optional(),
  verse_text: z.string().nullable().optional(),
  media_type: z.literal(null).default(null),
});

export type AIChapter = z.infer<typeof AIChapterSchema>;

export const AISafetySchema = z.object({
  notes: z.string().optional(),
  risk_flags: z.array(z.string()).default(['none']),
});

export const AIJourneySchema = z.object({
  title: z.string(),
  description_short: z.string(),
  description_long: z.string(),
  cover_image_query: z.string(),
  cover_image_url: z.literal(null).default(null),
  tags: z.array(z.string()),
  durations_supported: z.array(z.number()),
  language: z.literal('pt-BR'),
});

export const JourneyAIOutputSchema = z.object({
  journey: AIJourneySchema,
  chapters: z.array(AIChapterSchema),
  safety: AISafetySchema,
});

export type JourneyAIOutput = z.infer<typeof JourneyAIOutputSchema>;
