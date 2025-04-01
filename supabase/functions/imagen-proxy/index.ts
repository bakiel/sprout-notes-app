import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

// Google Cloud Project Details
const PROJECT_ID = 'poetic-respect-369708'; 
const LOCATION_ID = 'us-central1'; 
const MODEL_ID = 'imagegeneration@006'; 
const API_ENDPOINT = `https://${LOCATION_ID}-aiplatform.googleapis.com`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Ensure API key is set
    const apiKey = Deno.env.get('IMAGEN_API_KEY');
    if (!apiKey) {
      throw new Error('IMAGEN_API_KEY environment variable is not set.');
    }

    // Parse request body - expecting { prompt: "..." }
    const body = await req.json();
    const prompt = body?.prompt; // Use optional chaining
    
    if (!prompt || typeof prompt !== 'string') {
       throw new Error('Missing or invalid "prompt" in request body.');
    }
    
    // Add safety check for prompt length if needed
    // prompt = prompt.substring(0, 1000); // Example truncation

    console.log(`Received prompt for Imagen: "${prompt}"`);

    const requestBody = {
      instances: [
        { prompt: prompt }
      ],
      // Add parameters if needed, e.g., number of images
      // parameters: {
      //   sampleCount: 1 
      // }
    };

    const url = `${API_ENDPOINT}/v1/projects/${PROJECT_ID}/locations/${LOCATION_ID}/publishers/google/models/${MODEL_ID}:predict`;

    // Make the request to Google Vertex AI Imagen API
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Imagen API Error (${response.status}):`, errorBody);
      throw new Error(`Imagen API request failed with status ${response.status}`);
    }

    const responseData = await response.json();

    // Extract base64 image data (structure might vary slightly based on API version)
    const base64Image = responseData?.predictions?.[0]?.bytesBase64Encoded;

    if (!base64Image) {
      console.error('Could not find base64Image in Imagen response:', responseData);
      throw new Error('Invalid response format from Imagen API.');
    }

    // Return the base64 image data
    return new Response(
      JSON.stringify({ base64Image: base64Image }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in imagen-proxy function:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
})
