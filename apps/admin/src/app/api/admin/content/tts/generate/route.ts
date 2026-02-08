import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@seedfy/shared/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { TTSGenerateRequest, TTSGenerateResponse } from '@/lib/tts-types';

const KOKORO_BASE_URL = process.env.KOKORO_BASE_URL || 'https://kokoro.producta.cloud/v1';
const KOKORO_API_KEY = process.env.KOKORO_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const body: TTSGenerateRequest = await req.json();
    const { text, voice, speed } = body;

    if (!text || !voice) {
      return NextResponse.json({ error: 'Text and voice are required' }, { status: 400 });
    }

    if (text.length > 6000) {
      return NextResponse.json({ error: 'Text exceeds 6000 characters limit' }, { status: 400 });
    }

    // 1. Get User ID for path isolation
    const cookieStore = await cookies();
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: any) {
             // We don't need to set cookies here, just read
          }
        },
      }
    );
    const { data: { user } } = await supabaseAuth.auth.getUser();
    const userId = user?.id || 'anonymous';

    // 2. Call Kokoro API
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (KOKORO_API_KEY) {
      headers['Authorization'] = `Bearer ${KOKORO_API_KEY}`;
    }

    const kokoroRes = await fetch(`${KOKORO_BASE_URL}/audio/speech`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'kokoro',
        input: text,
        voice,
        response_format: 'mp3',
        speed: speed || 1.0,
        stream: false
      }),
    });

    if (!kokoroRes.ok) {
      const errorText = await kokoroRes.text();
      throw new Error(`Kokoro API error: ${kokoroRes.status} ${errorText}`);
    }

    const audioBuffer = await kokoroRes.arrayBuffer();

    // 3. Upload to Supabase Storage (Temp)
    const supabaseAdmin = createServiceClient(); // Use admin client for storage write access
    const uuid = crypto.randomUUID();
    const tempPath = `content/temp/tts/${userId}/${uuid}.mp3`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('media')
      .upload(tempPath, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: true
      });

    if (uploadError) {
      throw new Error(`Storage upload error: ${uploadError.message}`);
    }

    // 4. Get Signed URL (valid for 1 hour) or Public URL
    // PRD requests Signed URL for temp.
    const { data: signedUrlData, error: signError } = await supabaseAdmin.storage
      .from('media')
      .createSignedUrl(tempPath, 3600); // 1 hour

    if (signError || !signedUrlData?.signedUrl) {
       // Fallback to public URL if signing fails or if bucket is public only
       const { data: publicData } = supabaseAdmin.storage.from('media').getPublicUrl(tempPath);
       if (!publicData.publicUrl) throw new Error('Failed to get audio URL');
       
       const response: TTSGenerateResponse = {
        temp_audio_url: publicData.publicUrl,
        temp_storage_path: tempPath,
        meta: {
            voice,
            speed: speed || 1.0,
            format: 'mp3',
            bytes: audioBuffer.byteLength
        }
       };
       return NextResponse.json(response);
    }

    const response: TTSGenerateResponse = {
      temp_audio_url: signedUrlData.signedUrl,
      temp_storage_path: tempPath,
      meta: {
        voice,
        speed: speed || 1.0,
        format: 'mp3',
        bytes: audioBuffer.byteLength
      }
    };

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('TTS Generate Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
