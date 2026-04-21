import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// ─── ElevenLabs regional voice map (mirrors voiceMapping.js) ─────────────────
type VoiceStyleMap = Record<string, string>;
type GenderMap = Record<string, VoiceStyleMap>;
type RegionMap = Record<string, GenderMap>;

const REGIONAL_VOICES: RegionMap = {
  US: {
    Male:   { default: 'TxGEqnHWrfWFTfGW9XjX', professional: 'TxGEqnHWrfWFTfGW9XjX', authoritative: 'ErXwobaYiN019PkySvjV', casual: 'VR6AewLTigWG4xSOukaG', warm: 'VR6AewLTigWG4xSOukaG' },
    Female: { default: 'EXAVITQu4vr4xnSDxMaL', professional: 'EXAVITQu4vr4xnSDxMaL', confident: 'jsCqWAovK2LkecY7zXl4', authoritative: 'jsCqWAovK2LkecY7zXl4', warm: '21m00Tcm4TlvDq8ikWAM', casual: 'MF3mGyEYCl7XYWbV9V6O' },
  },
  UK: {
    Male:   { default: 'N2lVS1w4EtoT3dr4eOWO', professional: 'N2lVS1w4EtoT3dr4eOWO', authoritative: 'N2lVS1w4EtoT3dr4eOWO', casual: 'CYw3kZ02Hs0563khs1Fj', warm: 'CYw3kZ02Hs0563khs1Fj' },
    Female: { default: 'ThT5KcBeYPX3keUQqHPh', professional: 'ThT5KcBeYPX3keUQqHPh', confident: 'ThT5KcBeYPX3keUQqHPh', warm: 'AZnzlk1XvdvUeBnXmlld', casual: 'AZnzlk1XvdvUeBnXmlld' },
  },
  Indian: {
    Male:   { default: 'giB9SBGRjhHhRPW4JKCE', professional: 'giB9SBGRjhHhRPW4JKCE', authoritative: 'giB9SBGRjhHhRPW4JKCE', casual: 'giB9SBGRjhHhRPW4JKCE', warm: 'giB9SBGRjhHhRPW4JKCE' },
    Female: { default: 'nPczCjzI2devNBz1zQrb', professional: 'nPczCjzI2devNBz1zQrb', confident: 'nPczCjzI2devNBz1zQrb', warm: 'nPczCjzI2devNBz1zQrb', casual: 'nPczCjzI2devNBz1zQrb' },
  },
  Australian: {
    Male:   { default: 'ZQe5CZNOzWyzPSCn5a3c', professional: 'ZQe5CZNOzWyzPSCn5a3c', authoritative: 'ZQe5CZNOzWyzPSCn5a3c', casual: 'ZQe5CZNOzWyzPSCn5a3c', warm: 'ZQe5CZNOzWyzPSCn5a3c' },
    Female: { default: 'Zlb1dXrM653N07WRdFW3', professional: 'Zlb1dXrM653N07WRdFW3', confident: 'Zlb1dXrM653N07WRdFW3', warm: 'Zlb1dXrM653N07WRdFW3', casual: 'Zlb1dXrM653N07WRdFW3' },
  },
  Nigerian: {
    Male:   { default: 'pNInz6obpgDQGcFmaJgB', professional: 'TxGEqnHWrfWFTfGW9XjX', authoritative: 'ErXwobaYiN019PkySvjV', casual: 'VR6AewLTigWG4xSOukaG', warm: 'pNInz6obpgDQGcFmaJgB' },
    Female: { default: '21m00Tcm4TlvDq8ikWAM', professional: 'EXAVITQu4vr4xnSDxMaL', confident: 'jsCqWAovK2LkecY7zXl4', warm: '21m00Tcm4TlvDq8ikWAM', casual: 'MF3mGyEYCl7XYWbV9V6O' },
  },
  Ghanaian: {
    Male:   { default: 'pNInz6obpgDQGcFmaJgB', professional: 'TxGEqnHWrfWFTfGW9XjX', authoritative: 'ErXwobaYiN019PkySvjV', casual: 'VR6AewLTigWG4xSOukaG', warm: 'pNInz6obpgDQGcFmaJgB' },
    Female: { default: '21m00Tcm4TlvDq8ikWAM', professional: 'EXAVITQu4vr4xnSDxMaL', confident: 'jsCqWAovK2LkecY7zXl4', warm: '21m00Tcm4TlvDq8ikWAM', casual: 'MF3mGyEYCl7XYWbV9V6O' },
  },
  'South African': {
    Male:   { default: 'pNInz6obpgDQGcFmaJgB', professional: 'TxGEqnHWrfWFTfGW9XjX', authoritative: 'ErXwobaYiN019PkySvjV', casual: 'VR6AewLTigWG4xSOukaG', warm: 'pNInz6obpgDQGcFmaJgB' },
    Female: { default: 'EXAVITQu4vr4xnSDxMaL', professional: 'EXAVITQu4vr4xnSDxMaL', confident: 'jsCqWAovK2LkecY7zXl4', warm: '21m00Tcm4TlvDq8ikWAM', casual: 'MF3mGyEYCl7XYWbV9V6O' },
  },
  Arabic: {
    Male:   { default: 'ErXwobaYiN019PkySvjV', professional: 'ErXwobaYiN019PkySvjV', authoritative: 'ErXwobaYiN019PkySvjV', casual: 'TxGEqnHWrfWFTfGW9XjX', warm: 'TxGEqnHWrfWFTfGW9XjX' },
    Female: { default: 'jsCqWAovK2LkecY7zXl4', professional: 'jsCqWAovK2LkecY7zXl4', confident: 'jsCqWAovK2LkecY7zXl4', warm: 'EXAVITQu4vr4xnSDxMaL', casual: 'MF3mGyEYCl7XYWbV9V6O' },
  },
  Canadian: {
    Male:   { default: 'TxGEqnHWrfWFTfGW9XjX', professional: 'TxGEqnHWrfWFTfGW9XjX', authoritative: 'ErXwobaYiN019PkySvjV', casual: 'VR6AewLTigWG4xSOukaG', warm: 'VR6AewLTigWG4xSOukaG' },
    Female: { default: '21m00Tcm4TlvDq8ikWAM', professional: 'EXAVITQu4vr4xnSDxMaL', confident: 'jsCqWAovK2LkecY7zXl4', warm: '21m00Tcm4TlvDq8ikWAM', casual: 'MF3mGyEYCl7XYWbV9V6O' },
  },
};

