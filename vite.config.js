import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const isDev = command === 'serve'

  return {
    plugins: [
      react(),
      isDev && devProxyPlugin()
    ].filter(Boolean),
    server: isDev ? {
      proxy: {
        '/api-itunes': {
          target: 'https://itunes.apple.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api-itunes/, '')
        },
        '/api-lyrics': {
          target: 'https://lrclib.net',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api-lyrics/, '')
        }
      }
    } : {}
  }
})

/**
 * A Vite plugin that handles YouTube search and audio stream proxying.
 * This is only used during development.
 */
function devProxyPlugin() {
  return {
    name: 'dev-proxy-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // Only handle our specific API routes
        if (!req.url.startsWith('/api-youtube/') && !req.url.startsWith('/api-proxy/')) {
          return next()
        }

        const url = await import('url')
        const axiosMod = await import('axios')
        const axios = axiosMod.default || axiosMod
        const parsedUrl = url.parse(req.url, true)

        // 1. YouTube Search Endpoint
        if (parsedUrl.pathname === '/api-youtube/search') {
          const query = parsedUrl.query.q
          if (!query) {
            res.end(JSON.stringify({ error: 'No query provided' }))
            return
          }

          // Backend Cache
          if (!global.searchCache) global.searchCache = new Map();
          if (global.searchCache.has(query)) {
            const cached = global.searchCache.get(query);
            if (Date.now() - cached.time < 300000) {
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(cached.data))
              return;
            }
          }

          try {
            const ytSearch = await import('yt-search')
            const yts = ytSearch.default?.default || ytSearch.default || ytSearch;
            let winner = null;

            try {
              const ytRes = await Promise.race([
                yts(query),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
              ]);
              
              if (ytRes.videos?.[0]) {
                const v = ytRes.videos[0];
                winner = { videoId: v.videoId, title: v.title, duration: v.seconds, provider: 'youtube' };
              }
            } catch (e) {}

            // Optional Piped Upgrade
            if (winner?.videoId) {
              const pipedInstances = [
                'https://api.piped.private.coffee',
                'https://pipedapi.leptons.xyz',
                'https://pipedapi.nosebs.ru',
                'https://piped-api.privacy.com.de',
                'https://pipedapi.adminforge.de',
                'https://api.piped.yt',
                'https://pipedapi.owo.si',
                'https://pipedapi.kavin.rocks'
              ];

              for (const instance of pipedInstances) {
                try {
                  const pipedRes = await axios.get(`${instance}/streams/${winner.videoId}`, { 
                    timeout: 3000,
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
                  });
                  if (pipedRes.data?.audioStreams?.[0]?.url) {
                    winner.streamUrl = `/api-proxy/stream?url=${encodeURIComponent(pipedRes.data.audioStreams.sort((a,b)=>b.bitrate-a.bitrate)[0].url)}`;
                    console.log(`[Proxy] 💎 Piped Stream Extracted! (${instance})`);
                    break;
                  }
                } catch (e) {}
              }
            }

            global.searchCache.set(query, { time: Date.now(), data: winner || { videoId: null } });
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(winner || { videoId: null }))
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }))
          }
          return;
        }

        // 2. Audio Proxy Endpoint
        if (parsedUrl.pathname === '/api-proxy/stream') {
          const streamUrl = parsedUrl.query.url;
          if (!streamUrl) return res.end('No URL');

          try {
            const response = await axios({
              method: 'get',
              url: streamUrl,
              responseType: 'stream',
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://www.youtube.com/'
              }
            });

            res.setHeader('Content-Type', response.headers['content-type'] || 'audio/mpeg');
            response.data.pipe(res);
          } catch (err) {
            res.statusCode = 500;
            res.end('Proxy failed');
          }
          return;
        }
      })
    }
  }
}

