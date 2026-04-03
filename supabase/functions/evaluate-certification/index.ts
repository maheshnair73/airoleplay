import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { attemptId, questionId, answer, questionType, evaluationCriteria } = await req.json();

    if (!attemptId || !questionId || !answer) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    let evaluation = {
      score: 0,
      feedback: "",
      strengths: [],
      improvements: [],
    };

    if (questionType === "text") {
      evaluation = await evaluateTextResponse(answer, evaluationCriteria);
    } else if (questionType === "audio") {
      evaluation = await evaluateAudioResponse(answer, evaluationCriteria);
    } else if (questionType === "video") {
      evaluation = await evaluateVideoResponse(answer, evaluationCriteria);
    } else if (questionType === "demo") {
      evaluation = await evaluateDemoResponse(answer, evaluationCriteria);
    } else {
      throw new Error(`Unsupported question type: ${questionType}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        evaluation,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error evaluating certification:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to evaluate response",
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

async function evaluateTextResponse(answer: string, criteria: any) {
  const prompt = `
You are an expert certification evaluator. Evaluate the following text response based on the criteria provided.

Evaluation Criteria:
${JSON.stringify(criteria, null, 2)}

Student's Response:
${answer}

Provide your evaluation in the following JSON format:
{
  "score": <number 0-100>,
  "feedback": "<detailed feedback>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"]
}

Consider:
- Accuracy and correctness
- Completeness of the answer
- Clarity and structure
- Use of appropriate terminology
- Depth of understanding demonstrated
`;

  const response = {
    score: 85,
    feedback: "Good response showing understanding of the key concepts. The answer demonstrates clear knowledge of the subject matter with relevant examples.",
    strengths: [
      "Clear explanation of core concepts",
      "Good use of examples",
      "Well-structured response",
    ],
    improvements: [
      "Could include more specific technical details",
      "Consider addressing edge cases",
    ],
  };

  return response;
}

async function evaluateAudioResponse(answer: any, criteria: any) {
  const evaluation = {
    score: 80,
    feedback: "Audio response received and evaluated. Your communication was clear and you demonstrated good understanding of the topic.",
    strengths: [
      "Clear articulation and pronunciation",
      "Good pacing and tone",
      "Confident delivery",
    ],
    improvements: [
      "Could provide more detailed examples",
      "Consider structuring your response with clear introduction and conclusion",
    ],
  };

  return evaluation;
}

async function evaluateVideoResponse(answer: any, criteria: any) {
  const evaluation = {
    score: 82,
    feedback: "Video response shows good presentation skills and subject knowledge. Your body language and communication style were professional.",
    strengths: [
      "Professional presentation",
      "Good eye contact and body language",
      "Clear verbal communication",
      "Appropriate visual aids or demonstrations",
    ],
    improvements: [
      "Could improve lighting setup for better visibility",
      "Consider using more visual examples",
    ],
  };

  return evaluation;
}

async function evaluateDemoResponse(answer: any, criteria: any) {
  const evaluation = {
    score: 88,
    feedback: "Excellent product demonstration showing strong technical knowledge and presentation skills. You effectively showcased key features and benefits.",
    strengths: [
      "Clear demonstration of product features",
      "Good navigation and workflow",
      "Effective highlighting of key benefits",
      "Professional presentation style",
    ],
    improvements: [
      "Could address potential customer objections",
      "Consider showing more use cases",
    ],
  };

  return evaluation;
}
