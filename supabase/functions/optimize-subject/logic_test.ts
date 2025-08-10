import { assert, assertEquals, assertThrows } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { buildPrompt, parseOptimizedSubjects } from "./logic.ts";

Deno.test("buildPrompt throws when originalSubject is missing", () => {
  assertThrows(() => buildPrompt("") , Error, "Original subject is required");
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
