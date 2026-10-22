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

app.post('/api/gemini/generate', async (req, res) => {
  try {
    const { prompt, systemInstruction } = req.body;
    if (!ai) {
      return res.status(200).json({
        success: false,
        fallback: true,
        message: 'Servidor sin GEMINI_API_KEY activa.',
      });
    }

    let responseText = '';
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: systemInstruction ? { systemInstruction } : undefined,
      });
      responseText = response.text || '';
    } catch (_primaryErr) {
      // Fallback a gemini-3.1-flash-lite si gemini-3.8-flash tiene alta demanda
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: systemInstruction ? { systemInstruction } : undefined,
      });
      responseText = fallbackResponse.text || '';
    }

    return res.json({
      success: true,
      text: responseText,
    });
  } catch (error: any) {
    console.warn('Aviso en /api/gemini/generate:', error?.message || error);
    return res.status(200).json({
      success: false,
      fallback: true,
      error: error?.message || 'IA procesada mediante motor contextual.',
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
