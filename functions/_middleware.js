// Cloudflare Pages Function to handle routing and MIME types
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Define MIME types
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

  // Get file extension
  const getExtension = (path) => {
    const lastDot = path.lastIndexOf('.');
    return lastDot !== -1 ? path.substring(lastDot) : '';
  };

  // Get MIME type for file
  const getMimeType = (path) => {
    const ext = getExtension(path);
    return mimeTypes[ext] || 'application/octet-stream';
  };

  try {
    // Try to fetch the requested file directly
    const response = await env.ASSETS.fetch(request);
    
    // If file exists, serve it with correct MIME type
    if (response.status === 200) {
      const mimeType = getMimeType(pathname);
      
      return new Response(response.body, {
        status: 200,
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': pathname.includes('/assets/') || pathname.endsWith('.css') || pathname.endsWith('.js') 
            ? 'public, max-age=31536000' 
            : 'public, max-age=300'
        }
      });
    }
    
    // If file doesn't exist and it's not an asset, serve SPA
    if (response.status === 404 && !getExtension(pathname)) {
      const indexResponse = await env.ASSETS.fetch(new URL('/index.html', request.url));
      return new Response(indexResponse.body, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'public, max-age=0, must-revalidate'
        }
      });
    }
    
    // Return the original response for other cases
    return response;
    
  } catch (error) {
    console.error('Error in middleware:', error);
    
    // Fallback to index.html for SPA routes
    try {
      const indexResponse = await env.ASSETS.fetch(new URL('/index.html', request.url));
      return new Response(indexResponse.body, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'public, max-age=0, must-revalidate'
        }
      });
    } catch (fallbackError) {
      return new Response('Internal Server Error', { status: 500 });
    }
  }
}