/**
 * Pure logic utilities for the optimize-subject Edge Function.
 * Keeps HTTP/Supabase/OpenAI I/O out of core logic for easier testing.
 */

/** Build the system/user prompt for the LLM. */
export function buildPrompt(originalSubject: string, emailContext?: string, tone: string = 'professional'): string {
  if (!originalSubject || typeof originalSubject !== 'string') {
    throw new Error('Original subject is required')
  }

  return `You are an expert email subject line optimizer. Your goal is to create compelling, engaging subject lines that increase open rates.

Original subject: "${originalSubject}"
Email context: ${emailContext || 'No additional context provided'}
Desired tone: ${tone}

Generate 3 alternative subject lines that are:
1. Clear and specific
2. Action-oriented when appropriate
3. Concise (under 50 characters when possible)
4. Engaging and likely to increase open rates
5. Matching the ${tone} tone

Consider these best practices:
- Use numbers when relevant
- Create urgency when appropriate
- Ask questions to spark curiosity
- Personalize when possible
- Avoid spam trigger words

Return ONLY a JSON array of 3 strings, no additional text or formatting.
Example: ["Subject 1", "Subject 2", "Subject 3"]`
}

/** Parse and validate the model output content as an array of 3 strings. */
export function parseOptimizedSubjects(content: string): string[] {
  let arr: unknown
  try {
    arr = JSON.parse(content)
  } catch (e) {
    throw new Error('Model response is not valid JSON')
  }

  if (!Array.isArray(arr)) {
    throw new Error('Model response must be a JSON array')
  }
  const strArr = arr as unknown[]
  if (strArr.length < 1) {
    throw new Error('Model response must contain at least 1 subject line')
  }
  for (const s of strArr) {
    if (typeof s !== 'string' || !s.trim()) {
      throw new Error('Every subject line must be a non-empty string')
    }
  }
  return strArr as string[]
}
