/**
 * Mayday Projects - Cloudflare Worker Entry Point
 * 
 * Optimized for Edge: Removed heavy Node.js libraries to ensure deployment success.
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    };

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // --- ROUTE: Archive.org Proxy (Flash Games) ---
    if (url.pathname.startsWith('/archive-proxy/')) {
      const targetPath = url.pathname.replace('/archive-proxy/', '');
      if (!targetPath) return new Response("No target path", { status: 400 });
      
      try {
        const response = await fetch(`https://archive.org/${targetPath}`, {
          headers: { "User-Agent": "Mozilla/5.0", "Referer": "https://archive.org/" },
          redirect: "follow"
        });

        const newHeaders = new Headers(response.headers);
        Object.keys(corsHeaders).forEach(k => newHeaders.set(k, corsHeaders[k]));
        if (targetPath.toLowerCase().endsWith(".swf")) {
          newHeaders.set("Content-Type", "application/x-shockwave-flash");
        }

        return new Response(response.body, { status: response.status, headers: newHeaders });
      } catch (e) {
        return new Response(`Archive Proxy Error: ${e.message}`, { status: 500, headers: corsHeaders });
      }
    }

    // --- ROUTE: Lyrics API Proxy ---
    if (url.pathname.startsWith('/api/lyrics/')) {
      const targetUrl = `https://lrclib.net/api/${url.pathname.replace('/api/lyrics/', '')}${url.search}`;
      try {
        const response = await fetch(targetUrl);
        const data = await response.text();
        return new Response(data, { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
      }
    }

    // --- ROUTE: Audio Stream Proxy (Fallback) ---
    if (url.pathname.startsWith('/api/get-audio')) {
      // Temporary fallback while we move audio extraction to a compatible service
      return new Response(JSON.stringify({ 
        error: "YouTube audio extraction is currently being rebuilt for Edge compatibility.",
        fallback: true
      }), { status: 503, headers: corsHeaders });
    }

    // --- FALLBACK: Assets ---
    return env.ASSETS.fetch(request);
  }
};
