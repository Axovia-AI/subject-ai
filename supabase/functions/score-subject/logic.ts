/**
 * Pure logic utilities for the score-subject Edge Function.
 * Implements subject line scoring based on multiple criteria.
 */

export interface ScoreRequest {
  subject: string;
  context?: string;
  tone?: string;
}

export interface ScoreResult {
  score: number;
  rationale: string;
  breakdown: ScoreBreakdown;
  suggestions: string[];
}

export interface ScoreBreakdown {
  length: { score: number; max: 20; feedback: string };
  engagement: { score: number; max: 25; feedback: string };
  clarity: { score: number; max: 20; feedback: string };
  spam: { score: number; max: 20; feedback: string };
  polish: { score: number; max: 15; feedback: string };
}

/** Validate scoring request input */
export function validateScoreRequest(input: unknown): ScoreRequest {
  if (!input || typeof input !== 'object') {
    throw new Error('Request body must be an object');
  }

  const req = input as Record<string, unknown>;
  
  if (!req.subject || typeof req.subject !== 'string') {
    throw new Error('Subject line is required and must be a string');
  }

  const subject = req.subject.trim();
  if (!subject) {
    throw new Error('Subject line cannot be empty');
  }

  if (subject.length > 200) {
    throw new Error('Subject line cannot exceed 200 characters');
  }

  return {
    subject,
    context: typeof req.context === 'string' ? req.context.trim() : undefined,
    tone: typeof req.tone === 'string' ? req.tone.toLowerCase() : 'professional',
  };
}

/** Score subject line length and mobile optimization */
export function scoreLengthAndMobile(subject: string): { score: number; feedback: string } {
  const length = subject.length;
  
  if (length >= 50 && length <= 60) {
    return { score: 20, feedback: "Perfect length for mobile visibility" };
  } else if (length >= 30 && length <= 49) {
    return { score: 15, feedback: "Good length, but could be slightly longer for impact" };
  } else if (length >= 61 && length <= 70) {
    return { score: 12, feedback: "Acceptable length, may be truncated on some mobile devices" };
  } else if (length >= 71 && length <= 80) {
    return { score: 8, feedback: "Too long - likely to be cut off on mobile devices" };
  } else if (length > 80) {
    return { score: 0, feedback: "Much too long - will be severely truncated on mobile" };
  } else {
    return { score: 5, feedback: "Too short - add more descriptive content" };
  }
}

/** Detect spam indicators and calculate spam score */
export function scoreSpamAndDeliverability(subject: string): { score: number; feedback: string } {
  const upperSubject = subject.toUpperCase();
  let spamFlags = 0;
  const detectedFlags: string[] = [];

  // Major spam indicators (2 points each)
  const majorSpamWords = ['FREE', 'URGENT', 'LIMITED TIME', 'ACT NOW', 'GUARANTEE', 'WINNER', 'CASH', 'MONEY'];
  for (const word of majorSpamWords) {
    if (upperSubject.includes(word)) {
      spamFlags += 2;
      detectedFlags.push(word.toLowerCase());
    }
  }

  // All caps check (major)
  if (subject === subject.toUpperCase() && subject.length > 5) {
    spamFlags += 2;
    detectedFlags.push('all caps');
  }

  // Excessive punctuation (major)
  if (/[!]{3,}|[?]{3,}|[.]{3,}/.test(subject)) {
    spamFlags += 2;
    detectedFlags.push('excessive punctuation');
  }

  // Dollar signs and symbols (minor)
  if (/\$|\€|\£|💰|💵/.test(subject)) {
    spamFlags += 1;
    detectedFlags.push('money symbols');
  }

  // Multiple caps words (minor)
  const capsWords = subject.match(/\b[A-Z]{2,}\b/g);
  if (capsWords && capsWords.length >= 3) {
    spamFlags += 1;
    detectedFlags.push('multiple caps words');
  }

  // Excessive emojis (minor)
  const emojiCount = (subject.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || []).length;
  if (emojiCount > 3) {
    spamFlags += 1;
    detectedFlags.push('excessive emojis');
  }

  let score: number;
  let feedback: string;

  if (spamFlags === 0) {
    score = 20;
    feedback = "No spam indicators detected - excellent deliverability";
  } else if (spamFlags <= 2) {
    score = 15;
    feedback = `Minor spam indicators detected: ${detectedFlags.join(', ')}`;
  } else if (spamFlags <= 4) {
    score = 10;
    feedback = `Moderate spam risk detected: ${detectedFlags.join(', ')}`;
  } else if (spamFlags <= 6) {
    score = 5;
    feedback = `High spam risk - multiple flags: ${detectedFlags.join(', ')}`;
  } else {
    score = 0;
    feedback = `Very high spam risk - many flags: ${detectedFlags.join(', ')}`;
  }

  return { score, feedback };
}

