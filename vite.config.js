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
        // req.url is the path after /archive-proxy, e.g. /download/gravityguy...
        const targetUrl = 'https://archive.org' + req.url;
        
        const fetchFile = (url) => {
          https.get(url, (response) => {
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
              // Follow redirects (which is what archive.org does for downloads)
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
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), archiveProxyPlugin()],
})
