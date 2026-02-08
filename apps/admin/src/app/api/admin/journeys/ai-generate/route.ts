import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';
import { BriefingSchema, JourneyAIOutputSchema } from '@/lib/ai-schemas';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
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
      console.error('AI Generate Auth Error:', authError);
      return NextResponse.json({ error: 'Unauthorized', details: authError?.message }, { status: 401 });
    }

    // Check Role
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userProfile || (userProfile.role !== 'admin' && userProfile.role !== 'editor')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Parse Body
    const body = await req.json();
    const briefingResult = BriefingSchema.safeParse(body.briefing);

    if (!briefingResult.success) {
      return NextResponse.json(
        { error: 'Invalid briefing', details: briefingResult.error.flatten() },
        { status: 400 }
      );
    }

    const briefing = briefingResult.data;

    // 3. Construct Prompt
    const systemPrompt = `Você é um editor cristão devocional em português (pt-BR).
Você escreve conteúdo pastoral com tom ${briefing.tone} e linguagem acessível para o público: ${briefing.audience || 'Geral'}.
Gere uma jornada diária com capítulos do dia 1 ao dia ${briefing.max_days}.
Cada capítulo deve conter narrativa, prática, pergunta, oração (se habilitado) e versículo (se habilitado).
Evite linguagem denominacional e polêmica; não critique igrejas, grupos ou pessoas.
Não faça aconselhamento médico/psicológico prescritivo; no máximo encoraje procurar ajuda profissional quando aplicável.
Retorne APENAS um JSON válido seguindo o schema fornecido. Sem markdown, sem texto extra.`;

    const userPrompt = `
Gere uma Jornada Devocional baseada neste briefing:
- Tema: ${briefing.theme}
- Objetivos: ${briefing.goal?.join(', ') || 'Geral'}
- Tom: ${briefing.tone}
- Público: ${briefing.audience || 'Geral'}
- Idioma: pt-BR
- Restrições:
  - Evitar denominacionalismo: ${briefing.avoid_denomination}
  - Evitar polêmicas: ${briefing.avoid_polemics}
- Incluir oração: ${briefing.include_prayer}
- Incluir versículos: ${briefing.include_verses}
- Referências bíblicas preferidas: ${briefing.reference_bible || 'Livre'}
- Durações suportadas: ${JSON.stringify(briefing.durations_supported)}
- Gerar até ${briefing.max_days} dias
- Tags sugeridas: ${briefing.tags_suggested?.join(', ') || ''}

Regras editoriais por capítulo:
- title: curto e memorável
- focus: 1 linha (frase de foco)
- narrative: 700–1200 caracteres (1–2 parágrafos reflexivos)
- practice: 1 ação concreta e simples para o dia
- reflection_prompt: 1 pergunta aberta para o usuário responder
- prayer: 1 parágrafo curto (se habilitado)
- verse_reference e verse_text: 1 versículo chave (se habilitado)

OUTPUT SCHEMA (JSON):
{
  "journey": {
    "title": "string",
    "description_short": "string",
    "description_long": "string",
    "cover_image_query": "string (descrição visual para buscar imagem)",
    "cover_image_url": null,
    "tags": ["string"],
    "durations_supported": [${briefing.durations_supported.join(',')}],
    "language": "pt-BR"
  },
  "chapters": [
    {
      "day_index": number (1..${briefing.max_days}),
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
  ],
  "safety": {
    "notes": "string (observações sobre conteúdo sensível se houver)",
    "risk_flags": ["none" | "sensitive_topic" | "medical_advice"]
  }
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
      max_tokens: 8000,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from LLM');
    }

    // 5. Validate Output
    let jsonOutput;
    try {
      jsonOutput = JSON.parse(content);
    } catch (e) {
        console.error("JSON Parse Error", content);
        return NextResponse.json({ error: 'Failed to parse LLM response as JSON' }, { status: 502 });
    }

    const result = JourneyAIOutputSchema.safeParse(jsonOutput);

    if (!result.success) {
      console.error("Zod Validation Error", result.error);
      return NextResponse.json(
        { error: 'Invalid AI output structure', details: result.error.flatten(), raw: jsonOutput },
        { status: 502 }
      );
    }

    // 6. Return Data
    return NextResponse.json(result.data);

  } catch (error: any) {
    console.error('AI Generate Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
