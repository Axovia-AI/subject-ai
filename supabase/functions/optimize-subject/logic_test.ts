import { assert, assertEquals, assertThrows } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { buildPrompt, parseOptimizedSubjects, parseRequestBody } from "./logic.ts";

Deno.test("buildPrompt throws when originalSubject is missing", () => {
  assertThrows(() => buildPrompt("") , Error, "Original subject is required");
});

Deno.test("buildPrompt throws when originalSubject is whitespace-only", () => {
  assertThrows(() => buildPrompt("   "), Error, "Original subject is required");
  assertThrows(() => buildPrompt("\t\n"), Error, "Original subject is required");
});

Deno.test("buildPrompt includes original subject, context, and tone", () => {
  const p = buildPrompt("Hello", "Context here", "friendly");
  assert(p.includes('Original subject: "Hello"'));
  assert(p.includes("Email context: Context here"));
  assert(p.includes("Desired tone: friendly"));
});

Deno.test("parseOptimizedSubjects parses valid JSON array of strings", () => {
  const content = '["A", "B", "C"]';
  const arr = parseOptimizedSubjects(content);
  assertEquals(arr.length, 3);
  assertEquals(arr[0], "A");
});

Deno.test("parseOptimizedSubjects rejects non-JSON", () => {
  assertThrows(() => parseOptimizedSubjects("not json"), Error, "not valid JSON");
});

Deno.test("parseOptimizedSubjects rejects non-array JSON", () => {
  assertThrows(() => parseOptimizedSubjects('{"a":1}'), Error, "must be a JSON array");
});

Deno.test("parseOptimizedSubjects rejects arrays with empty strings", () => {
  assertThrows(() => parseOptimizedSubjects('["ok", " "]'), Error, "Every subject line must be a non-empty string");
});


Deno.test("buildPrompt defaults tone to professional and adds placeholder when no context", () => {
  const p = buildPrompt("Hello");
  assert(p.includes('Desired tone: professional'));
  assert(p.includes('Email context: No additional context provided'));
});

Deno.test("parseOptimizedSubjects rejects empty array", () => {
  assertThrows(() => parseOptimizedSubjects('[]'), Error, "must contain at least 1 subject line");
});

Deno.test("parseOptimizedSubjects rejects arrays with non-string items", () => {
  assertThrows(() => parseOptimizedSubjects('["ok", 2]'), Error, "Every subject line must be a non-empty string");
});

Deno.test("parseRequestBody returns default values for malformed JSON", () => {
  const result = parseRequestBody("not valid json");
  assertEquals(result.originalSubject, "");
  assertEquals(result.emailContext, undefined);
  assertEquals(result.tone, "professional");
});

Deno.test("parseRequestBody extracts values from valid JSON", () => {
  const result = parseRequestBody('{"originalSubject": "Hello", "emailContext": "context", "tone": "friendly"}');
  assertEquals(result.originalSubject, "Hello");
  assertEquals(result.emailContext, "context");
  assertEquals(result.tone, "friendly");
});

Deno.test("parseRequestBody uses default tone when not provided", () => {
  const result = parseRequestBody('{"originalSubject": "Test"}');
  assertEquals(result.originalSubject, "Test");
  assertEquals(result.tone, "professional");
});
