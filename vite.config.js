import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import https from 'https'
import http from 'http'

// A simple plugin to proxy requests and perfectly follow redirects without CORS issues
const archiveProxyPlugin = () => {
  return {
    name: 'archive-proxy',
    configureServer(server) {
      server.middlewares.use('/archive-proxy', (req, res) => {
        const targetUrl = 'https://archive.org' + req.url;
        const fetchFile = (url) => {
          https.get(url, (response) => {
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
              fetchFile(response.headers.location.startsWith('http') ? response.headers.location : 'https://archive.org' + response.headers.location);
            } else {
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Content-Type', 'application/x-shockwave-flash');
              response.pipe(res);
            }
          }).on('error', (err) => {
            res.statusCode = 500;
            res.end(err.message);
          });
        };
        fetchFile(targetUrl);
      });

      // Last.fm proxy
      server.middlewares.use('/api/lastfm', (req, res) => {
        const targetUrl = `https://ws.audioscrobbler.com/2.0/${req.url}`;
        https.get(targetUrl, apiRes => {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Content-Type', 'application/json');
          apiRes.pipe(res);
        }).on('error', err => { res.statusCode = 500; res.end(err.message); });
      });

      // Deezer artist image proxy
      server.middlewares.use('/api/artist-image', (req, res) => {
        const term = new URL(req.url, 'http://localhost').searchParams.get('term');
        if (!term) { res.statusCode = 400; return res.end('Missing term'); }
        const targetUrl = `https://api.deezer.com/search/artist?q=${encodeURIComponent(term)}&limit=1`;
        https.get(targetUrl, apiRes => {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Content-Type', 'application/json');
          apiRes.pipe(res);
        }).on('error', err => { res.statusCode = 500; res.end(err.message); });
      });

      // YouTube Search Proxy (scrapes YouTube results, falls back to Invidious)
      server.middlewares.use('/yt-search', async (req, res) => {
        const query = new URL(req.url, 'http://localhost').searchParams.get('q');
        if (!query) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'Missing query' }));
        }

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/json');

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
              return res.end(JSON.stringify(ids.slice(0, 5).map(videoId => ({ videoId }))));
            }
          }
        } catch {
          // fall through to Invidious
        }

        const instances = ['https://inv.nadeko.net', 'https://yewtu.be', 'https://invidious.nerdvpn.de'];
        for (const base of instances) {
          try {
            const r = await fetch(`${base}/api/v1/search?q=${encodeURIComponent(query)}&type=video`, {
              headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            if (r.ok) {
              const data = await r.json();
              if (Array.isArray(data) && data.length > 0) {
                return res.end(JSON.stringify(data));
              }
            }
          } catch {
            // try next instance
          }
        }

        res.statusCode = 503;
        res.end(JSON.stringify({ error: 'All search instances failed' }));
      });
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), archiveProxyPlugin()],
  server: {
    proxy: {
      '/supabase': {
        target: 'https://tmhxysfxsokgisruovsj.supabase.co',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/supabase/, ''),
        ws: true
      },
      '/api/off': {
        target: 'https://world.openfoodfacts.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/off/, ''),
        secure: false
      }
    }
  }
})
