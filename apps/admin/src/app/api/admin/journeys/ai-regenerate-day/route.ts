import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';
import { BriefingSchema, AIChapterSchema } from '@/lib/ai-schemas';
import { z } from 'zod';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const RegenerateRequestSchema = z.object({
  briefing: BriefingSchema,
  day_index: z.number().int().min(1),
  current_content: AIChapterSchema.partial().optional(), // Context of what exists
  instruction: z.string().optional(), // Specific instruction like "Make it shorter"
});

export async function POST(req: NextRequest) {
  try {
    // 1. Auth Check
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            try {
              // cookieStore.set({ name, value, ...options });
            } catch {}
          },
          remove(name: string, options: any) {
            try {
              // cookieStore.set({ name, value: '', ...options });
            } catch {}
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('AI Regenerate Auth Error:', authError);
      return NextResponse.json({ error: 'Unauthorized', details: authError?.message }, { status: 401 });
    }

    const { data: userProfile } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (!userProfile || (userProfile.role !== 'admin' && userProfile.role !== 'editor')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Parse Body
    const body = await req.json();
    const parseResult = RegenerateRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid request', details: parseResult.error.flatten() }, { status: 400 });
    }

    const { briefing, day_index, current_content, instruction } = parseResult.data;

    // 3. Construct Prompt
    const systemPrompt = `Você é um editor cristão devocional.
Você está REESCREVENDO apenas o capítulo do DIA ${day_index} de uma jornada sobre "${briefing.theme}".
Mantenha o tom ${briefing.tone}.
Instrução específica de ajuste: ${instruction || "Melhore o conteúdo mantendo a estrutura."}
Retorne APENAS um JSON válido para o capítulo.`;

    const userPrompt = `
Contexto atual (pode estar vazio se for novo):
${JSON.stringify(current_content || {})}

Requisitos:
- Dia: ${day_index}
- Tema: ${briefing.theme}
- Oração: ${briefing.include_prayer}
- Versículos: ${briefing.include_verses}

OUTPUT SCHEMA (JSON):
{
  "day_index": ${day_index},
  "title": "string",
  "focus": "string",
  "narrative": "string",
  "practice": "string",
  "reflection_prompt": "string",
  "prayer": "string|null",
  "verse_reference": "string|null",
  "verse_text": "string|null",
  "media_type": null
}
`;

    // 4. Call Groq
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('No content from LLM');

    // 5. Validate
    const jsonOutput = JSON.parse(content);
    const result = AIChapterSchema.safeParse(jsonOutput);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid AI output', details: result.error.flatten() }, { status: 502 });
    }

    return NextResponse.json(result.data);

  } catch (error: any) {
    console.error('AI Regenerate Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