/** Score clarity and specificity using heuristics */
export function scoreClarityAndSpecificity(subject: string, context?: string): { score: number; feedback: string } {
  const words = subject.toLowerCase().split(/\s+/);
  const hasNumbers = /\d/.test(subject);
  const hasQuestion = subject.includes('?');
  const hasColon = subject.includes(':');
  
  // Vague words that reduce clarity
  const vageWords = ['this', 'that', 'something', 'anything', 'check', 'look', 'see', 'update', 'info', 'stuff'];
  const vageCount = words.filter(word => vageWords.includes(word)).length;
  
  // Specific words that increase clarity
  const specificWords = ['report', 'meeting', 'results', 'proposal', 'invoice', 'deadline', 'schedule', 'announcement'];
  const specificCount = words.filter(word => specificWords.some(sw => word.includes(sw))).length;
  
  let score = 10; // Base score
  let feedback = [];

  // Add points for clarity indicators
  if (hasNumbers) {
    score += 3;
    feedback.push("includes specific numbers");
  }
  
  if (hasColon) {
    score += 2;
    feedback.push("uses descriptive structure");
  }
  
  if (specificCount > 0) {
    score += specificCount * 2;
    feedback.push("contains specific terms");
  }

  // Subtract points for vague language
  if (vageCount > 0) {
    score -= vageCount * 2;
    feedback.push("contains vague language");
  }

  // Very short subjects are often unclear
  if (words.length <= 2 && !hasQuestion) {
    score -= 3;
    feedback.push("too brief to be clear");
  }

  // Cap the score
  score = Math.min(20, Math.max(0, score));

  let finalFeedback: string;
  if (score >= 16) {
    finalFeedback = `Very clear and specific. ${feedback.join(', ') || 'Well structured'}`;
  } else if (score >= 12) {
    finalFeedback = `Generally clear with minor issues. ${feedback.join(', ')}`;
  } else if (score >= 8) {
    finalFeedback = `Somewhat clear but could be more specific. ${feedback.join(', ')}`;
  } else if (score >= 4) {
    finalFeedback = `Unclear - needs more specific information. ${feedback.join(', ')}`;
  } else {
    finalFeedback = `Very unclear - lacks specific information. ${feedback.join(', ')}`;
  }

  return { score, feedback: finalFeedback };
}

/** Score professional polish using basic heuristics */
export function scoreProfessionalPolish(subject: string): { score: number; feedback: string } {
  let score = 15; // Start with perfect score
  const issues: string[] = [];

  // Check capitalization
  const hasProperCapitalization = /^[A-Z]/.test(subject) && !/^[A-Z\s]+$/.test(subject);
  if (!hasProperCapitalization) {
    score -= 3;
    issues.push("capitalization issues");
  }

  // Check for typos (very basic - repeated letters)
  if (/(.)\1{2,}/.test(subject.replace(/[!?.]/g, ''))) {
    score -= 2;
    issues.push("possible typos");
  }

  // Check for unprofessional elements
  if (/\bhey\b|\byo\b|\bhiya\b/i.test(subject)) {
    score -= 3;
    issues.push("overly casual language");
  }

  // Check for grammar issues (basic)
  if (/\bi\b(?!\s)/i.test(subject)) { // 'i' not followed by space
    score -= 2;
    issues.push("grammar issues");
  }

  // Missing punctuation at end for statements
  if (subject.length > 30 && !/[.!?:]$/.test(subject) && !subject.includes('?')) {
    score -= 1;
    issues.push("missing ending punctuation");
  }

  score = Math.max(0, score);

  let feedback: string;
  if (score >= 13) {
    feedback = "Professional and polished presentation";
  } else if (score >= 10) {
    feedback = `Generally professional with minor issues: ${issues.join(', ')}`;
  } else if (score >= 7) {
    feedback = `Some professional concerns: ${issues.join(', ')}`;
  } else if (score >= 4) {
    feedback = `Multiple professional issues: ${issues.join(', ')}`;
  } else {
    feedback = `Unprofessional presentation: ${issues.join(', ')}`;
  }

  return { score, feedback };
}

