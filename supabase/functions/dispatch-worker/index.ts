// Supabase Edge Function: dispatch-worker
// Configure DISPATCH_TARGET_URL and DISPATCH_TOKEN in the function secrets.

Deno.serve(async (req) => {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const target = Deno.env.get('DISPATCH_TARGET_URL') || '';
  const token = Deno.env.get('DISPATCH_TOKEN') || '';
  if (!target || !token) {
    return new Response(JSON.stringify({ error: 'missing_dispatch_configuration' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const url = new URL(target);
  url.searchParams.set('token', token);
  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return new Response(await response.text(), {
    status: response.status,
    headers: { 'Content-Type': 'application/json' },
  });
});
