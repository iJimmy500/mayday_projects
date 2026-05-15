/**
 * Mayday Projects - Cloudflare Worker Entry Point
 *
 * This file is the main entry point for the Cloudflare Worker.
 * It handles special routes (like the archive.org proxy) and 
 * falls back to serving static assets (the React SPA) for everything else.
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // --- ROUTE: Archive.org Proxy ---
    // Intercept requests to /archive-proxy/* and forward them to archive.org
    if (url.pathname.startsWith('/archive-proxy/')) {
      const targetPath = url.pathname.replace('/archive-proxy/', '');

      if (!targetPath) {
        return new Response("No target path provided", { status: 400 });
      }

      const targetUrl = `https://archive.org/${targetPath}`;

      try {
        const response = await fetch(targetUrl, {
          method: "GET",
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "*/*",
            "Referer": "https://archive.org/"
          },
          redirect: "follow"
        });

        // Clone the response so we can modify headers
        const newHeaders = new Headers(response.headers);
        newHeaders.set("Access-Control-Allow-Origin", "*");
        newHeaders.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
        newHeaders.set("Access-Control-Allow-Headers", "*");

        // Force the correct content type for SWF files
        if (targetPath.toLowerCase().endsWith(".swf")) {
          newHeaders.set("Content-Type", "application/x-shockwave-flash");
        }

        return new Response(response.body, {
          status: response.status,
          headers: newHeaders
        });
      } catch (error) {
        return new Response(`Proxy Error: ${error.message}`, { status: 500 });
      }
    }

    // --- ROUTE: Audio Stream Proxy (for LyricFinder) ---
    if (url.pathname.startsWith('/api/get-audio')) {
      // Dynamically import to avoid loading yt-search/ytdl unless needed
      const artist = url.searchParams.get('artist');
      const track = url.searchParams.get('track');
      const corsHeaders = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      };

      if (!artist || !track) {
        return new Response(JSON.stringify({ error: "Missing artist or track" }), { status: 400, headers: corsHeaders });
      }

      try {
        const { default: yts } = await import('yt-search');
        const { default: ytdl } = await import('@distube/ytdl-core');

        const r = await yts(`${artist} ${track} audio`);
        const video = r.videos[0];
        if (!video) {
          return new Response(JSON.stringify({ error: "No video found" }), { status: 404, headers: corsHeaders });
        }

        const info = await ytdl.getInfo(video.url);
        const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' });

        if (!format || !format.url) throw new Error("Could not find a valid audio format");

        return new Response(JSON.stringify({
          videoId: video.videoId,
          audioUrl: format.url,
          title: video.title,
          duration: video.seconds
        }), { headers: { ...corsHeaders, "Cache-Control": "public, max-age=3600" } });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
      }
    }

    // --- FALLBACK: Serve the React SPA (static assets) ---
    // env.ASSETS is automatically provided by Cloudflare for Workers with assets
    return env.ASSETS.fetch(request);
  }
};
