import { NextResponse } from 'next/server';

const KOKORO_BASE_URL = process.env.KOKORO_BASE_URL || 'https://kokoro.producta.cloud/v1';
const KOKORO_API_KEY = process.env.KOKORO_API_KEY;

export async function GET() {
  try {
    const headers: HeadersInit = {
      'Accept': 'application/json',
    };

    if (KOKORO_API_KEY) {
      headers['Authorization'] = `Bearer ${KOKORO_API_KEY}`;
    }

    const res = await fetch(`${KOKORO_BASE_URL}/audio/voices`, {
      headers,
      next: { revalidate: 600 } // Cache for 10 minutes
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch voices: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching voices:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
