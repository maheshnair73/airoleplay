import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// ElevenLabs voice ID map keyed by the value strings used in the picker
const VOICE_ID_MAP: Record<string, string> = {
  // American
  mark:         "UgBBYS2sOqTuMpoF3BR0", // Mark
  chris:        "iP95p4xoKVk53GoZ742B", // Chris
  austin:       "wViXBPUzp2ZZixB1xQuM", // Austin
  cassidy:      "56AoDkrOh6qfVPDXZ7Pt", // Cassidy
  christopher:  "J3kX6M1tC4ZDVRg0HYFE", // Christopher — fallback to Roger
  edwin:        "onwK4e9ZLuTAKqWW03F9", // Daniel (confident)
  freya:        "jsCqWAovK2LkecY7zXl4", // Freya
  geraldine:    "EXAVITQu4vr4xnSDxMaL", // Bella (Southern fallback)
  hope:         "MF3mGyEYCl7XYWbV9V6O", // Elli
  jamal:        "TxGEqnHWrfWFTfGW9XjX", // Josh (smooth)
  jen:          "LcfcDJNUP1GQjkzn1xUU", // Emily
  jerry:        "VR6AewLTigWG4xSOukaG", // Arnold (Bostonian)
  joe:          "ErXwobaYiN019PkySvjV",  // Antoni
  joseph:       "pNInz6obpgDQGcFmaJgB",  // Adam
  karen:        "21m00Tcm4TlvDq8ikWAM",  // Rachel
  marcus:       "pNInz6obpgDQGcFmaJgB",  // Adam (deep)
  naomi:        "yoZ06aMxZJJ28mfd3POQ",  // Glinda (warm)
  // Australian
  emma:         "Zlb1dXrM653N07WRdFW3",  // Nicole
  lee:          "ZQe5CZNOzWyzPSCn5a3c",  // James
  mia:          "Zlb1dXrM653N07WRdFW3",  // Nicole
  ryan:         "ZQe5CZNOzWyzPSCn5a3c",  // James
  // British
  alex:         "N2lVS1w4EtoT3dr4eOWO",  // Callum
  isla:         "AZnzlk1XvdvUeBnXmlld",  // Domi (Scottish)
  john:         "CYw3kZ02Hs0563khs1Fj",  // Dave
  lily:         "ThT5KcBeYPX3keUQqHPh",  // Dorothy
  oliver:       "N2lVS1w4EtoT3dr4eOWO",  // Callum
  sophie:       "AZnzlk1XvdvUeBnXmlld",  // Domi
  // French
  jean:         "TX3LPaxmHKxFdv7VOQHJ",  // Liam (French fallback)
  claire:       "EXAVITQu4vr4xnSDxMaL",  // Bella
  pierre:       "ErXwobaYiN019PkySvjV",   // Antoni
  amelie:       "21m00Tcm4TlvDq8ikWAM",  // Rachel
  // Indian English
  gulab:        "giB9SBGRjhHhRPW4JKCE",  // Rishi
  priya:        "nPczCjzI2devNBz1zQrb",  // Meera
  arjun:        "giB9SBGRjhHhRPW4JKCE",  // Rishi
  meera:        "nPczCjzI2devNBz1zQrb",  // Meera
  rishi:        "giB9SBGRjhHhRPW4JKCE",  // Rishi
  kavya:        "nPczCjzI2devNBz1zQrb",  // Meera
  // Arabic
  haytham:      "Xb7hH8MSUJpSbSDYk0k2",  // Alice (neutral, closest available)
  layla:        "EXAVITQu4vr4xnSDxMaL",  // Bella
  omar:         "TxGEqnHWrfWFTfGW9XjX",  // Josh
  sara:         "21m00Tcm4TlvDq8ikWAM",  // Rachel
  khalid:       "ErXwobaYiN019PkySvjV",   // Antoni
  nour:         "MF3mGyEYCl7XYWbV9V6O",  // Elli
  // Other
  ellen:        "AZnzlk1XvdvUeBnXmlld",  // Domi (calm)
  akio:         "onwK4e9ZLuTAKqWW03F9",  // Daniel
  sofia:        "EXAVITQu4vr4xnSDxMaL",  // Bella
  luca:         "VR6AewLTigWG4xSOukaG",  // Arnold
};

const PREVIEW_TEXT = "Hi, I'm here to discuss how we can help your team hit their targets this quarter.";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { voiceKey } = await req.json();

    const elevenLabsKey = Deno.env.get("ELEVENLABS_API_KEY");
    if (!elevenLabsKey) {
      return new Response(JSON.stringify({ error: "ElevenLabs API key not configured" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const voiceId = VOICE_ID_MAP[voiceKey];
    if (!voiceId) {
      return new Response(JSON.stringify({ error: "Unknown voice" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": elevenLabsKey,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
      },
      body: JSON.stringify({
        text: PREVIEW_TEXT,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    });

    if (!ttsRes.ok) {
      const err = await ttsRes.text();
      return new Response(JSON.stringify({ error: `ElevenLabs error: ${err}` }), {
        status: ttsRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const audioBuffer = await ttsRes.arrayBuffer();

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
