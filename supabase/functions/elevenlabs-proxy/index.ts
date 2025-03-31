import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts'; // Use shared CORS config

// Define the target API endpoint base
const ELEVENLABS_API_BASE_URL = 'https://api.elevenlabs.io/v1';

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // --- Authentication (Optional but Recommended) ---
    // Add Supabase JWT verification here if needed
    // --- End Authentication ---

    const elevenlabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!elevenlabsApiKey) {
      console.error('ElevenLabs API Key secret not set.');
      return new Response(JSON.stringify({ error: 'Internal Server Error: API Key missing' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Construct the target URL by appending the request path and query params
    // Assumes the function is invoked like /elevenlabs-proxy/text-to-speech/voiceId
    const url = new URL(req.url);
    const functionNamePrefix = '/elevenlabs-proxy'; // Adjust if your function name differs
    const targetPath = url.pathname.startsWith(functionNamePrefix)
                       ? url.pathname.substring(functionNamePrefix.length)
                       : url.pathname; // Get path after function name
    const targetUrl = `${ELEVENLABS_API_BASE_URL}${targetPath}${url.search}`; // Append path and query params

    console.log(`Proxying to ElevenLabs URL: ${targetUrl}`); // Log target URL for debugging

    const proxyReq = new Request(targetUrl, {
      method: req.method,
      headers: {
        ...req.headers, // Forward original headers
        'xi-api-key': elevenlabsApiKey,
        'Host': new URL(ELEVENLABS_API_BASE_URL).host, // Set correct host header
      },
      body: req.body ? req.body : undefined, // Forward body if present
    });

    // Remove Supabase/Deno specific headers
    proxyReq.headers.delete('x-client-info');
    // Add any other headers to delete

    const res = await fetch(proxyReq);

    // Return the response from the ElevenLabs API
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
    console.error('Error in ElevenLabs proxy:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to proxy request' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
