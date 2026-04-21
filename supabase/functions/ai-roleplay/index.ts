import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// ─── ElevenLabs regional voice map ────────────────────────────────────────────
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
  Canadian: {
    Male:   { default: 'TxGEqnHWrfWFTfGW9XjX', professional: 'TxGEqnHWrfWFTfGW9XjX', authoritative: 'ErXwobaYiN019PkySvjV', casual: 'VR6AewLTigWG4xSOukaG', warm: 'VR6AewLTigWG4xSOukaG' },
    Female: { default: '21m00Tcm4TlvDq8ikWAM', professional: 'EXAVITQu4vr4xnSDxMaL', confident: 'jsCqWAovK2LkecY7zXl4', warm: '21m00Tcm4TlvDq8ikWAM', casual: 'MF3mGyEYCl7XYWbV9V6O' },
  },
};

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

  if (voiceId && !LEGACY_VOICE_KEYS[voiceId] && voiceId.length > 15) return voiceId;

  const legacyKey = voiceId || voice;
  if (legacyKey && LEGACY_VOICE_KEYS[legacyKey]) return LEGACY_VOICE_KEYS[legacyKey];

  const style = personalityToStyle(personality);
  const genderKey = gender === 'Female' ? 'Female' : 'Male';

  if (nationality && REGIONAL_VOICES[nationality]) {
    const gMap = REGIONAL_VOICES[nationality][genderKey] || REGIONAL_VOICES[nationality]['Male'];
    return gMap[style] || gMap['professional'] || gMap['default'];
  }

  const fallback = REGIONAL_VOICES.US[genderKey];
  return fallback[style] || fallback['professional'] || fallback['default'];
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function generateRealisticResponse(userText: string | null): string {
  const opening = ["Hello?", "Yes?", "Hello, who's this?", "Yeah, hello?"];
  const engagement = [
    "That's an interesting point. Could you elaborate on how that would specifically help with our current situation?",
    "I see. How does that compare to what other vendors have offered us in the past?",
    "Tell me more about the implementation timeline and what kind of support you'd provide.",
    "That sounds promising. What kind of ROI or measurable results can we expect in the first year?",
    "How would that integrate with our existing systems and processes?",
  ];
  const challenging = [
    "That sounds good in theory, but I'm concerned about the learning curve for our team.",
    "We've had some bad experiences with similar solutions in the past. What makes yours different?",
    "Price is always a consideration for us. Can you break down the cost structure?",
    "I'm curious about security and compliance. What certifications do you have?",
  ];
  const closing = [
    "This has been really helpful. What would be the next steps if we wanted to move forward?",
    "I think we're interested. What would a pilot program look like?",
    "When could we schedule a follow-up or demo?",
  ];

  if (!userText) return opening[Math.floor(Math.random() * opening.length)];
  if (/next steps|moving forward|trial|pilot|demo/i.test(userText))
    return closing[Math.floor(Math.random() * closing.length)];
  if (/concern|problem|issue|difficult|expensive|complex|worry/i.test(userText))
    return challenging[Math.floor(Math.random() * challenging.length)];
  return engagement[Math.floor(Math.random() * engagement.length)];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Read keys from env or app_settings
    const getKey = async (name: string): Promise<string | undefined> => {
      const envVal = Deno.env.get(name);
      if (envVal) return envVal;
      const { data } = await supabase
        .from("app_settings").select("value").eq("key", name).maybeSingle();
      return data?.value || undefined;
    };

    const { userText, prospect, transcriptHistory = [], knowledgeMaterialIds = [] } = await req.json();

    console.log("[ai-roleplay] Request:", { name: prospect?.name, hasUserText: !!userText, materialCount: knowledgeMaterialIds?.length });

    // Fetch API keys in parallel with knowledge materials
    const [openaiApiKey, elevenlabsApiKey] = await Promise.all([
      getKey("OPENAI_API_KEY"),
      getKey("ELEVENLABS_API_KEY"),
    ]);

    console.log("[ai-roleplay] Keys:", { hasOpenAI: !!openaiApiKey, keyLen: openaiApiKey?.length, hasElevenLabs: !!elevenlabsApiKey });

    // Build knowledge context
    let knowledgeContext = "";
    if (knowledgeMaterialIds?.length > 0) {
      const { data: materials } = await supabase
        .from("roleplay_knowledge_materials")
        .select("title, description, content_text, category")
        .in("id", knowledgeMaterialIds)
        .eq("is_active", true);

      if (materials?.length) {
        knowledgeContext = "\n\n## TRAINING MATERIALS:\n";
        for (const m of materials) {
          knowledgeContext += `\n### ${m.title} (${m.category})\n`;
          if (m.description) knowledgeContext += `${m.description}\n`;
          if (m.content_text) knowledgeContext += m.content_text.substring(0, 2000) + "\n";
        }
      }
    }

    // Build prompts
    const conversationHistory = (transcriptHistory as any[])
      .map((msg) => `${msg.speaker === "ai" ? "assistant" : "user"}: ${msg.text}`)
      .join("\n");

    let systemPrompt = "";
    let userPrompt = "";

    const prospectName = prospect.name || "the prospect";
    const prospectTitle = prospect.jobTitle || prospect.title || "professional";
    const prospectCompany = prospect.company || prospect.company_name || "a company";
    const prospectPersonality = prospect.personality || "";
    const prospectPains = Array.isArray(prospect.painPoints) ? prospect.painPoints : [];

    const basePersona = `You are ${prospectName}, ${prospectTitle} at ${prospectCompany}.${prospectPersonality ? ` Your personality: ${prospectPersonality}.` : ""}${prospectPains.length ? ` Your business challenges: ${prospectPains.join(", ")}.` : ""}`;

    if (!userText) {
      systemPrompt = `${basePersona}

You just received an unexpected sales call. Respond ONLY with 1-5 words exactly as you would when picking up: e.g. "Hello?", "Yes?", "Yeah, who's this?". Do NOT introduce yourself. Do NOT say your name or company. Just answer the phone briefly.${knowledgeContext}`;
      userPrompt = "You just picked up the phone.";
    } else {
      systemPrompt = `${basePersona}

You are in the middle of a sales call roleplay. Rules:
- NEVER say "I am ${prospectName}" or introduce yourself again — the caller already knows who you are.
- NEVER repeat information you already said in the conversation.
- Respond naturally to what the sales rep just said. Keep it to 1-3 sentences max.
- Stay in character: react based on your personality and challenges.
- If the sales rep asked a question, answer it briefly then push back or ask a follow-up.${knowledgeContext}`;
      userPrompt = conversationHistory
        ? `Conversation so far:\n${conversationHistory}\n\nSales Rep just said: ${userText}\n\nYour response:`
        : `Sales Rep just said: ${userText}\n\nYour response:`;
    }

    // Get AI text response
    let responseText = "";
    let usedFallback = false;

    if (openaiApiKey && openaiApiKey !== "test-key") {
      try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
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
            max_tokens: 150,
          }),
          signal: AbortSignal.timeout(15000),
        });

        if (res.ok) {
          const json = await res.json();
          responseText = json.choices?.[0]?.message?.content || "";
          console.log("[ai-roleplay] OpenAI OK, chars:", responseText.length);
        } else {
          const errText = await res.text();
          console.error("[ai-roleplay] OpenAI error:", res.status, errText.substring(0, 200));
        }
      } catch (e) {
        console.error("[ai-roleplay] OpenAI fetch error:", e);
      }
    }

    if (!responseText) {
      usedFallback = true;
      responseText = generateRealisticResponse(userText);
      console.log("[ai-roleplay] Using fallback response");
    }

    // Get audio from ElevenLabs
    let audioBase64: string | null = null;
    const resolvedVoiceId = resolveVoiceId(prospect);
    console.log("[ai-roleplay] Voice:", resolvedVoiceId, "ElevenLabs key:", !!elevenlabsApiKey);

    if (elevenlabsApiKey && elevenlabsApiKey !== "test-key" && resolvedVoiceId) {
      try {
        const res = await fetch(
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
              voice_settings: { stability: 0.5, similarity_boost: 0.75 },
            }),
            signal: AbortSignal.timeout(12000),
          }
        );

        if (res.ok) {
          const buf = await res.arrayBuffer();
          const bytes = new Uint8Array(buf);
          let binary = "";
          for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
          audioBase64 = btoa(binary);
          console.log("[ai-roleplay] ElevenLabs audio OK, bytes:", bytes.length);
        } else {
          const errText = await res.text();
          console.error("[ai-roleplay] ElevenLabs error:", res.status, errText.substring(0, 200));
        }
      } catch (e) {
        console.error("[ai-roleplay] ElevenLabs fetch error:", e);
      }
    }

    return new Response(
      JSON.stringify({ text: responseText, audio: audioBase64, openai_fallback: usedFallback }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[ai-roleplay] Fatal error:", error);
    return new Response(
      JSON.stringify({
        text: "Hello, who's this?",
        audio: null,
        openai_fallback: true,
        error: error.message,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
