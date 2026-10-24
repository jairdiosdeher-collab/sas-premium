import type { IncomingMessage, ServerResponse } from 'http';
import { GoogleGenAI } from '@google/genai';

async function parseBody(req: IncomingMessage): Promise<any> {
  if ((req as any).body) return (req as any).body;
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 20_000) reject(new Error('REQUEST_TOO_LARGE'));
    });
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch (error) { reject(error); }
    });
    req.on('error', reject);
  });
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ success: false, error: 'Método no permitido. Utiliza POST.' }));
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.statusCode = 503;
    return res.end(JSON.stringify({ success: false, error: 'El servidor no tiene GEMINI_API_KEY configurada.' }));
  }

  let body: any;
  try { body = await parseBody(req); }
  catch {
    res.statusCode = 400;
    return res.end(JSON.stringify({ success: false, error: 'Solicitud JSON inválida o demasiado grande.' }));
  }

  const firstName = typeof body.firstName === 'string' ? body.firstName.trim().slice(0, 80) : '';
  const surname = typeof body.surname === 'string' ? body.surname.trim().slice(0, 100) : '';
  const motto = typeof body.motto === 'string' ? body.motto.trim().slice(0, 120) : '';
  const palette = typeof body.palette === 'string' ? body.palette.slice(0, 80) : 'azul profundo y oro';
  const symbol = typeof body.symbol === 'string' ? body.symbol.slice(0, 80) : 'cruz';
  if (!firstName || !surname) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ success: false, error: 'Nombre y apellido son obligatorios.' }));
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Create one original, premium-quality heraldic personal emblem illustration, portrait 4:5 composition. This is a contemporary symbolic design, NOT a historical family coat of arms and NOT a claim of ancestry or nobility. Name to personalize: "${firstName} ${surname}". Central symbolic element: ${symbol}. Color palette: ${palette}. Optional motto to include only if legible and correctly spelled: "${motto}". Design: refined classical heraldic shield, detailed metallic gold ornament, balanced symmetry, rich enamel, elegant illuminated-manuscript craftsmanship, crisp high-contrast shapes, clean ivory background, professional museum-quality illustration. No mockup, no frame around a physical object, no watermark, no extra labels, no invented genealogy, no additional text beyond the optional motto. Prioritize the emblem and visual quality; text rendering is optional.`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: prompt,
      config: { responseModalities: ['IMAGE'] },
    } as any);

    const parts = response.candidates?.flatMap((candidate: any) => candidate.content?.parts || []) || [];
    const imagePart = parts.find((part: any) => part.inlineData?.data && part.inlineData?.mimeType?.startsWith('image/'));
    if (!imagePart) {
      res.statusCode = 502;
      return res.end(JSON.stringify({ success: false, error: 'El modelo no devolvió una imagen. Inténtalo más tarde.' }));
    }

    res.statusCode = 200;
    return res.end(JSON.stringify({
      success: true,
      imageDataUrl: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`,
      modelUsed: 'gemini-2.5-flash-image',
    }));
  } catch (error: any) {
    console.error('Error generando emblema heráldico:', error?.message || error);
    res.statusCode = 502;
    return res.end(JSON.stringify({
      success: false,
      error: 'No fue posible generar la imagen heráldica con IA. Verifica disponibilidad y cuota del modelo de imágenes.',
    }));
  }
}
