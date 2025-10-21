import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ request }) => {
  const siteUrl = import.meta.env.SITE || new URL(request.url).origin;
  const robotsTxt = `
User-agent: *
Allow: /
Sitemap: ${new URL('sitemap-index.xml', siteUrl).href}
`.trim();

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
