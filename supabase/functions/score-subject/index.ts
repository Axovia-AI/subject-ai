import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";
import {
  validateScoreRequest,
  scoreLengthAndMobile,
  scoreSpamAndDeliverability,
  scoreClarityAndSpecificity,
  scoreProfessionalPolish,
  buildEngagementPrompt,
  parseEngagementResponse,
  calculateFinalScore,
  type ScoreResult,
  type ScoreBreakdown,
} from "./logic.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate and parse request
    const scoreRequest = validateScoreRequest(requestBody);

    // Initialize Supabase client for auth verification
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Score different aspects of the subject line
    const lengthScore = scoreLengthAndMobile(scoreRequest.subject);
    const spamScore = scoreSpamAndDeliverability(scoreRequest.subject);
    const clarityScore = scoreClarityAndSpecificity(scoreRequest.subject, scoreRequest.context);
    const polishScore = scoreProfessionalPolish(scoreRequest.subject);

    // Get engagement score from OpenAI
    let engagementScore = { score: 15, feedback: "Engagement analysis unavailable" };
    
    try {
      const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
      if (openaiApiKey) {
        const prompt = buildEngagementPrompt(scoreRequest.subject, scoreRequest.context, scoreRequest.tone);
        
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: 'You are an expert email marketing analyst.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: 150,
            temperature: 0.1,
          }),
        });

        if (!openaiResponse.ok) {
          console.error('OpenAI API error:', await openaiResponse.text());
        } else {
          const openaiData: OpenAIResponse = await openaiResponse.json();
          const content = openaiData.choices[0]?.message?.content;
          
          if (content) {
            try {
              engagementScore = parseEngagementResponse(content);
            } catch (e) {
              console.error('Error parsing OpenAI response:', e.message);
              // Keep default score
            }
          }
        }
      }
    } catch (e) {
      console.error('Error calling OpenAI:', e.message);
      // Keep default engagement score
    }

    // Build score breakdown
    const breakdown: ScoreBreakdown = {
      length: {
        score: lengthScore.score,
        max: 20,
        feedback: lengthScore.feedback,
      },
      engagement: {
        score: engagementScore.score,
        max: 25,
        feedback: engagementScore.feedback,
      },
      clarity: {
        score: clarityScore.score,
        max: 20,
        feedback: clarityScore.feedback,
      },
      spam: {
        score: spamScore.score,
        max: 20,
        feedback: spamScore.feedback,
      },
      polish: {
        score: polishScore.score,
        max: 15,
        feedback: polishScore.feedback,
      },
    };

    // Calculate final score and rationale
    const finalResult = calculateFinalScore(breakdown);

    // Build complete result
    const result: ScoreResult = {
      score: finalResult.score,
      rationale: finalResult.rationale,
      breakdown: breakdown,
      suggestions: finalResult.suggestions,
    };

    // Optional: Track usage in database
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Update or insert usage stats
      const { error: upsertError } = await supabase
        .from('usage_stats')
        .upsert({
          user_id: user.id,
          date: today,
          scored_count: 1,
        }, {
          onConflict: 'user_id,date',
          ignoreDuplicates: false,
        });

      if (upsertError) {
        console.error('Error updating usage stats:', upsertError);
        // Don't fail the request if usage tracking fails
      }
    } catch (e) {
      console.error('Error tracking usage:', e.message);
      // Don't fail the request if usage tracking fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        result: result,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in score-subject function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'An unexpected error occurred' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});