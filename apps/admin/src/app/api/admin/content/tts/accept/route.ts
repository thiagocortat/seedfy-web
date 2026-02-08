import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@seedfy/shared/server';
import { TTSAcceptRequest, TTSAcceptResponse } from '@/lib/tts-types';

export async function POST(req: NextRequest) {
  try {
    const body: TTSAcceptRequest = await req.json();
    const { temp_storage_path, type = 'podcast', contentId } = body;

    if (!temp_storage_path) {
      return NextResponse.json({ error: 'temp_storage_path is required' }, { status: 400 });
    }

    const supabaseAdmin = createServiceClient();
    
    // Generate Final Path
    const finalId = contentId || crypto.randomUUID();
    const fileName = 'media.mp3'; 
    const finalPath = `content/${type}/${finalId}/${fileName}`;

    // Move File
    const { error: moveError } = await supabaseAdmin.storage
      .from('media')
      .move(temp_storage_path, finalPath);

    if (moveError) {
      throw new Error(`Storage move error: ${moveError.message}`);
    }

    // Get Public URL for the final file
    const { data } = supabaseAdmin.storage.from('media').getPublicUrl(finalPath);
    
    const response: TTSAcceptResponse = {
      final_media_url: data.publicUrl
    };

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('TTS Accept Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
