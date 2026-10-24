import type { IncomingMessage, ServerResponse } from 'http';

export default function handler(_req: IncomingMessage, res: ServerResponse) {
  const apiKey = process.env.GEMINI_API_KEY;
  const configured = Boolean(apiKey && apiKey.trim().length > 10);

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(
    JSON.stringify({
      configured,
      activeModel: 'gemini-3.8-flash',
      fallbackModel: 'gemini-3.1-flash-lite',
      status: configured ? 'ready' : 'missing_api_key',
      message: configured
        ? 'Servicio de IA Gemini conectado y listo para producción en Vercel.'
        : 'GEMINI_API_KEY no detectada en las variables de entorno de Vercel.',
      environment: 'vercel-serverless',
    })
  );
}
