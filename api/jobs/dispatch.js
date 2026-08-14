import { runCoreDispatch } from '../../lib/shared-commerce-adapter.js';

export default async function handler(req, res) {
  return runCoreDispatch(req, res);
}
