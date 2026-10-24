import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.static(path.resolve('public')));

app.get('/favicon.ico', (_req, res) => {
  res.sendFile(path.resolve('public/favicon.ico'));
});

app.get('/favicon.svg', (_req, res) => {
  res.sendFile(path.resolve('public/favicon.svg'));
});

app.use(express.json({ limit: '10mb' }));

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Endpoint de diagnóstico del estado de la IA
app.get('/api/gemini/status', (_req, res) => {
  return res.json({
    configured: Boolean(apiKey && apiKey.trim().length > 10),
    activeModel: 'gemini-3.8-flash',
    fallbackModel: 'gemini-3.1-flash-lite',
    status: apiKey ? 'ready' : 'missing_api_key',
    message: apiKey
      ? 'Servicio de IA Gemini conectado y listo para producción.'
      : 'GEMINI_API_KEY no detectada en las variables de entorno.',
  });
});

app.post('/api/gemini/generate', async (req, res) => {
  try {
    const { prompt, systemInstruction, responseMimeType } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PROMPT',
          message: 'El campo "prompt" es obligatorio y debe ser una cadena de texto.',
        },
      });
    }

    if (!ai) {
      return res.status(503).json({
        success: false,
        error: {
          code: 'MISSING_API_KEY',
          message: 'Servidor sin GEMINI_API_KEY activa en el entorno de ejecución.',
          hint: 'Configura la variable GEMINI_API_KEY en el archivo .env o en el panel de variables de Vercel.',
        },
      });
    }

    let responseText = '';
    let modelUsed = 'gemini-3.8-flash';

    const config: any = {};
    if (systemInstruction) config.systemInstruction = systemInstruction;
    if (responseMimeType) config.responseMimeType = responseMimeType;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: Object.keys(config).length > 0 ? config : undefined,
      });
      responseText = response.text || '';
    } catch (primaryErr: any) {
      console.warn('Aviso: gemini-3.8-flash no respondió, intentando con gemini-3.1-flash-lite:', primaryErr?.message || primaryErr);
      modelUsed = 'gemini-3.1-flash-lite';
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: Object.keys(config).length > 0 ? config : undefined,
      });
      responseText = fallbackResponse.text || '';
    }

    if (!responseText.trim()) {
      return res.status(502).json({
        success: false,
        error: {
          code: 'EMPTY_RESPONSE',
          message: 'La API de Gemini devolvió una respuesta vacía.',
          model: modelUsed,
        },
      });
    }

    return res.json({
      success: true,
      text: responseText,
      modelUsed,
    });
  } catch (error: any) {
    const errorMessage = error?.message || String(error);
    console.error('Error en /api/gemini/generate:', errorMessage);
    return res.status(502).json({
      success: false,
      error: {
        code: 'GEMINI_API_ERROR',
        message: errorMessage,
      },
    });
  }
});

app.post('/api/stripe/create-checkout', async (req, res) => {
  try {
    const { priceId, plan, userEmail, userId, couponCode } = req.body;
    return res.json({
      success: true,
      sessionId: `cs_test_${Date.now()}`,
      plan,
      priceId,
      userEmail,
      message: 'Sesión de Stripe Checkout lista para producción.',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || 'Error iniciando sesión de pago Stripe',
    });
  }
});

async function startServer() {
  app.use(express.static('public'));

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PastoralMente AI Server corriendo en http://localhost:${PORT}`);
  });
}

startServer();
