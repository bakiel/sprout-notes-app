import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts'; // Assuming a shared CORS config

// Define the target API endpoint
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'; // Adjust if needed

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // --- Authentication (Optional but Recommended) ---
    // You might want to add Supabase JWT verification here
    // to ensure only authenticated users can call this function.
    // Example: const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    // if (userError || !user) {
    //   return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    // }
    // --- End Authentication ---

    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!deepseekApiKey) {
      console.error('DeepSeek API Key secret not set.');
      return new Response(JSON.stringify({ error: 'Internal Server Error: API Key missing' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Clone the request to forward headers and body
    const proxyReq = new Request(DEEPSEEK_API_URL, {
      method: req.method,
      headers: {
        ...req.headers, // Forward original headers (like Content-Type)
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Host': new URL(DEEPSEEK_API_URL).host, // Set correct host header
      },
      body: req.body ? req.body : undefined, // Forward body if present
    });

    // Remove Supabase/Deno specific headers if necessary
    proxyReq.headers.delete('x-client-info');
    // Add any other headers to delete

    const res = await fetch(proxyReq);

    // Return the response from the DeepSeek API
    // Important: Clone the response to avoid issues with read-once body streams
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
    console.error('Error in DeepSeek proxy:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to proxy request' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
