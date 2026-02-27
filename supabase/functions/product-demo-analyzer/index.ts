import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ValidationRequest {
  sessionId: string;
  spokenText: string;
  companyId: string;
  productId?: string;
}

interface ProductUSP {
  id: string;
  usp_title: string;
  usp_description: string;
  category: string;
  keywords: string[];
}

function calculateSimilarity(text1: string, text2: string): number {
  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);

  const set1 = new Set(words1);
  const set2 = new Set(words2);

  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size;
}

function matchKeywords(spokenText: string, keywords: string[]): number {
  const spokenLower = spokenText.toLowerCase();
  let matchCount = 0;

  for (const keyword of keywords) {
    if (spokenLower.includes(keyword.toLowerCase())) {
      matchCount++;
    }
  }

  return keywords.length > 0 ? matchCount / keywords.length : 0;
}

function analyzeSpokenText(spokenText: string, usps: ProductUSP[]) {
  let bestMatch: ProductUSP | null = null;
  let bestScore = 0;
  let validationType = "unsure";

  for (const usp of usps) {
    const titleSimilarity = calculateSimilarity(spokenText, usp.usp_title);
    const descSimilarity = calculateSimilarity(spokenText, usp.usp_description);
    const keywordMatch = matchKeywords(spokenText, usp.keywords);

    const score = (titleSimilarity * 0.4) + (descSimilarity * 0.3) + (keywordMatch * 0.3);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = usp;
    }
  }

  if (bestScore > 0.6) {
    validationType = "correct";
  } else if (bestScore > 0.4) {
    validationType = "unsure";
  } else if (bestScore > 0.2) {
    validationType = "incorrect";
  } else {
    validationType = "missed_opportunity";
  }

  const needsReview = validationType === "unsure" || validationType === "incorrect";

  return {
    matchedUspId: bestMatch?.id || null,
    isCorrect: validationType === "correct",
    confidenceScore: bestScore,
    validationType,
    needsAdminReview: needsReview,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { sessionId, spokenText, companyId, productId }: ValidationRequest = await req.json();

    if (!sessionId || !spokenText || !companyId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let query = supabase
      .from("product_usps")
      .select("*")
      .eq("company_id", companyId)
      .eq("is_approved", true);

    if (productId) {
      query = query.eq("product_id", productId);
    }

    const { data: usps, error: uspsError } = await query;

    if (uspsError) {
      throw uspsError;
    }

    if (!usps || usps.length === 0) {
      return new Response(
        JSON.stringify({
          message: "No approved USPs found for this company",
          validationResult: null
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const validationResult = analyzeSpokenText(spokenText, usps);

    const { data: logData, error: logError } = await supabase
      .from("demo_validation_logs")
      .insert({
        session_id: sessionId,
        company_id: companyId,
        spoken_text: spokenText,
        matched_usp_id: validationResult.matchedUspId,
        is_correct: validationResult.isCorrect,
        confidence_score: validationResult.confidenceScore,
        validation_type: validationResult.validationType,
        needs_admin_review: validationResult.needsAdminReview,
      })
      .select()
      .single();

    if (logError) {
      throw logError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        validationResult,
        logId: logData.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error in product-demo-analyzer:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
