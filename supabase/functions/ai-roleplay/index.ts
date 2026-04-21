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

    const { userText, prospect, transcriptHistory = [], knowledgeMaterialIds = [], wasInterrupted = false, analyzeOnly = false } = await req.json();

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

    // ── analyzeOnly: post-call analysis (replaces broken InvokeLLM path) ────────
    if (analyzeOnly) {
      const transcript = (transcriptHistory as any[])
        .map((m: any) => `${m.speaker === "ai" ? (prospect?.name || "Prospect") : "Sales Rep"}: ${m.text}`)
        .join("\n");

      let analysisResult = null;
      if (openaiApiKey && openaiApiKey !== "test-key") {
        try {
          const res = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${openaiApiKey}` },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [{
                role: "user",
                content: `Analyze this sales roleplay conversation. Return ONLY valid JSON with these exact keys:
{
  "overall_score": <number 0-100>,
  "feedback_summary": "<2-3 sentences of coaching feedback>",
  "what_went_well": ["<point 1>", "<point 2>"],
  "areas_for_improvement": ["<point 1>", "<point 2>"],
  "scorecard": [
    {"category": "Opening & Rapport", "passed": <bool>, "note": "<brief note>"},
    {"category": "Discovery Questions", "passed": <bool>, "note": "<brief note>"},
    {"category": "Value Articulation", "passed": <bool>, "note": "<brief note>"},
    {"category": "Objection Handling", "passed": <bool>, "note": "<brief note>"},
    {"category": "Closing & Next Steps", "passed": <bool>, "note": "<brief note>"}
  ]
}

Conversation:
${transcript}`
              }],
              temperature: 0.3,
              max_tokens: 600,
            }),
            signal: AbortSignal.timeout(20000),
          });
          if (res.ok) {
            const json = await res.json();
            const raw = json.choices?.[0]?.message?.content || "";
            const jsonMatch = raw.match(/\{[\s\S]*\}/);
            if (jsonMatch) analysisResult = JSON.parse(jsonMatch[0]);
          }
        } catch (e) {
          console.error("[ai-roleplay] analyzeOnly error:", e);
        }
      }

      return new Response(
        JSON.stringify({ analysis: analysisResult }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Farewell detection ────────────────────────────────────────────────────
    const farewellPattern = /\b(bye|goodbye|hang up|hanging up|gotta go|got to go|i('ll| will) let you go|talk (to you )?later|have a good|take care|that('s| is) all|end the call|i('m| am) done|no thanks|not interested anymore|thanks? for your time)\b/i;
    const isFarewell = userText && farewellPattern.test(userText);

    // Build prompts
    const conversationHistory = (transcriptHistory as any[])
      .map((msg) => `${msg.speaker === "ai" ? "assistant" : "user"}: ${msg.text}`)
      .join("\n");

    let systemPrompt = "";
    let userPrompt = "";

    // ── Extract every available field from the prospect object ──────────────────
    const prospectName      = prospect.name || [prospect.first_name, prospect.last_name].filter(Boolean).join(' ') || "the prospect";
    const prospectTitle     = prospect.title || prospect.jobTitle || "professional";
    const prospectCompany   = prospect.company_name || prospect.company || "a company";
    const prospectIndustry  = prospect.industry || "";
    const prospectPersonality = prospect.personality || "professional";
    const prospectEmotionalState = prospect.emotional_state || "Neutral";
    const prospectDifficulty = prospect.difficulty || "Medium";
    const buyerAwareness    = prospect.buyer_awareness_level || prospect.roleplay_scenario || "";
    const roleplType        = prospect.roleplay_type || "Cold Call";
    const callGoal          = prospect.call_goal || "";
    const sellingContext    = prospect.selling_context || prospect.company_offerings_context || "";
    const traits            = Array.isArray(prospect.traits) ? prospect.traits : [];
    const painPoints        = Array.isArray(prospect.painPoints) ? prospect.painPoints : Array.isArray(prospect.priorities_and_objections) ? [prospect.priorities_and_objections] : [];
    const commonObjections  = Array.isArray(prospect.common_objections) ? prospect.common_objections : [];
    const buyerOpinions     = Array.isArray(prospect.buyer_opinions) ? prospect.buyer_opinions : [];
    const personaTags       = Array.isArray(prospect.persona_tags) ? prospect.persona_tags : [];
    const callGoalTags      = Array.isArray(prospect.call_goal_tags) ? prospect.call_goal_tags : [];
    const background        = prospect.background || "";

    // ── Difficulty → behavioral instructions ────────────────────────────────────
    const difficultyGuide = {
      Easy:   "Be fairly cooperative and open. Answer questions helpfully, raise objections gently.",
      Medium: "Be realistic — occasionally push back, ask clarifying questions, express mild skepticism.",
      Hard:   "Be skeptical and busy. Challenge assumptions, raise objections often, don't give information away freely.",
    }[prospectDifficulty] || "Be realistic and moderately challenging.";

    // ── Personality → behavioral tone ───────────────────────────────────────────
    const personalityGuide: Record<string, string> = {
      Nice: "Warm and friendly. Easy to talk to but still professional.",
      Analytical: "Data-driven. Ask for specifics, numbers, proof. Skeptical of vague claims.",
      Formal: "Structured, polished. Stick to professional language. Don't deviate.",
      Rude: "Impatient and blunt. Interrupt if bored. Sigh. Ask 'get to the point' if rambling.",
      Chatty: "Talkative and digress easily. Friendly but hard to keep on topic.",
    };
    const personalityInstruction = personalityGuide[prospectPersonality] || `Personality style: ${prospectPersonality}.`;

    // ── Buyer awareness → how informed/receptive they are ───────────────────────
    const awarenessGuide: Record<string, string> = {
      "Not Ready to Buy": "You have no urgency. Not actively looking for solutions.",
      "Is Aware of Problem": "You know there's a problem but haven't actively sought a solution.",
      "Problem Aware Not Solution Aware": "You feel the pain but don't know what kind of solution exists.",
      "Solution Aware": "You know solutions like this exist but haven't evaluated them yet.",
      "Product Aware": "You've heard of this product category, maybe even competitors.",
      "Pre-existing Champion": "You've heard good things internally and are open to hearing more.",
    };
    const awarenessInstruction = buyerAwareness ? (awarenessGuide[buyerAwareness] || `Buyer stage: ${buyerAwareness}.`) : "";

    // ── Build the rich base persona ──────────────────────────────────────────────
    const basePersona = [
      `You are ${prospectName}, ${prospectTitle} at ${prospectCompany}${prospectIndustry ? ` (${prospectIndustry} industry)` : ""}.`,
      background ? `Background: ${background}` : "",
      traits.length ? `Your character traits: ${traits.join(", ")}.` : "",
      personaTags.length ? `You are a: ${personaTags.join(", ")}.` : "",
      `Personality: ${personalityInstruction}`,
      `Current emotional state: ${prospectEmotionalState}.`,
      painPoints.length ? `Your key business challenges: ${painPoints.join("; ")}.` : "",
      commonObjections.length ? `Objections you typically raise: ${commonObjections.join("; ")}.` : "",
      buyerOpinions.length ? `Your current opinions/beliefs: ${buyerOpinions.join("; ")}.` : "",
      awarenessInstruction,
      sellingContext ? `What the caller is selling: ${sellingContext}` : "",
      `Difficulty level for this roleplay: ${prospectDifficulty}. ${difficultyGuide}`,
    ].filter(Boolean).join("\n");

    const coreRules = `
CORE RULES (never break these):
- You ARE ${prospectName}. Stay in character 100% of the time.
- NEVER acknowledge this is a roleplay, simulation, or AI. You are a real person.
- NEVER introduce yourself again after the first greeting — the caller already knows who you are.
- NEVER repeat what you already said in the conversation.
- Keep responses SHORT: 1–3 sentences unless you are deliberately being chatty or asking multiple questions.
- React authentically to the flow of the conversation — not just the last message.
- If the caller talks too long without a question, feel free to say "okay, and?" or "right, what's the ask?"`;

    if (!userText) {
      systemPrompt = `${basePersona}
${coreRules}

You just received an unexpected inbound or outbound ${roleplType}. React EXACTLY like a real person picking up a call they weren't expecting. Respond with 1–5 words only — no name, no company, just answer the phone naturally. Examples: "Hello?", "Yes?", "Yeah, who's this?", "Mm-hmm?", "Go ahead."${knowledgeContext}`;
      userPrompt = "You just picked up the phone.";

    } else if (isFarewell) {
      systemPrompt = `${basePersona}
${coreRules}

The sales rep is wrapping up the call. Give a brief, natural, in-character goodbye — 1 sentence only. Make it feel real.${knowledgeContext}`;
      userPrompt = conversationHistory
        ? `Conversation:\n${conversationHistory}\n\nSales Rep: ${userText}\n\nYour goodbye:`
        : `Sales Rep said: ${userText}\n\nYour goodbye:`;

    } else if (wasInterrupted) {
      const msgCount = (transcriptHistory as any[]).length;
      const interruptStyle =
        msgCount <= 2 ? "You just answered the phone. Pause naturally, let them speak. e.g. 'Oh sure, go ahead.'" :
        msgCount <= 6 ? "You were early in the call. Acknowledge warmly. e.g. 'Sorry, please go ahead.' or 'Sure, what were you saying?'" :
        "You were mid-point in the conversation. React honestly — curious or mildly surprised. e.g. 'Oh — go ahead.' or 'No no, I want to hear this.'";

      systemPrompt = `${basePersona}
${coreRules}

The caller just interrupted you mid-sentence. ${interruptStyle} 1 sentence max.${knowledgeContext}`;
      userPrompt = conversationHistory
        ? `Conversation so far:\n${conversationHistory}\n\nCaller interrupted and said: "${userText}"\n\nYour reaction:`
        : `Caller interrupted and said: "${userText}"\n\nYour reaction:`;

    } else {
      // Build call-goal context for the main turns
      const callGoalContext = callGoal
        ? `The caller's stated goal for this call is: "${callGoal}". React to whether they're achieving it or not.`
        : callGoalTags.length ? `The caller is likely trying to: ${callGoalTags.join(", ")}.` : "";

      systemPrompt = `${basePersona}
${coreRules}
${callGoalContext ? `\nCALL CONTEXT:\n${callGoalContext}` : ""}

CONVERSATION GUIDANCE:
- React to what the caller actually says — don't just answer robotically.
- Surface your pain points, objections, or opinions when they're relevant to what's being discussed.
- If you're analytical, ask for data. If you're rude, show impatience. If you're chatty, go off on a tangent.
- If the caller says something impressive or relevant, acknowledge it genuinely.
- If they say something vague or salesy, push back: "What does that actually mean for us?"
- Occasionally ask YOUR own questions to keep it real (budget, timeline, who else is involved).${knowledgeContext}`;

      userPrompt = conversationHistory
        ? `Conversation so far:\n${conversationHistory}\n\nSales Rep just said: ${userText}\n\nYour response (stay in character, 1–3 sentences):`
        : `Sales Rep just said: ${userText}\n\nYour response (stay in character, 1–3 sentences):`;
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
      responseText = isFarewell ? "Alright, take care. Bye." : generateRealisticResponse(userText);
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
              model_id: "eleven_turbo_v2_5",
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
      JSON.stringify({ text: responseText, audio: audioBase64, openai_fallback: usedFallback, callEnded: isFarewell }),
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
