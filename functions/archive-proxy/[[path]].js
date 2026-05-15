export async function onRequest(context) {
  // context.params.path contains the array of path segments after /archive-proxy/
  // e.g. ["download", "mahjong_202011", "mahjong.swf"]
  const pathArray = context.params.path;
  
  if (!pathArray) {
    return new Response("No target path provided", { status: 400 });
  }

  // Reconstruct the archive.org URL
  const targetUrl = `https://archive.org/${pathArray.join("/")}`;

  try {
    // Cloudflare Workers' fetch() automatically follows redirects (which handles the 302s to iaXXXX.us.archive.org)
    const response = await fetch(targetUrl, {
      method: context.request.method,
      headers: {
        "User-Agent": context.request.headers.get("User-Agent") || "Cloudflare Proxy",
      }
    });

    // Create a new response using the body of the archive.org response
    const proxyResponse = new Response(response.body, response);

    // Override headers to allow cross-origin requests (fixing the Ruffle CORS issue)
    proxyResponse.headers.set("Access-Control-Allow-Origin", "*");
    
    // Explicitly set the SWF content type
    if (targetUrl.endsWith(".swf")) {
      proxyResponse.headers.set("Content-Type", "application/x-shockwave-flash");
    }

    // Set cache headers to reduce hits to archive.org
    proxyResponse.headers.set("Cache-Control", "public, max-age=86400");

    return proxyResponse;
  } catch (error) {
    return new Response(`Error proxying request: ${error.message}`, { status: 500 });
  }
}
