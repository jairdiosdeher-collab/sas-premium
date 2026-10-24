import type { IncomingMessage, ServerResponse } from 'http';
import { StripeServerService } from '../../src/services/stripeServerService';

export default function handler(_req: IncomingMessage, res: ServerResponse) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  const status = StripeServerService.getStatus();
  res.end(JSON.stringify({ ...status, environment: 'vercel-serverless' }));
}
