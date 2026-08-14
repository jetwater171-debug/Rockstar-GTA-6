import { runCoreWebhook } from '../../lib/shared-commerce-adapter.js';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  return runCoreWebhook(req, res);
}
