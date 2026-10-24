import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

import { StripeServerService } from './src/services/stripeServerService';

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

// Endpoint de Webhook de Stripe: DEBE ir antes de express.json() para recibir el body en buffer crudo y verificar la firma
app.post(
  '/api/stripe/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    try {
      const sig = req.headers['stripe-signature'] as string | undefined;
      const rawBody = req.body;
      const result = await StripeServerService.processWebhookEvent(rawBody, sig);
      if (!result.success) {
        return res.status(400).send(`Webhook Error: ${result.message}`);
      }
      return res.status(200).json(result);
    } catch (err: any) {
      console.error('Error no controlado en webhook de Stripe:', err?.message || err);
      return res.status(500).send(`Server Error: ${err?.message}`);
    }
  }
);

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

    const callWithTimeout = async <T>(fn: () => Promise<T>, timeoutMs: number): Promise<T> => {
      let timer: NodeJS.Timeout;
      const timeoutPromise = new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`Timeout de ${timeoutMs}ms excedido en Gemini API`)), timeoutMs);
      });
      try {
        return await Promise.race([fn(), timeoutPromise]);
      } finally {
        clearTimeout(timer!);
      }
    };

    try {
      const response = await callWithTimeout(() => ai!.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: Object.keys(config).length > 0 ? config : undefined,
      }), 12000);
      responseText = response.text || '';
    } catch (primaryErr: any) {
      console.warn('Aviso: gemini-3.8-flash no respondió o agotó tiempo, intentando con gemini-3.1-flash-lite:', primaryErr?.message || primaryErr);
      modelUsed = 'gemini-3.1-flash-lite';
      try {
        const fallbackResponse = await callWithTimeout(() => ai!.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: prompt,
          config: Object.keys(config).length > 0 ? config : undefined,
        }), 8000);
        responseText = fallbackResponse.text || '';
      } catch (fallbackErr: any) {
        console.warn('Fallback gemini-3.1-flash-lite tampoco respondió:', fallbackErr?.message || fallbackErr);
      }
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

// Diagnóstico y estado de la pasarela Stripe
app.get('/api/stripe/status', (_req, res) => {
  return res.json(StripeServerService.getStatus());
});

// Creación de sesión real de Stripe Checkout
app.post('/api/stripe/create-checkout', async (req, res) => {
  try {
    const { plan, billingCycle, userEmail, userId, couponCode } = req.body;
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || req.get('host') || `localhost:${PORT}`;
    const hostUrl = `${protocol}://${host}`;

    const result = await StripeServerService.createCheckoutSession({
      plan,
      billingCycle,
      userEmail,
      userId,
      couponCode,
      hostUrl,
    });

    if (!result.success) {
      const statusCode = result.error?.code === 'STRIPE_NOT_CONFIGURED' ? 503 : 400;
      return res.status(statusCode).json(result);
    }

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Error en /api/stripe/create-checkout:', error?.message || error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error?.message || 'Error interno del servidor procesando la solicitud de pago.',
      },
    });
  }
});

// Verificación segura de sesión tras retorno del navegador
app.get('/api/stripe/verify-session', async (req, res) => {
  try {
    const sessionId = req.query.session_id as string;
    if (!sessionId) {
      return res.status(400).json({ success: false, verified: false, error: 'Parámetro session_id requerido.' });
    }
    const result = await StripeServerService.verifyCheckoutSession(sessionId);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      verified: false,
      error: error?.message || 'Error verificando sesión de pago con Stripe.',
    });
  }
});

// Creación de sesión de Customer Portal para gestionar o cancelar suscripción en Stripe
app.post('/api/stripe/create-portal', async (req, res) => {
  try {
    const { customerId } = req.body;
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || req.get('host') || `localhost:${PORT}`;
    const hostUrl = `${protocol}://${host}`;

    const result = await StripeServerService.createPortalSession(customerId, hostUrl);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error?.message });
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
