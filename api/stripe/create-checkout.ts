import type { IncomingMessage, ServerResponse } from 'http';
import { StripeServerService } from '../../src/services/stripeServerService';

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

  let body: any = {};
  try {
    body = await parseBody(req);
  } catch (_e) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ success: false, error: { code: 'INVALID_JSON', message: 'Cuerpo de solicitud JSON inválido.' } }));
  }

  const { plan, billingCycle, userEmail, userId, couponCode } = body;
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'sas-premium.vercel.app';
  const hostUrl = `${protocol}://${host}`;

  try {
    const result = await StripeServerService.createCheckoutSession({
      plan,
      billingCycle,
      userEmail,
      userId,
      couponCode,
      hostUrl,
    });

    if (!result.success) {
      res.statusCode = result.error?.code === 'STRIPE_NOT_CONFIGURED' ? 503 : 400;
      return res.end(JSON.stringify(result));
    }

    res.statusCode = 200;
    return res.end(JSON.stringify(result));
  } catch (error: any) {
    res.statusCode = 500;
    return res.end(JSON.stringify({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: error?.message || 'Error en Checkout de Vercel' },
    }));
  }
}
