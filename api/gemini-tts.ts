import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Modality } from '@google/genai';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // Enable CORS
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // Only allow POST requests
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, lang } = request.body;

    if (!text || typeof text !== 'string') {
      return response.status(400).json({ error: 'Text parameter is required' });
    }

    if (!lang || (lang !== 'en' && lang !== 'he')) {
      return response.status(400).json({ error: 'Valid language parameter is required (en or he)' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set');
      return response.status(500).json({ error: 'Server configuration error' });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Say cheerfully: ${text}`;
    
    const aiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: lang === 'he' ? 'Puck' : 'Kore' },
          },
        },
      },
    });

    const base64Audio = aiResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) {
      return response.status(500).json({ error: 'No audio data received from API' });
    }

    // Return the base64 audio data
    return response.status(200).json({ 
      audio: base64Audio,
      format: 'base64'
    });

  } catch (error: any) {
    console.error('Gemini TTS API error:', error);
    return response.status(500).json({ 
      error: 'Failed to generate audio',
      message: error.message 
    });
  }
}

