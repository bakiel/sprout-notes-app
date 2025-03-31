import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCors, addCorsHeaders } from "../_shared/cors.ts";

// Interface for text-to-speech request body
interface TextToSpeechRequest {
  text: string;
  voiceId?: string; // Optional voice ID, will use default if not provided
  stability?: number; // Voice stability (0-1)
  similarityBoost?: number; // Voice similarity boost (0-1)
}

// Get API key from environment variables
const apiKey = Deno.env.get("ELEVENLABS_API_KEY");

if (!apiKey) {
  console.error("ELEVENLABS_API_KEY environment variable is not set");
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
    const requestData: TextToSpeechRequest = await req.json();
    const { text, voiceId = "21m00Tcm4TlvDq8ikWAM", stability = 0.5, similarityBoost = 0.75 } = requestData;

    // Validate request data
    if (!text || typeof text !== "string" || text.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid request: text must be a non-empty string" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Calling ElevenLabs API for text-to-speech conversion");

    // Call ElevenLabs API
    const elevenlabsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability,
            similarity_boost: similarityBoost,
          },
        }),
      }
    );

    if (!elevenlabsResponse.ok) {
      let errorText = "";
      try {
        const errorData = await elevenlabsResponse.json();
        errorText = JSON.stringify(errorData);
      } catch (e) {
        errorText = await elevenlabsResponse.text();
      }
      throw new Error(`ElevenLabs API error: ${elevenlabsResponse.status} - ${errorText}`);
    }

    // Get the audio data
    const audioBuffer = await elevenlabsResponse.arrayBuffer();

    // Return the audio data
    return addCorsHeaders(
      new Response(audioBuffer, {
        status: 200,
        headers: {
          "Content-Type": "audio/mpeg",
          "Content-Length": audioBuffer.byteLength.toString(),
        },
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
