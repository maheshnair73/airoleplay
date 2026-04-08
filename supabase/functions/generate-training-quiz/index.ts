import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface QuizQuestion {
  question_text: string;
  question_type: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  difficulty: string;
  points: number;
  tags: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { documentId, content, title, difficulty = 'medium', questionCount = 8 } = await req.json();

    if (!content || content.trim().length < 100) {
      return new Response(
        JSON.stringify({
          error: "Content is too short. Please provide at least 100 characters of training material."
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Prepare the prompt for AI quiz generation
    const systemPrompt = `You are an expert instructional designer creating quiz questions for sales training content.
Your questions should test understanding, application, and retention of the material.

Generate ${questionCount} multiple-choice questions based on the provided training content.
Questions should vary in difficulty and cover different aspects of the material.

For each question, provide:
1. A clear, concise question text
2. Exactly 4 answer options (A, B, C, D)
3. The correct answer (A, B, C, or D)
4. A brief explanation of why the answer is correct
5. A difficulty level (easy, medium, hard)
6. Relevant tags for categorization

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "question_text": "What is the primary benefit of active listening in sales?",
      "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
      "correct_answer": "A",
      "explanation": "Brief explanation of why A is correct and why this matters.",
      "difficulty": "medium",
      "tags": ["communication", "listening", "sales-skills"]
    }
  ]
}`;

    const userPrompt = `Training Document Title: ${title}

Training Content:
${content.substring(0, 8000)}

Generate ${questionCount} high-quality quiz questions with difficulty level: ${difficulty}`;

    // Mock AI response for demonstration
    // In production, this would call OpenAI or another LLM API
    const mockQuestions: QuizQuestion[] = [
      {
        question_text: `What is the key concept covered in "${title}"?`,
        question_type: "multiple_choice",
        options: [
          "Building rapport and establishing trust with prospects",
          "Closing deals as quickly as possible",
          "Avoiding objections by talking more",
          "Focusing only on product features"
        ],
        correct_answer: "A",
        explanation: "Building rapport and trust is fundamental to successful sales relationships, as covered in the training material.",
        difficulty: difficulty,
        points: 1,
        tags: ["fundamentals", "rapport", "trust"]
      },
      {
        question_text: "According to the training, what is the best approach when handling objections?",
        question_type: "multiple_choice",
        options: [
          "Acknowledge, understand, and address concerns with empathy",
          "Argue with the prospect to prove them wrong",
          "Ignore objections and continue with your pitch",
          "Immediately offer a discount"
        ],
        correct_answer: "A",
        explanation: "Effective objection handling involves empathy and understanding, not confrontation or avoidance.",
        difficulty: difficulty,
        points: 1,
        tags: ["objection-handling", "communication", "empathy"]
      },
      {
        question_text: "What role does active listening play in the sales process?",
        question_type: "multiple_choice",
        options: [
          "It helps identify customer needs and build stronger relationships",
          "It wastes time that could be spent talking about products",
          "It's only necessary during the closing phase",
          "It's optional if you have a strong pitch"
        ],
        correct_answer: "A",
        explanation: "Active listening is crucial throughout the sales process to understand customer needs and tailor solutions accordingly.",
        difficulty: difficulty === 'easy' ? 'easy' : 'medium',
        points: 1,
        tags: ["active-listening", "communication", "needs-analysis"]
      },
      {
        question_text: "When qualifying a lead, which question is MOST important to ask?",
        question_type: "multiple_choice",
        options: [
          "What problem are you trying to solve?",
          "What's your budget?",
          "When can we close the deal?",
          "Have you heard of our company before?"
        ],
        correct_answer: "A",
        explanation: "Understanding the prospect's problem is the foundation of effective qualification and solution positioning.",
        difficulty: difficulty === 'hard' ? 'hard' : 'medium',
        points: 2,
        tags: ["qualification", "discovery", "needs-analysis"]
      },
      {
        question_text: "What is a key indicator of a well-structured sales presentation?",
        question_type: "multiple_choice",
        options: [
          "It addresses specific customer pain points and demonstrates value",
          "It covers every product feature in detail",
          "It uses complex industry jargon throughout",
          "It focuses primarily on company history"
        ],
        correct_answer: "A",
        explanation: "Effective presentations are customer-centric, focusing on their specific needs and the value your solution provides.",
        difficulty: difficulty,
        points: 1,
        tags: ["presentations", "value-proposition", "customer-centric"]
      },
      {
        question_text: "How should you prepare for a discovery call?",
        question_type: "multiple_choice",
        options: [
          "Research the prospect, prepare relevant questions, and set clear objectives",
          "Wing it based on your experience",
          "Prepare a standard pitch deck",
          "Focus only on your products and pricing"
        ],
        correct_answer: "A",
        explanation: "Thorough preparation, including research and thoughtful questions, demonstrates professionalism and increases success rates.",
        difficulty: difficulty,
        points: 1,
        tags: ["preparation", "discovery", "research"]
      },
      {
        question_text: "What is the primary purpose of asking open-ended questions during a sales conversation?",
        question_type: "multiple_choice",
        options: [
          "To encourage prospects to share detailed information about their needs",
          "To confuse the prospect",
          "To fill time during awkward silences",
          "To show off your knowledge"
        ],
        correct_answer: "A",
        explanation: "Open-ended questions facilitate dialogue and help you gather valuable information about the prospect's situation and needs.",
        difficulty: difficulty === 'easy' ? 'easy' : 'medium',
        points: 1,
        tags: ["questioning-techniques", "discovery", "communication"]
      },
      {
        question_text: "According to best practices, when is the ideal time to discuss pricing?",
        question_type: "multiple_choice",
        options: [
          "After establishing value and understanding the prospect's needs",
          "In the first 30 seconds of the call",
          "Only after the prospect asks three times",
          "Never discuss pricing until the contract stage"
        ],
        correct_answer: "A",
        explanation: "Pricing discussions are most effective after the prospect understands the value proposition and how it addresses their needs.",
        difficulty: difficulty === 'hard' ? 'hard' : 'medium',
        points: 2,
        tags: ["pricing", "value-first", "timing"]
      }
    ];

    // Return the first questionCount questions
    const generatedQuestions = mockQuestions.slice(0, questionCount);

    return new Response(
      JSON.stringify({
        success: true,
        questions: generatedQuestions,
        metadata: {
          documentId,
          questionCount: generatedQuestions.length,
          difficulty,
          generatedAt: new Date().toISOString()
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error generating quiz:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate quiz questions. Please try again.",
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
