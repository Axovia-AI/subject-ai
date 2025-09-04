import { assert, assertEquals, assertThrows } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  validateScoreRequest,
  scoreLengthAndMobile,
  scoreSpamAndDeliverability,
  scoreClarityAndSpecificity,
  scoreProfessionalPolish,
  buildEngagementPrompt,
  parseEngagementResponse,
  calculateFinalScore,
  type ScoreBreakdown,
} from "./logic.ts";

// Test validateScoreRequest
Deno.test("validateScoreRequest validates valid input", () => {
  const input = { subject: "Test Subject", context: "Test context", tone: "professional" };
  const result = validateScoreRequest(input);
  
  assertEquals(result.subject, "Test Subject");
  assertEquals(result.context, "Test context");
  assertEquals(result.tone, "professional");
});

Deno.test("validateScoreRequest throws for missing subject", () => {
  assertThrows(() => validateScoreRequest({}), Error, "Subject line is required");
});

Deno.test("validateScoreRequest throws for empty subject", () => {
  assertThrows(() => validateScoreRequest({ subject: "   " }), Error, "Subject line cannot be empty");
});

Deno.test("validateScoreRequest throws for too long subject", () => {
  const longSubject = "a".repeat(201);
  assertThrows(() => validateScoreRequest({ subject: longSubject }), Error, "cannot exceed 200 characters");
});

Deno.test("validateScoreRequest trims whitespace", () => {
  const result = validateScoreRequest({ subject: "  Test Subject  " });
  assertEquals(result.subject, "Test Subject");
});

Deno.test("validateScoreRequest defaults tone to professional", () => {
  const result = validateScoreRequest({ subject: "Test" });
  assertEquals(result.tone, "professional");
});

// Test scoreLengthAndMobile
Deno.test("scoreLengthAndMobile gives perfect score for optimal length", () => {
  const result = scoreLengthAndMobile("This is a perfect length subject line test here");
  assertEquals(result.score, 20);
  assert(result.feedback.includes("Perfect length"));
});

Deno.test("scoreLengthAndMobile penalizes too short subjects", () => {
  const result = scoreLengthAndMobile("Hi");
  assertEquals(result.score, 5);
  assert(result.feedback.includes("Too short"));
});

Deno.test("scoreLengthAndMobile penalizes too long subjects", () => {
  const longSubject = "This is a really really really really really really really really really long subject line";
  const result = scoreLengthAndMobile(longSubject);
  assertEquals(result.score, 0);
  assert(result.feedback.includes("Much too long"));
});

Deno.test("scoreLengthAndMobile handles medium length appropriately", () => {
  const result = scoreLengthAndMobile("This is a good length subject line");
  assertEquals(result.score, 15);
  assert(result.feedback.includes("Good length"));
});

// Test scoreSpamAndDeliverability
Deno.test("scoreSpamAndDeliverability gives perfect score for clean subject", () => {
  const result = scoreSpamAndDeliverability("Your monthly report is ready");
  assertEquals(result.score, 20);
  assert(result.feedback.includes("No spam indicators"));
});

Deno.test("scoreSpamAndDeliverability detects major spam words", () => {
  const result = scoreSpamAndDeliverability("Get your FREE gift now");
  assert(result.score < 20);
  assert(result.feedback.toLowerCase().includes("free"));
});

Deno.test("scoreSpamAndDeliverability detects all caps", () => {
  const result = scoreSpamAndDeliverability("URGENT MEETING TODAY");
  assert(result.score < 15);
  assert(result.feedback.includes("all caps"));
});

Deno.test("scoreSpamAndDeliverability detects excessive punctuation", () => {
  const result = scoreSpamAndDeliverability("Important meeting tomorrow!!!");
  assert(result.score < 20);
  assert(result.feedback.includes("excessive punctuation"));
});

Deno.test("scoreSpamAndDeliverability handles multiple spam indicators", () => {
  const result = scoreSpamAndDeliverability("FREE URGENT CASH NOW!!!");
  assertEquals(result.score, 0);
});

Deno.test("scoreSpamAndDeliverability tolerates normal capitalization", () => {
  const result = scoreSpamAndDeliverability("Meeting with CEO Tomorrow");
  assertEquals(result.score, 20);
});

// Test scoreClarityAndSpecificity  
Deno.test("scoreClarityAndSpecificity rewards specific content", () => {
  const result = scoreClarityAndSpecificity("Q3 Sales Report: 15% Growth Analysis");
  assert(result.score >= 15);
  assert(result.feedback.includes("specific"));
});

