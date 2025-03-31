import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCors, addCorsHeaders } from "../_shared/cors.ts";

// Interface for Gemini request body
interface GeminiRequest {
  // For text-only requests
  text?: string;
  
  // For image analysis
  imageBase64?: string;
  prompt?: string; // The prompt to use with the image
  
  // Common options
  temperature?: number;
  maxTokens?: number;
}

// Get API key from environment variables
const apiKey = Deno.env.get("GEMINI_API_KEY");

if (!apiKey) {
  console.error("GEMINI_API_KEY environment variable is not set");
}

serve(async (req) => {
  // Handle CORS preflight request
  const corsResponse = handleCors(req);
  if (corsResponse) {
    return corsResponse;
  }

  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request JSON
    const requestData: GeminiRequest = await req.json();
    const { text, imageBase64, prompt, temperature = 0.7, maxTokens = 1024 } = requestData;

    // Check if we're doing a text-only or image analysis request
    const isImageRequest = !!imageBase64;

    if (!isImageRequest && (!text || typeof text !== "string" || text.length === 0)) {
      return new Response(
        JSON.stringify({ error: "Invalid request: text must be a non-empty string" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (isImageRequest && (!prompt || typeof prompt !== "string" || prompt.length === 0)) {
      return new Response(
        JSON.stringify({ error: "Invalid request: prompt is required for image analysis" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Calling Gemini API for ${isImageRequest ? "image analysis" : "text generation"}`);

    // Construct the API endpoint URL
    const apiEndpoint = isImageRequest 
      ? "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent"
      : "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
    
    const url = `${apiEndpoint}?key=${apiKey}`;

    // Prepare the request payload
    let requestBody: any = {
      contents: [
        {
          role: "user",
          parts: []
        }
      ],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      }
    };

    // Add the appropriate content parts based on request type
    if (isImageRequest) {
      // For image analysis, we need to add both the image and a text prompt
      requestBody.contents[0].parts.push(
        {
          text: prompt
        },
        {
          inlineData: {
            mimeType: "image/jpeg", // Assuming JPEG for simplicity, could be more dynamic
            data: imageBase64
          }
        }
      );
    } else {
      // For text-only requests
      requestBody.contents[0].parts.push({
        text
      });
    }

    // Call Gemini API
    const geminiResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    if (!geminiResponse.ok) {
      let errorText = "";
      try {
        const errorData = await geminiResponse.json();
        errorText = JSON.stringify(errorData);
      } catch (e) {
        errorText = await geminiResponse.text();
      }
      throw new Error(`Gemini API error: ${geminiResponse.status} - ${errorText}`);
    }

    // Parse Gemini response
    const geminiData = await geminiResponse.json();
    console.log("Gemini response received:", JSON.stringify(geminiData, null, 2));

    // Extract the response content
    const responseContent = geminiData.candidates?.[0]?.content;
    if (!responseContent) {
      throw new Error("Invalid response from Gemini API: Missing content");
    }

    // Return the processed data
    return addCorsHeaders(
      new Response(JSON.stringify({ 
        response: responseContent,
        rawResponse: geminiData 
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
  } catch (error) {
    console.error("Error processing request:", error);

    return addCorsHeaders(
      new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : "Unknown error occurred",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      )
    );
  }
});