/** Build the system prompt for LLM engagement scoring */
export function buildEngagementPrompt(subject: string, context?: string, tone: string = 'professional'): string {
  return `You are an expert email marketing analyst. Rate the engagement potential of this email subject line on a scale of 0-25.

Subject Line: "${subject}"
Context: ${context || 'No additional context provided'}
Intended Tone: ${tone}

Evaluate based on:
1. Curiosity and intrigue factor
2. Emotional appeal and urgency (when appropriate)
3. Value proposition clarity  
4. Personalization potential
5. Action-oriented language

Return ONLY a JSON object with this format:
{
  "score": <number 0-25>,
  "feedback": "<brief explanation of the score and key engagement factors>"
}

Consider these guidelines:
- High engagement (20-25): Compelling, creates curiosity, clear value
- Medium engagement (15-19): Somewhat interesting, moderate appeal
- Low engagement (10-14): Generic, limited appeal
- Very low engagement (0-9): Boring, no hook, purely informational

Be critical but fair in your assessment.`;
}

/** Parse LLM engagement response */
export function parseEngagementResponse(content: string): { score: number; feedback: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    throw new Error('LLM response is not valid JSON');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('LLM response must be a JSON object');
  }

  const response = parsed as Record<string, unknown>;
  
  if (typeof response.score !== 'number' || response.score < 0 || response.score > 25) {
    throw new Error('LLM response must include a score between 0 and 25');
  }

  if (typeof response.feedback !== 'string' || !response.feedback.trim()) {
    throw new Error('LLM response must include feedback text');
  }

  return {
    score: Math.round(response.score),
    feedback: response.feedback.trim(),
  };
}

/** Calculate final score and generate comprehensive feedback */
export function calculateFinalScore(breakdown: ScoreBreakdown): { score: number; rationale: string; suggestions: string[] } {
  const totalScore = breakdown.length.score + breakdown.engagement.score + breakdown.clarity.score + breakdown.spam.score + breakdown.polish.score;
  const finalScore = Math.min(100, Math.max(0, totalScore));

  // Generate rationale
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const suggestions: string[] = [];

  // Analyze each component
  if (breakdown.length.score >= 15) {
    strengths.push("optimal length for mobile");
  } else if (breakdown.length.score <= 8) {
    weaknesses.push("poor length optimization");
    if (breakdown.length.score <= 5) {
      suggestions.push("Add more descriptive content to increase length");
    } else {
      suggestions.push("Shorten subject line for better mobile visibility");
    }
  }

  if (breakdown.engagement.score >= 20) {
    strengths.push("high engagement potential");
  } else if (breakdown.engagement.score <= 12) {
    weaknesses.push("low engagement appeal");
    suggestions.push("Add curiosity elements, numbers, or questions to increase engagement");
  }

  if (breakdown.clarity.score >= 16) {
    strengths.push("very clear message");
  } else if (breakdown.clarity.score <= 10) {
    weaknesses.push("unclear or vague content");
    suggestions.push("Be more specific about the email's purpose or value");
  }

  if (breakdown.spam.score >= 18) {
    strengths.push("excellent deliverability");
  } else if (breakdown.spam.score <= 10) {
    weaknesses.push("spam risk concerns");
    suggestions.push("Remove spam trigger words and excessive punctuation");
  }

  if (breakdown.polish.score >= 12) {
    strengths.push("professional presentation");
  } else if (breakdown.polish.score <= 8) {
    weaknesses.push("unprofessional elements");
    suggestions.push("Improve grammar, capitalization, and professional tone");
  }

  // Generate overall rationale
  let performanceLevel: string;
  if (finalScore >= 90) performanceLevel = "exceptional";
  else if (finalScore >= 80) performanceLevel = "very good";
  else if (finalScore >= 70) performanceLevel = "good";
  else if (finalScore >= 60) performanceLevel = "average";
  else if (finalScore >= 50) performanceLevel = "below average";
  else performanceLevel = "poor";

  let rationale = `This subject line scores ${finalScore}/100 (${performanceLevel}).`;
  
  if (strengths.length > 0) {
    rationale += ` Strengths include ${strengths.join(', ')}.`;
  }
  
  if (weaknesses.length > 0) {
    rationale += ` Areas for improvement: ${weaknesses.join(', ')}.`;
  }

  // Add general suggestions if no specific ones
  if (suggestions.length === 0) {
    if (finalScore < 70) {
      suggestions.push("Consider A/B testing different variations");
    }
    if (finalScore >= 80) {
      suggestions.push("This subject line is performing well - test it against alternatives");
    }
  }

  return { score: finalScore, rationale, suggestions };
}