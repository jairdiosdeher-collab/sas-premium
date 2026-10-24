import type { IncomingMessage, ServerResponse } from 'http';
import { StripeServerService } from '../../src/services/stripeServerService';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json');

  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const sessionId = url.searchParams.get('session_id');

  if (!sessionId) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ success: false, verified: false, error: 'Parámetro session_id requerido.' }));
  }

  try {
    const result = await StripeServerService.verifyCheckoutSession(sessionId);
    res.statusCode = 200;
    return res.end(JSON.stringify(result));
  } catch (err: any) {
    res.statusCode = 500;
    return res.end(JSON.stringify({ success: false, verified: false, error: err?.message || 'Error verificando sesión en Vercel' }));
  }
}
