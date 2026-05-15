export async function onRequest(context) {
  const url = new URL(context.request.url);
  // Get the part of the path after /archive-proxy/
  const targetPath = url.pathname.replace('/archive-proxy/', '');
  
  if (!targetPath || targetPath === url.pathname) {
    return new Response("No target path provided", { status: 400 });
  }

  const targetUrl = `https://archive.org/${targetPath}`;

  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*"
      },
      redirect: "follow" // Ensure Cloudflare follows the archive.org 302 redirects
    });

    // Create a new response so we can fix the headers
    const proxyResponse = new Response(response.body, response);

    // CRITICAL: Set CORS headers so Ruffle can read the data
    proxyResponse.headers.set("Access-Control-Allow-Origin", "*");
    proxyResponse.headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    proxyResponse.headers.set("Access-Control-Allow-Headers", "*");
    
    // Ensure the content type is correct for Ruffle
    if (targetUrl.toLowerCase().endsWith(".swf")) {
      proxyResponse.headers.set("Content-Type", "application/x-shockwave-flash");
    }

    return proxyResponse;
  } catch (error) {
    return new Response(`Proxy Error: ${error.message}`, { status: 500 });
  }
}
