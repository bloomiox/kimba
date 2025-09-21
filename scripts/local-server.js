import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DIST_DIR = path.join(__dirname, '..', 'dist');

// MIME types (same as our Cloudflare function)
const mimeTypes = {
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.html': 'text/html',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

function getExtension(filePath) {
  const lastDot = filePath.lastIndexOf('.');
  return lastDot !== -1 ? filePath.substring(lastDot) : '';
}

function getMimeType(filePath) {
  const ext = getExtension(filePath);
  return mimeTypes[ext] || 'application/octet-stream';
}

const server = http.createServer((req, res) => {
  let pathname = new URL(req.url, `http://localhost:${PORT}`).pathname;
  
  // Remove leading slash for file system
  if (pathname.startsWith('/')) {
    pathname = pathname.substring(1);
  }
  
  // If empty path, serve index.html
  if (pathname === '') {
    pathname = 'index.html';
  }
  
  const filePath = path.join(DIST_DIR, pathname);
  
  console.log(`📥 Request: ${req.url} → ${pathname}`);
  
  // Check if file exists
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    try {
      const content = fs.readFileSync(filePath);
      const mimeType = getMimeType(pathname);
      
      console.log(`✅ Serving: ${pathname} (${mimeType})`);
      
      res.writeHead(200, {
        'Content-Type': mimeType,
        'Cache-Control': pathname.includes('/assets/') || pathname.endsWith('.css') || pathname.endsWith('.js') 
          ? 'public, max-age=31536000' 
          : 'public, max-age=300',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(content);
    } catch (error) {
      console.error(`❌ Error reading file: ${error.message}`);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    }
  } else {
    // For SPA routes, serve index.html
    const indexPath = path.join(DIST_DIR, 'index.html');
    if (fs.existsSync(indexPath) && !getExtension(pathname)) {
      console.log(`🔄 SPA Route: ${pathname} → index.html`);
      try {
        const content = fs.readFileSync(indexPath);
        res.writeHead(200, {
          'Content-Type': 'text/html',
          'Cache-Control': 'public, max-age=0, must-revalidate'
        });
        res.end(content);
      } catch (error) {
        console.error(`❌ Error reading index.html: ${error.message}`);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    } else {
      console.log(`❌ Not found: ${pathname}`);
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  }
});

server.listen(PORT, () => {
  console.log('🚀 Local test server started!');
  console.log(`📍 Server running at: http://localhost:${PORT}`);
  console.log(`📁 Serving files from: ${DIST_DIR}`);
  console.log('');
  console.log('🧪 Test these URLs:');
  console.log(`   http://localhost:${PORT}/index.css`);
  console.log(`   http://localhost:${PORT}/assets/index-DclWOD0H.js`);
  console.log(`   http://localhost:${PORT}/i18n/locales/de.json`);
  console.log('');
  console.log('Press Ctrl+C to stop the server');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});