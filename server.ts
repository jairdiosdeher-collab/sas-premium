import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

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

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: systemInstruction ? { systemInstruction } : undefined,
    });

    return res.json({
      success: true,
      text: response.text,
    });
  } catch (error: any) {
    console.error('Error en /api/gemini/generate:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Error procesando la solicitud con IA',
    });
  }
});

async function startServer() {
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
