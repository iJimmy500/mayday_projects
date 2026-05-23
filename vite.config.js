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

      // YouTube Search Proxy with Failover
      server.middlewares.use('/yt-search', (req, res) => {
        const query = new URL(req.url, 'http://localhost').searchParams.get('q');
        if (!query) {
          res.statusCode = 400;
          return res.end('Missing query');
        }

        const instances = [
          'https://inv.vern.cc',
          'https://invidious.drgns.space',
          'https://invidious.io.lol',
          'https://vid.priv.au',
          'https://invidious.lunar.icu'
        ];

        const tryInstance = (index) => {
          if (index >= instances.length) {
            res.statusCode = 503;
            return res.end(JSON.stringify({ error: 'All search instances failed' }));
          }

          const targetUrl = `${instances[index]}/api/v1/search?q=${encodeURIComponent(query)}&type=video`;
          
          https.get(targetUrl, (apiRes) => {
            if (apiRes.statusCode === 200) {
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Content-Type', 'application/json');
              apiRes.pipe(res);
            } else {
              // Try next instance on failure
              tryInstance(index + 1);
            }
          }).on('error', () => {
            tryInstance(index + 1);
          });
        };

        tryInstance(0);
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
      }
    }
  }
})
