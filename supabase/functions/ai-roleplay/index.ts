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

function generateMockAudio(text: string): string {
  const audioDataLength = Math.ceil((text.length / 4) * 1000);
  const audioData = new Uint8Array(audioDataLength);

  for (let i = 0; i < audioDataLength; i++) {
    audioData[i] = Math.floor(Math.random() * 256);
  }

  return btoa(String.fromCharCode(...audioData));
}

function generateRealisticResponse(userText: string | null, prospect: any, knowledgeContext: string): string {
  const responses = {
    opening: [
      `Hi, this is ${prospect.name}. Thanks for taking the time to speak with me today. What did you want to discuss?`,
      `Hello, I'm ${prospect.name} from ${prospect.company || "our company"}. Nice to meet you. What brings you to our call today?`,
      `Thanks for scheduling this call. I'm ${prospect.name}, ${prospect.jobTitle || "a professional"} here. How can I help?`,
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

You are on a sales call with a sales representative. This is a training roleplay session designed to help the sales rep practice their skills.

${knowledgeContext}

Your role:
- Be a realistic prospect who engages naturally in conversation
- Start the conversation with a warm greeting and briefly mention your role
- Ask questions that a real prospect would ask
- ${
        knowledgeContext
          ? "Test the rep's knowledge of the training materials — ask about specific features, pricing, use cases, or concepts mentioned in the materials"
          : "Raise objections based on your pain points"
      }
- Show genuine interest when the rep demonstrates strong product knowledge
- Be skeptical or ask for clarification when the rep is vague or incorrect
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

    if (elevenlabsApiKey && prospect.voiceId) {
      if (elevenlabsApiKey === "test-key") {
        audioBase64 = generateMockAudio(responseText);
      } else {
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
            audioBase64 = generateMockAudio(responseText);
          }
        } catch (error) {
          console.error("ElevenLabs error:", error);
          audioBase64 = generateMockAudio(responseText);
        }
      }
    } else if (prospect.voiceId) {
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
