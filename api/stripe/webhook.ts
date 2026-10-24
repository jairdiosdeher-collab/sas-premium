import type { IncomingMessage, ServerResponse } from 'http';
import { StripeServerService } from '../../src/services/stripeServerService';

async function getRawBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: any) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'Method not allowed. Use POST for webhooks.' }));
  }

  const sig = req.headers['stripe-signature'] as string | undefined;

  try {
    const rawBody = await getRawBody(req);
    const result = await StripeServerService.processWebhookEvent(rawBody, sig);

    res.statusCode = result.success ? 200 : 400;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(result));
  } catch (err: any) {
    console.error('Error procesando webhook de Stripe en Vercel:', err?.message || err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ success: false, error: err?.message || 'Error de procesamiento de webhook' }));
  }
}