// Legacy flat-key fallback
const LEGACY_VOICE_KEYS: Record<string, string> = {
  english_male: 'TxGEqnHWrfWFTfGW9XjX',
  english_male_casual: 'VR6AewLTigWG4xSOukaG',
  english_male_authoritative: 'ErXwobaYiN019PkySvjV',
  english_male_deep: 'N2lVS1w4EtoT3dr4eOWO',
  english_female: 'EXAVITQu4vr4xnSDxMaL',
  english_female_friendly: 'MF3mGyEYCl7XYWbV9V6O',
  english_female_confident: 'jsCqWAovK2LkecY7zXl4',
  english_female_warm: '21m00Tcm4TlvDq8ikWAM',
  english_neutral: 'pNInz6obpgDQGcFmaJgB',
  english_neutral_warm: 'yoZ06aMxZJJ28mfd3POQ',
};

function personalityToStyle(personality: string): string {
  const p = personality.toLowerCase();
  if (/authoritative|aggressive|assertive|rude|direct/i.test(p)) return 'authoritative';
  if (/confident|skeptical|formal|professional/i.test(p)) return 'confident';
  if (/casual|chatty|friendly|nice|enthusiastic|cooperative/i.test(p)) return 'casual';
  if (/warm|empathetic/i.test(p)) return 'warm';
  return 'default';
}

