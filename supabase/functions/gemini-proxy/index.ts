import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts'; // Use shared CORS config

// Define the target API endpoint - Adjust path and version as needed
const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models'; // Base URL

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // --- Authentication (Optional but Recommended) ---
    // Add Supabase JWT verification here if needed
    // --- End Authentication ---

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      console.error('Gemini API Key secret not set.');
      return new Response(JSON.stringify({ error: 'Internal Server Error: API Key missing' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Construct the target URL by appending the request path and adding the API key query param
    // Assumes the function is invoked like /gemini-proxy/gemini-pro:generateContent
    const url = new URL(req.url);
    const functionNamePrefix = '/gemini-proxy'; // Adjust if your function name differs
    const targetPath = url.pathname.startsWith(functionNamePrefix)
                       ? url.pathname.substring(functionNamePrefix.length)
                       : url.pathname; // Get path after function name

    // Gemini API key is usually passed as a query parameter
    let targetUrl = `${GEMINI_API_BASE_URL}${targetPath}?key=${geminiApiKey}`; // Use let instead of const
    // Append original query parameters *except* the key if it was somehow passed
    url.searchParams.forEach((value, key) => {
        if (key.toLowerCase() !== 'key') {
            // This simple append might create duplicate keys if not careful
            // A more robust solution would use URLSearchParams
            targetUrl += `&${key}=${value}`;
        }
    });


    console.log(`Proxying to Gemini URL: ${targetUrl}`); // Log target URL for debugging

    const proxyReq = new Request(targetUrl, {
      method: req.method,
      headers: {
        ...req.headers, // Forward original headers (like Content-Type)
        // Gemini doesn't typically use an Authorization header, key is in query param
         'Host': new URL(GEMINI_API_BASE_URL).host, // Set correct host header
      },
      body: req.body ? req.body : undefined, // Forward body if present
    });

    // Remove Supabase/Deno specific headers
    proxyReq.headers.delete('x-client-info');
    proxyReq.headers.delete('authorization'); // Remove auth header if present
    // Add any other headers to delete

    const res = await fetch(proxyReq);

    // Return the response from the Gemini API
    const responseClone = res.clone();
    const responseHeaders = { ...corsHeaders };
     responseClone.headers.forEach((value, key) => {
        // Avoid setting headers that cause issues, like transfer-encoding
        if (key.toLowerCase() !== 'transfer-encoding') {
            responseHeaders[key] = value;
        }
    });

    return new Response(responseClone.body, {
      status: responseClone.status,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error('Error in Gemini proxy:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to proxy request' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
