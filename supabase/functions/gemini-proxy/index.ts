import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCors, addCorsHeaders } from "../_shared/cors.ts";

// Interface for Gemini request body
interface GeminiRequest {
  // Request type
  task?: 'generateText' | 'analyzeImage' | 'generateImage';
  
  // For text-only or image generation requests
  text?: string;
  prompt?: string; // Used for image generation or analysis
  
  // For image analysis
  imageBase64?: string;
  
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
    const { text, imageBase64, prompt, temperature = 0.7, maxTokens = 1024, task } = requestData;

    // Determine the task type
    let taskType = task;
    if (!taskType) {
      // Default task type based on provided parameters
      if (imageBase64) {
        taskType = 'analyzeImage';
      } else if (prompt && !text) {
        taskType = 'generateImage';
      } else {
        taskType = 'generateText';
      }
    }

    // Validate input based on task type
    if (taskType === 'generateText' && (!text || typeof text !== "string" || text.length === 0)) {
      return new Response(
        JSON.stringify({ error: "Invalid request: text must be a non-empty string for text generation" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (taskType === 'analyzeImage' && (!imageBase64 || !prompt || typeof prompt !== "string")) {
      return new Response(
        JSON.stringify({ error: "Invalid request: imageBase64 and prompt are required for image analysis" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    if (taskType === 'generateImage' && (!prompt || typeof prompt !== "string")) {
      return new Response(
        JSON.stringify({ error: "Invalid request: prompt is required for image generation" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Calling Gemini API for ${taskType}`);

    // Construct the API endpoint URL
    let apiEndpoint;
    if (taskType === 'analyzeImage') {
      apiEndpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent";
    } else if (taskType === 'generateImage') {
      apiEndpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
    } else {
      apiEndpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
    }
    
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

    // Add the appropriate content parts based on task type
    if (taskType === 'analyzeImage') {
      // For image analysis, we need to add both the image and a text prompt
      requestBody.contents[0].parts.push(
        {
          text: prompt
        },
        {
          inlineData: {
            mimeType: "image/jpeg", // Assuming JPEG for simplicity
            data: imageBase64
          }
        }
      );
    } else if (taskType === 'generateImage') {
      // For image generation, include a detailed prompt
      const imagePrompt = `Create a high-quality, realistic image of: ${prompt}. The image should be detailed, visually appealing, and suitable for a recipe visualization.`;
      requestBody.contents[0].parts.push({
        text: imagePrompt
      });
      
      // Add specific configuration for image generation
      requestBody.generationConfig.temperature = 0.4; // Lower temperature for more predictable results
      requestBody.generationConfig.topP = 1;
      requestBody.generationConfig.topK = 32;
      requestBody.generationConfig.maxOutputTokens = 2048;
    } else {
      // For text-only requests
      requestBody.contents[0].parts.push({
        text: text || prompt
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

    // Process response based on task type
    if (taskType === 'generateImage') {
      // For image generation, extract the image data from the response
      // The structure depends on the specific model response format
      const parts = geminiData.candidates?.[0]?.content?.parts;
      let base64Image = null;
      
      if (parts && parts.length > 0) {
        // Look for an image part in the response
        for (const part of parts) {
          if (part.inlineData && part.inlineData.data) {
            base64Image = part.inlineData.data;
            break;
          }
        }
      }
      
      if (!base64Image) {
        console.error("No image data found in response:", JSON.stringify(geminiData));
        throw new Error("Image generation failed: No image data in response");
      }
      
      // Return the base64 image data in the same format as the imagen-proxy function
      return addCorsHeaders(
        new Response(JSON.stringify({ 
          base64Image: base64Image
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );
    } else {
      // For text generation and image analysis
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
    }
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
