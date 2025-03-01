
// Cloudflare Pages Worker script
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Check if the request is for a static file
    if (
      url.pathname.startsWith('/assets/') || 
      url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/) ||
      url.pathname.startsWith('/pwa-')
    ) {
      // Forward the request for static assets
      return fetch(request);
    }
    
    // For all other routes, serve index.html to support client-side routing
    try {
      // Always serve index.html for non-static paths to support SPA routing
      return fetch(new Request(`${url.origin}/index.html`, {
        headers: request.headers
      }));
    } catch (e) {
      console.error('Error serving index.html:', e);
      return new Response('Error loading the application', { status: 500 });
    }
  }
};
