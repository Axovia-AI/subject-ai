import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';
import { buildPrompt, parseOptimizedSubjects } from './logic.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client for the edge function
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Optimize subject function called');
    
    const { originalSubject, emailContext, tone = 'professional' } = await req.json();
    
    if (!originalSubject) {
      throw new Error('Original subject is required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Generating optimized subject lines for:', originalSubject);

    // Build LLM prompt via pure logic util
    const prompt = buildPrompt(originalSubject, emailContext, tone);

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert email marketing specialist focused on optimizing subject lines for maximum open rates. Always respond with valid JSON arrays only.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const optimizedSubjects = parseOptimizedSubjects(data.choices[0].message.content);

    console.log('Generated optimized subjects:', optimizedSubjects);

    // Get the authenticated user from the request
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (user && !error) {
        // Update usage stats for the user
        const today = new Date().toISOString().split('T')[0];
        const { error: statsError } = await supabase
          .from('usage_stats')
          .upsert({
            user_id: user.id,
            date: today,
            optimized_count: 1,
          }, {
            onConflict: 'user_id,date',
            ignoreDuplicates: false,
          });

        if (statsError) {
          console.error('Error updating usage stats:', statsError);
        } else {
          console.log('Usage stats updated for user:', user.id);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        optimizedSubjects,
        originalSubject,
        success: true 
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in optimize-subject function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});