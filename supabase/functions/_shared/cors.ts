// Allow requests from specific origins. Adjust '*' to your frontend URL in production.
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Or 'https://your-app-domain.com'
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE', // Add methods as needed
};