function resolveVoiceId(prospect: {
  voiceId?: string;
  voice?: string;
  gender?: string;
  personality?: string;
  nationality?: string;
}): string {
  const { voiceId, voice, gender = 'Male', personality = '', nationality = '' } = prospect;

  // 1. Raw ElevenLabs ID passed directly (not a named key, longer than any key)
  if (voiceId && !LEGACY_VOICE_KEYS[voiceId] && voiceId.length > 15) {
    return voiceId;
  }

  // 2. Legacy voice key
  const legacyKey = voiceId || voice;
  if (legacyKey && LEGACY_VOICE_KEYS[legacyKey]) {
    return LEGACY_VOICE_KEYS[legacyKey];
  }

  const style = personalityToStyle(personality);
  const genderKey = gender === 'Female' ? 'Female' : 'Male';

  // 3. Region-specific voice
  if (nationality && REGIONAL_VOICES[nationality]) {
    const gMap = REGIONAL_VOICES[nationality][genderKey] || REGIONAL_VOICES[nationality]['Male'];
    return gMap[style] || gMap['professional'] || gMap['default'];
  }

  // 4. Default to US voices
  const fallback = REGIONAL_VOICES.US[genderKey];
  return fallback[style] || fallback['professional'] || fallback['default'];
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface TranscriptMessage {
  speaker: string;
  text: string;
  timestamp: string;
}

interface RoleplayRequest {
  userText: string | null;
  prospect: {
    name: string;
    company?: string;
    jobTitle?: string;
    personality?: string;
    painPoints?: string[];
    industry?: string;
    voiceId?: string;
    voice?: string;
    gender?: string;
    nationality?: string;
  };
  transcriptHistory: TranscriptMessage[];
  knowledgeMaterialIds?: string[];
}

// No ElevenLabs key — return null so frontend shows text-only mode
function generateMockAudio(_text: string): null {
  return null;
}

function generateRealisticResponse(userText: string | null, prospect: any, knowledgeContext: string): string {
  const responses = {
    opening: [
      "Hello?",
      "Yes?",
      "Hello, who's this?",
      "Yeah, hello?",
    ],
    engagement: [
      "That's an interesting point. Could you elaborate on how that would specifically help with our current situation?",
      "I see. How does that compare to what other vendors have offered us in the past?",
      "Tell me more about the implementation timeline and what kind of support you'd provide.",
      "That sounds promising. What kind of ROI or measurable results can we expect in the first year?",
      "I appreciate that. Can you walk me through a specific use case that's similar to our business?",
      "Interesting. How would that integrate with our existing systems and processes?",
      "I like what you're saying. What kind of training and onboarding process would we go through?",
    ],
    challenging: [
      "That sounds good in theory, but I'm concerned about the learning curve for our team. How complex is the implementation?",
      "We've had some bad experiences with similar solutions in the past. What makes yours different?",
      "Price is always a consideration for us. Can you break down the cost structure and what's included?",
      "I'm curious about security and compliance. What certifications do you have and how do you handle data protection?",
      "Our IT team is always concerned about system performance. How will this impact our current infrastructure?",
    ],
    closing: [
      "This has been really helpful. What would be the next steps if we wanted to move forward?",
      "I think we're interested. What would a pilot program or trial look like?",
      "This sounds like something worth exploring. When could we schedule a follow-up or demo?",
    ],
  };

  if (!userText) {
    return responses.opening[Math.floor(Math.random() * responses.opening.length)];
  }

  const hasNegative = /concern|problem|issue|difficult|expensive|complex|worry/i.test(userText);
  const hasQuestion = /\?/.test(userText);
  const hasClose = /next steps|moving forward|trial|pilot|demo/i.test(userText);

  if (hasClose) {
    return responses.closing[Math.floor(Math.random() * responses.closing.length)];
  }

  if (hasNegative) {
    return responses.challenging[Math.floor(Math.random() * responses.challenging.length)];
  }

  return responses.engagement[Math.floor(Math.random() * responses.engagement.length)];
}

async function extractTextFromUrl(url: string, materialType: string): Promise<string> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) return "";

    const contentType = response.headers.get("content-type") || "";

    if (
      materialType === "text" ||
      contentType.includes("text/plain") ||
      url.endsWith(".txt") ||
      url.endsWith(".md")
    ) {
      const text = await response.text();
      return text.substring(0, 8000);
    }

    if (
      contentType.includes("text/html") ||
      url.endsWith(".html") ||
      url.endsWith(".htm")
    ) {
      const html = await response.text();
      const stripped = html
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s{2,}/g, " ")
        .trim();
      return stripped.substring(0, 8000);
    }

    if (
      materialType === "document" &&
      (contentType.includes("application/pdf") || url.toLowerCase().endsWith(".pdf"))
    ) {
      return `[PDF document available at: ${url}. Use the title and description as context since direct PDF reading is not available in this environment.]`;
    }

    if (
      contentType.includes("application/json") ||
      url.endsWith(".json")
    ) {
      const json = await response.text();
      return json.substring(0, 8000);
    }

    if (
      contentType.includes("text/csv") ||
      url.endsWith(".csv")
    ) {
      const csv = await response.text();
      return csv.substring(0, 8000);
    }

    return "";
  } catch (_err) {
    return "";
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Read API keys: prefer env secrets, fall back to app_settings table
    const getSettingKey = async (envName: string): Promise<string | undefined> => {
      const envVal = Deno.env.get(envName);
      if (envVal) return envVal;
      const { data } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", envName)
        .maybeSingle();
      return data?.value || undefined;
    };

    const openaiApiKey = await getSettingKey("OPENAI_API_KEY");
    const elevenlabsApiKey = await getSettingKey("ELEVENLABS_API_KEY");

    const {
      userText,
      prospect,
      transcriptHistory = [],
      knowledgeMaterialIds = [],
    }: RoleplayRequest = await req.json();

    let knowledgeContext = "";

    if (knowledgeMaterialIds && knowledgeMaterialIds.length > 0) {
      const { data: materials, error: materialsError } = await supabase
        .from("roleplay_knowledge_materials")
        .select("title, description, content_text, file_url, material_type, category")
        .in("id", knowledgeMaterialIds)
        .eq("is_active", true);

      if (!materialsError && materials && materials.length > 0) {
        knowledgeContext = "\n\n## TRAINING MATERIALS TO REFERENCE:\n\n";

        for (const material of materials) {
          knowledgeContext += `### ${material.title} (${material.category})\n`;
          if (material.description) {
            knowledgeContext += `Summary: ${material.description}\n\n`;
          }

          if (material.content_text && material.content_text.trim().length > 0) {
            const contentPreview = material.content_text.substring(0, 4000);
            knowledgeContext += `Content:\n${contentPreview}${material.content_text.length > 4000 ? "...(truncated)" : ""}\n\n`;
          } else if (material.file_url && material.file_url.trim().length > 0) {
            const extractedText = await extractTextFromUrl(material.file_url, material.material_type || "document");
            if (extractedText && extractedText.length > 0) {
              knowledgeContext += `Content:\n${extractedText}\n\n`;
            } else {
              knowledgeContext += `[Uploaded file: ${material.file_url}. Use the title and description as context.]\n\n`;
            }
          }
        }

        knowledgeContext +=
          "\nYou should naturally reference these materials during conversation. Test the sales rep's knowledge by asking questions about these materials when appropriate. Make sure they understand and can apply the concepts. If they cannot answer questions about these materials, gently push back and ask for clarification.\n";
      }
    }

    const conversationHistory = transcriptHistory
      .map((msg) => {
        const role = msg.speaker === "ai" ? "assistant" : "user";
        return `${role}: ${msg.text}`;
      })
      .join("\n");

    let systemPrompt = "";
    let userPrompt = "";

    if (!userText) {
      systemPrompt = `You are ${prospect.name}, a ${prospect.jobTitle || "professional"} at ${
        prospect.company || "a company"
      }. ${
        prospect.personality
          ? `Your personality: ${prospect.personality}.`
          : ""
      }

${
  prospect.painPoints && prospect.painPoints.length > 0
    ? `Your current challenges: ${prospect.painPoints.join(", ")}.`
    : ""
}

This is an OUTBOUND cold call from a sales representative to you. You just picked up the phone.

CRITICAL RULES for picking up:
- You do NOT know who is calling
- You NEVER introduce yourself first on an outbound call — the caller must introduce themselves
- Your opening must be extremely short: just "Hello?" or "Yes?" or "Hello, who's this?" or similar — 1-5 words maximum
- Show the appropriate emotion for your personality (e.g. busy/slightly annoyed if Skeptical, neutral if Analytical, warm if Friendly)
- Do NOT say your name or company in this first response

${knowledgeContext}`;

      userPrompt = "You just picked up the phone. Give your one-line answer.";
    } else {
      systemPrompt = `You are ${prospect.name}, a ${prospect.jobTitle || "professional"} at ${
        prospect.company || "a company"
      }. ${
        prospect.personality
          ? `Your personality: ${prospect.personality}.`
          : ""
      }

${
  prospect.painPoints && prospect.painPoints.length > 0
    ? `Your current challenges: ${prospect.painPoints.join(", ")}.`
    : ""
}

You are on a sales call with a sales representative. This is a training roleplay session.

${knowledgeContext}

Conversation so far:
${conversationHistory}

Your role:
- Continue the conversation naturally based on what the sales rep just said
- ${
        knowledgeContext
          ? "Ask specific, probing questions about the training material content — test whether the rep truly knows the product, pricing, competitive differentiators, or concepts from the uploaded documents"
          : "Ask probing questions about their solution"
      }
- If the rep gives a vague or incorrect answer about something covered in the materials, push back: ask follow-up questions or express doubt
- Respond positively and with more trust when they demonstrate deep expertise
- Express concerns or confusion when they're unclear or lack knowledge
- Keep responses realistic and concise (2-4 sentences)
- Stay in character

Respond to the sales rep's last message.`;

      userPrompt = `Sales Rep: ${userText}`;
    }

    let responseText = "";
    let audioBase64 = null;
    let usedFallback = false;

    if (openaiApiKey && openaiApiKey !== "test-key") {
      try {
        const openaiResponse = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${openaiApiKey}`,
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
              ],
              temperature: 0.8,
              max_tokens: 300,
            }),
          }
        );

        if (!openaiResponse.ok) {
          const errorData = await openaiResponse.text();
          console.error("OpenAI API error:", errorData);
          throw new Error(`OpenAI API error: ${openaiResponse.status}`);
        }

        const openaiData = await openaiResponse.json();
        responseText =
          openaiData.choices[0]?.message?.content ||
          "I'm interested in learning more about your solution.";
      } catch (error) {
        console.error("OpenAI error:", error);
        usedFallback = true;
        responseText = generateRealisticResponse(userText, prospect, knowledgeContext);
      }
    } else {
      usedFallback = true;
      responseText = generateRealisticResponse(userText, prospect, knowledgeContext);
    }

    const resolvedVoiceId = resolveVoiceId(prospect);

    if (elevenlabsApiKey && resolvedVoiceId) {
      if (elevenlabsApiKey === "test-key") {
        audioBase64 = generateMockAudio(responseText);
      } else {
        try {
          const elevenlabsResponse = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${resolvedVoiceId}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "xi-api-key": elevenlabsApiKey,
              },
              body: JSON.stringify({
                text: responseText,
                model_id: "eleven_monolingual_v1",
                voice_settings: {
                  stability: 0.5,
                  similarity_boost: 0.75,
                },
              }),
            }
          );

          if (elevenlabsResponse.ok) {
            const audioArrayBuffer = await elevenlabsResponse.arrayBuffer();
            audioBase64 = btoa(
              String.fromCharCode(...new Uint8Array(audioArrayBuffer))
            );
          } else {
            console.log("ElevenLabs API error:", elevenlabsResponse.status);
            audioBase64 = generateMockAudio(responseText);
          }
        } catch (error) {
          console.error("ElevenLabs error:", error);
          audioBase64 = generateMockAudio(responseText);
        }
      }
    } else if (resolvedVoiceId) {
      audioBase64 = generateMockAudio(responseText);
    }

    return new Response(
      JSON.stringify({
        text: responseText,
        audio: audioBase64,
        openai_fallback: usedFallback,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("AI Roleplay error:", error);

    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error",
        text: "I'm having some technical difficulties. Could we try that again?",
        audio: null,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
