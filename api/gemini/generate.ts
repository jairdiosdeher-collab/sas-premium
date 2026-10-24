import type { IncomingMessage, ServerResponse } from 'http';
import { GoogleGenAI } from '@google/genai';

function extractGroundingSources(response: any): Array<{ title: string; url: string }> {
  const chunks = response?.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (!Array.isArray(chunks)) return [];
  const seen = new Set<string>();
  return chunks.flatMap((chunk: any) => {
    const web = chunk?.web;
    const url = typeof web?.uri === 'string' ? web.uri : '';
    if (!url || !/^https?:\/\//i.test(url) || seen.has(url)) return [];
    seen.add(url);
    return [{ title: typeof web.title === 'string' && web.title.trim() ? web.title : url, url }];
  }).slice(0, 12);
}

async function parseBody(req: IncomingMessage): Promise<any> {
  if ((req as any).body) {
    return (req as any).body;
  }
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Método no permitido. Utiliza POST.' } }));
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim().length === 0) {
    res.statusCode = 503;
    return res.end(JSON.stringify({
      success: false,
      error: {
        code: 'MISSING_API_KEY',
        message: 'Servidor Vercel sin GEMINI_API_KEY configurada.',
        hint: 'Ve al panel de Vercel > Settings > Environment Variables y añade GEMINI_API_KEY con tu clave de Google AI Studio.',
      },
    }));
  }

  let body: any = {};
  try {
    body = await parseBody(req);
  } catch (_e) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ success: false, error: { code: 'INVALID_JSON', message: 'Cuerpo de solicitud JSON inválido.' } }));
  }

  const { prompt, systemInstruction, responseMimeType } = body;
  const enableWebSearch = body.enableWebSearch === true;
  if (!prompt || typeof prompt !== 'string') {
    res.statusCode = 400;
    return res.end(JSON.stringify({ success: false, error: { code: 'INVALID_PROMPT', message: 'El campo "prompt" es requerido.' } }));
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'pastoralmente-ai-vercel',
        },
      },
    });

    const config: any = {};
    if (systemInstruction) config.systemInstruction = systemInstruction;
    if (responseMimeType) config.responseMimeType = responseMimeType;
    if (enableWebSearch) config.tools = [{ googleSearch: {} }];

    let responseText = '';
    let groundingSources: Array<{ title: string; url: string }> = [];
    let modelUsed = 'gemini-3.8-flash';

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: Object.keys(config).length > 0 ? config : undefined,
      });
      responseText = response.text || '';
      groundingSources = extractGroundingSources(response);
    } catch (err: any) {
      console.warn('Vercel Gemini 3.8 Flash aviso, intentando con 3.1 Flash Lite:', err?.message || err);
      modelUsed = 'gemini-3.1-flash-lite';
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: Object.keys(config).length > 0 ? config : undefined,
      });
      responseText = fallbackResponse.text || '';
      groundingSources = extractGroundingSources(fallbackResponse);
    }

    if (!responseText.trim()) {
      res.statusCode = 502;
      return res.end(JSON.stringify({
        success: false,
        error: { code: 'EMPTY_RESPONSE', message: 'Respuesta vacía recibida de Gemini.' },
      }));
    }

    res.statusCode = 200;
    return res.end(JSON.stringify({
      success: true,
      text: responseText,
      modelUsed,
      groundingSources,
      webSearchRequested: enableWebSearch,
      environment: 'vercel-serverless',
    }));
  } catch (error: any) {
    const errorMessage = error?.message || String(error);
    console.error('Error en Vercel Gemini handler:', errorMessage);
    res.statusCode = 502;
    return res.end(JSON.stringify({
      success: false,
      error: { code: 'GEMINI_API_ERROR', message: errorMessage },
    }));
  }
}