Deno.test("scoreClarityAndSpecificity penalizes vague content", () => {
  const result = scoreClarityAndSpecificity("Check this out");
  assert(result.score <= 10);
  assert(result.feedback.includes("vague"));
});

Deno.test("scoreClarityAndSpecificity rewards numbers", () => {
  const result = scoreClarityAndSpecificity("5 ways to improve productivity");
  assert(result.score >= 13);
});

Deno.test("scoreClarityAndSpecificity rewards structure with colons", () => {
  const result = scoreClarityAndSpecificity("Project Update: Phase 2 Complete");
  assert(result.score >= 13);
});

Deno.test("scoreClarityAndSpecificity handles very short subjects", () => {
  const result = scoreClarityAndSpecificity("Hi");
  assert(result.score <= 10);
  assert(result.feedback.includes("brief"));
});

// Test scoreProfessionalPolish
Deno.test("scoreProfessionalPolish gives perfect score for professional subject", () => {
  const result = scoreProfessionalPolish("Quarterly Business Review Meeting");
  assertEquals(result.score, 15);
  assert(result.feedback.includes("Professional"));
});

Deno.test("scoreProfessionalPolish penalizes poor capitalization", () => {
  const result = scoreProfessionalPolish("meeting tomorrow");
  assert(result.score < 15);
  assert(result.feedback.includes("capitalization"));
});

Deno.test("scoreProfessionalPolish penalizes casual language", () => {
  const result = scoreProfessionalPolish("Hey, check this out yo");
  assert(result.score < 12);
  assert(result.feedback.includes("casual"));
});

Deno.test("scoreProfessionalPolish handles all caps as unprofessional", () => {
  const result = scoreProfessionalPolish("IMPORTANT MEETING");
  assert(result.score < 15);
});

// Test buildEngagementPrompt
Deno.test("buildEngagementPrompt includes all required elements", () => {
  const prompt = buildEngagementPrompt("Test Subject", "Test context", "professional");
  
  assert(prompt.includes("Test Subject"));
  assert(prompt.includes("Test context"));
  assert(prompt.includes("professional"));
  assert(prompt.includes("engagement potential"));
  assert(prompt.includes("0-25"));
});

Deno.test("buildEngagementPrompt handles missing context", () => {
  const prompt = buildEngagementPrompt("Test Subject");
  
  assert(prompt.includes("Test Subject"));
  assert(prompt.includes("No additional context"));
  assert(prompt.includes("professional"));
});

// Test parseEngagementResponse
Deno.test("parseEngagementResponse parses valid JSON response", () => {
  const response = '{"score": 18, "feedback": "Good engagement with clear value proposition"}';
  const result = parseEngagementResponse(response);
  
  assertEquals(result.score, 18);
  assertEquals(result.feedback, "Good engagement with clear value proposition");
});

Deno.test("parseEngagementResponse throws for invalid JSON", () => {
  assertThrows(() => parseEngagementResponse("not json"), Error, "not valid JSON");
});

Deno.test("parseEngagementResponse throws for missing score", () => {
  const response = '{"feedback": "test"}';
  assertThrows(() => parseEngagementResponse(response), Error, "must include a score");
});

Deno.test("parseEngagementResponse throws for invalid score range", () => {
  const response = '{"score": 30, "feedback": "test"}';
  assertThrows(() => parseEngagementResponse(response), Error, "score between 0 and 25");
});

Deno.test("parseEngagementResponse throws for missing feedback", () => {
  const response = '{"score": 15}';
  assertThrows(() => parseEngagementResponse(response), Error, "must include feedback text");
});

Deno.test("parseEngagementResponse rounds decimal scores", () => {
  const response = '{"score": 18.7, "feedback": "test"}';
  const result = parseEngagementResponse(response);
  assertEquals(result.score, 19);
});

// Test calculateFinalScore
Deno.test("calculateFinalScore calculates correct total", () => {
  const breakdown: ScoreBreakdown = {
    length: { score: 20, max: 20, feedback: "perfect" },
    engagement: { score: 25, max: 25, feedback: "excellent" },
    clarity: { score: 20, max: 20, feedback: "very clear" },
    spam: { score: 20, max: 20, feedback: "no issues" },
    polish: { score: 15, max: 15, feedback: "professional" },
  };
  
  const result = calculateFinalScore(breakdown);
  assertEquals(result.score, 100);
  assert(result.rationale.includes("exceptional"));
  assert(result.rationale.includes("100/100"));
});

