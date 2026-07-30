const securityHeaders = {
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
};

function secure(response) {
  const secured = new Response(response.body, response);
  Object.entries(securityHeaders).forEach(([name, value]) => {
    secured.headers.set(name, value);
  });
  return secured;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      return Response.json(
        { ok: false, reason: 'preview_without_api' },
        { status: 503, headers: securityHeaders },
      );
    }

    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404 || request.method !== 'GET') {
      return secure(response);
    }

    const acceptsHtml = (request.headers.get('accept') || '').includes('text/html');
    if (!acceptsHtml) return secure(response);

    const fallbackUrl = new URL('/index.html', request.url);
    return secure(await env.ASSETS.fetch(new Request(fallbackUrl, request)));
  },
};
