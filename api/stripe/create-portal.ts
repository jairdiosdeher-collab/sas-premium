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
    return res.end(JSON.stringify({ success: false, error: 'Método no permitido' }));
  }

  let body: any = {};
  try {
    body = await parseBody(req);
  } catch (_e) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ success: false, error: 'JSON inválido' }));
  }

  const { customerId } = body;
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'sas-premium.vercel.app';
  const returnUrl = `${protocol}://${host}`;

  const result = await StripeServerService.createPortalSession(customerId, returnUrl);
  res.statusCode = result.success ? 200 : 400;
  return res.end(JSON.stringify(result));
}
