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

    // --- ROUTE: Supabase Proxy (Bypasses adblockers/Brave Shields for DB/Realtime) ---
    if (url.pathname.startsWith('/supabase/')) {
      const targetPath = url.pathname.replace('/supabase/', '');
      const targetUrl = `https://tmhxysfxsokgisruovsj.supabase.co/${targetPath}${url.search}`;

      try {
        const fetchOptions = {
          method: request.method,
          headers: request.headers,
          redirect: "manual"
        };
        if (request.method !== "GET" && request.method !== "HEAD") {
          fetchOptions.body = request.body;
        }

        const response = await fetch(targetUrl, fetchOptions);
        return response;
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
      }
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

    // --- ROUTE: Last.fm Proxy (avoids ad blocker blocks on audioscrobbler.com) ---
    if (url.pathname === '/api/lastfm') {
      try {
        const response = await fetch(`https://ws.audioscrobbler.com/2.0/${url.search}`);
        const data = await response.text();
        return new Response(data, {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
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

    // --- ROUTE: Deezer Artist Image Proxy ---
    if (url.pathname === '/api/artist-image') {
      const term = url.searchParams.get('term');
      if (!term) return new Response('Missing term', { status: 400, headers: corsHeaders });
      try {
        const response = await fetch(`https://api.deezer.com/search/artist?q=${encodeURIComponent(term)}&limit=1`);
        const data = await response.text();
        return new Response(data, {
          headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=86400' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
      }
    }

    // --- ROUTE: YouTube Search (used by Lyricly/day11 for synced playback) ---
    if (url.pathname === '/yt-search') {
      const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };
      const query = url.searchParams.get('q');
      if (!query) {
        return new Response(JSON.stringify({ error: 'Missing query' }), { status: 400, headers: jsonHeaders });
      }

      // Primary: scrape YouTube's results page for video IDs (no API key needed)
      try {
        const ytRes = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cookie': 'CONSENT=YES+1'
          }
        });
        if (ytRes.ok) {
          const html = await ytRes.text();
          const ids = [...new Set([...html.matchAll(/"videoId":"([\w-]{11})"/g)].map(m => m[1]))];
          if (ids.length > 0) {
            return new Response(JSON.stringify(ids.slice(0, 5).map(videoId => ({ videoId }))), {
              headers: jsonHeaders
            });
          }
        }
      } catch {
        // fall through to Invidious
      }

      // Fallback: public Invidious instances
      const instances = ['https://inv.nadeko.net', 'https://yewtu.be', 'https://invidious.nerdvpn.de'];
      for (const base of instances) {
        try {
          const r = await fetch(`${base}/api/v1/search?q=${encodeURIComponent(query)}&type=video`, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
          });
          if (r.ok) {
            const data = await r.json();
            if (Array.isArray(data) && data.length > 0) {
              return new Response(JSON.stringify(data), { headers: jsonHeaders });
            }
          }
        } catch {
          // try next instance
        }
      }

      return new Response(JSON.stringify({ error: 'All search instances failed' }), { status: 503, headers: jsonHeaders });
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
