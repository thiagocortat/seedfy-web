export interface KokoroVoice {
  id: string;
  name: string;
}

export interface TTSGenerateRequest {
  text: string;
  voice: string;
  speed: number;
}

export interface TTSGenerateResponse {
  temp_audio_url: string;
  temp_storage_path: string;
  meta: {
    voice: string;
    speed: number;
    format: string;
    bytes: number;
  };
}

export interface TTSAcceptRequest {
  temp_storage_path: string;
  type?: string;
  contentId?: string;
}

export interface TTSAcceptResponse {
  final_media_url: string;
}

export interface KokoroVoicesResponse {
  voices: string[];
}
