import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

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
  };
  transcriptHistory: TranscriptMessage[];
  knowledgeMaterialIds?: string[];
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
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    const elevenlabsApiKey = Deno.env.get("ELEVENLABS_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
        .select("title, description, content_text, category")
        .in("id", knowledgeMaterialIds)
        .eq("is_active", true);

      if (!materialsError && materials && materials.length > 0) {
        knowledgeContext = "\n\n## TRAINING MATERIALS TO REFERENCE:\n\n";
        materials.forEach((material) => {
          knowledgeContext += `### ${material.title} (${material.category})\n`;
          knowledgeContext += `${material.description || ""}\n\n`;
          if (material.content_text) {
            const contentPreview = material.content_text.substring(0, 3000);
            knowledgeContext += `${contentPreview}${
              material.content_text.length > 3000 ? "..." : ""
            }\n\n`;
          }
        });

        knowledgeContext +=
          "\nYou should naturally reference these materials during conversation. Test the sales rep's knowledge by asking questions about these materials when appropriate. Make sure they understand and can apply the concepts.\n";
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

You are on a sales call with a sales representative. This is a training roleplay session designed to help the sales rep practice their skills.

${knowledgeContext}

Your role:
- Be a realistic prospect who engages naturally in conversation
- Start the conversation with a warm greeting and briefly mention your role
- Ask questions that a real prospect would ask
- ${
        knowledgeContext
          ? "Test the rep's knowledge of the training materials by asking relevant questions"
          : "Raise objections based on your pain points"
      }
- Show interest when the rep demonstrates good knowledge
- Be skeptical or confused when the rep lacks knowledge
- Keep responses conversational and realistic (2-4 sentences)
- Stay in character throughout

Begin the conversation naturally.`;

      userPrompt = "Start the sales call.";
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
          ? "Ask questions about the training materials to test their knowledge"
          : "Ask probing questions about their solution"
      }
- Respond positively when they demonstrate expertise
- Express concerns or confusion when they're unclear or lack knowledge
- Keep responses realistic and concise (2-4 sentences)
- Stay in character

Respond to the sales rep's last message.`;

      userPrompt = `Sales Rep: ${userText}`;
    }

    let responseText = "";
    let audioBase64 = null;
    let usedFallback = false;

    if (openaiApiKey) {
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
        responseText = userText
          ? `That's interesting. Tell me more about how that would work in practice.`
          : `Hi, this is ${prospect.name}. Thanks for taking the time to speak with me today. What did you want to discuss?`;
      }
    } else {
      usedFallback = true;
      responseText = userText
        ? `I appreciate that perspective. Could you elaborate on how your solution addresses my specific needs?`
        : `Hello, I'm ${prospect.name}. I'm looking forward to our conversation today.`;
    }

    if (elevenlabsApiKey && prospect.voiceId) {
      try {
        const elevenlabsResponse = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${prospect.voiceId}`,
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
        }
      } catch (error) {
        console.error("ElevenLabs error:", error);
      }
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
