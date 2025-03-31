// CORS Headers middleware for Supabase Edge Functions
// This ensures proper CORS handling for cross-origin requests

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // In production, replace with specific origins
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400', // 24 hours
};

// Helper function to handle OPTIONS requests (preflight)
export function handleCors(req: Request): Response | null {
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response('', { headers: corsHeaders });
  }

  // For other requests, return null and let the function handle them
  // with CORS headers added
  return null;
}

// Helper function to add CORS headers to any Response
export function addCorsHeaders(response: Response): Response {
  // Create a new response with the original body and status
  const newResponse = new Response(response.body, response);
  
  // Add all CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    newResponse.headers.set(key, value);
  });
  
  return newResponse;
}
