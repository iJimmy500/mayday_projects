import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import ytSearch from 'yt-search'
import url from 'url'
import axios from 'axios'
import ytdl from '@distube/ytdl-core'

// Invidious API: GET /api/v1/videos/{id} → { adaptiveFormats: [{ url, type, bitrate }] }
const INVIDIOUS_INSTANCES = [
  'https://invidious.privacydev.net',
  'https://inv.tux.pizza',
  'https://iv.melmac.space',
  'https://invidious.fdn.fr',
];

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
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
      },
      '/api-youtube': {
        target: 'http://localhost:5173',
        bypass: async (req, res) => {
          const parsedUrl = url.parse(req.url, true)
          if (parsedUrl.pathname === '/api-youtube/search') {
            const query = parsedUrl.query.q
            if (!query) {
              res.end(JSON.stringify({ error: 'No query provided' }))
              return
            }

            // Backend Cache: Avoid hitting YouTube for the same query twice in 5 mins
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
              let winner = null;

              // Step 1: Find video via yt-search (with 5s timeout)
              try {
                const yts = ytSearch.default || ytSearch;
                console.log(`[Proxy] Searching YouTube: "${query}"`);
                
                const searchPromise = yts(query);
                const timeoutPromise = new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('Search Timeout')), 5000)
                );

                const ytRes = await Promise.race([searchPromise, timeoutPromise]);
                
                if (ytRes.videos && ytRes.videos[0]) {
                  const v = ytRes.videos[0];
                  winner = {
                    videoId: v.videoId,
                    title: v.title,
                    duration: v.seconds,
                    provider: 'youtube'
                  };
                  console.log(`[Proxy] YouTube found: ${winner.videoId}`);
                } else {
                  console.log(`[Proxy] No results for: "${query}"`);
                }
              } catch (e) {
                console.log(`[Proxy] Search failed or timed out:`, e?.message || 'Unknown error');
              }

              // Save to cache
              global.searchCache.set(query, { time: Date.now(), data: winner || { videoId: null } });

              // Step 2: Just return the videoId, no extraction
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(winner || { videoId: null }))
            } catch (err) {
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: err.message, videoId: null }))
            }
            return true
          }
        }
      }
    }
  }
})