Deno.test("calculateFinalScore identifies strengths", () => {
  const breakdown: ScoreBreakdown = {
    length: { score: 18, max: 20, feedback: "good" },
    engagement: { score: 22, max: 25, feedback: "high engagement" },
    clarity: { score: 18, max: 20, feedback: "clear" },
    spam: { score: 20, max: 20, feedback: "clean" },
    polish: { score: 14, max: 15, feedback: "professional" },
  };
  
  const result = calculateFinalScore(breakdown);
  assert(result.rationale.includes("Strengths"));
  assert(result.rationale.includes("optimal length"));
  assert(result.rationale.includes("high engagement"));
  assert(result.rationale.includes("excellent deliverability"));
});

Deno.test("calculateFinalScore identifies weaknesses and suggestions", () => {
  const breakdown: ScoreBreakdown = {
    length: { score: 5, max: 20, feedback: "too short" },
    engagement: { score: 8, max: 25, feedback: "low engagement" },
    clarity: { score: 6, max: 20, feedback: "unclear" },
    spam: { score: 8, max: 20, feedback: "spam risk" },
    polish: { score: 6, max: 15, feedback: "unprofessional" },
  };
  
  const result = calculateFinalScore(breakdown);
  assert(result.score <= 50);
  assert(result.rationale.includes("Areas for improvement"));
  assert(result.suggestions.length > 0);
  assert(result.suggestions.some(s => s.includes("descriptive content")));
});

Deno.test("calculateFinalScore caps score at 100", () => {
  const breakdown: ScoreBreakdown = {
    length: { score: 25, max: 20, feedback: "perfect" },
    engagement: { score: 30, max: 25, feedback: "excellent" },
    clarity: { score: 25, max: 20, feedback: "very clear" },
    spam: { score: 25, max: 20, feedback: "no issues" },
    polish: { score: 20, max: 15, feedback: "professional" },
  };
  
  const result = calculateFinalScore(breakdown);
  assertEquals(result.score, 100);
});

Deno.test("calculateFinalScore floors score at 0", () => {
  const breakdown: ScoreBreakdown = {
    length: { score: -5, max: 20, feedback: "terrible" },
    engagement: { score: -10, max: 25, feedback: "awful" },
    clarity: { score: -5, max: 20, feedback: "unclear" },
    spam: { score: -10, max: 20, feedback: "spam" },
    polish: { score: -5, max: 15, feedback: "unprofessional" },
  };
  
  const result = calculateFinalScore(breakdown);
  assertEquals(result.score, 0);
});

// Edge case tests
Deno.test("scoreLengthAndMobile handles empty string", () => {
  const result = scoreLengthAndMobile("");
  assertEquals(result.score, 5);
});

Deno.test("scoreSpamAndDeliverability handles empty string", () => {
  const result = scoreSpamAndDeliverability("");
  assertEquals(result.score, 20);
});

Deno.test("scoreClarityAndSpecificity handles empty string", () => {
  const result = scoreClarityAndSpecificity("");
  assert(result.score >= 0);
});

Deno.test("scoreProfessionalPolish handles empty string", () => {
  const result = scoreProfessionalPolish("");
  assert(result.score >= 0);
});

// Integration-style tests with realistic subjects
Deno.test("scoring functions work together for good subject", () => {
  const subject = "Q3 Sales Report: Key Metrics and Growth Analysis";
  
  const length = scoreLengthAndMobile(subject);
  const spam = scoreSpamAndDeliverability(subject);
  const clarity = scoreClarityAndSpecificity(subject);
  const polish = scoreProfessionalPolish(subject);
  
  assert(length.score >= 10);
  assert(spam.score >= 18);
  assert(clarity.score >= 15);
  assert(polish.score >= 12);
});

Deno.test("scoring functions work together for poor subject", () => {
  const subject = "FREE URGENT CASH NOW!!!";
  
  const length = scoreLengthAndMobile(subject);
  const spam = scoreSpamAndDeliverability(subject);
  const clarity = scoreClarityAndSpecificity(subject);
  const polish = scoreProfessionalPolish(subject);
  
  assert(spam.score <= 5); // Should be very low due to spam
  assert(clarity.score <= 10); // Vague and spammy
});