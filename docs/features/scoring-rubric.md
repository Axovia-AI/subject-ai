# Subject Line Scoring Rubric

## Overview
This document defines the scoring criteria and methodology for the SubjectAI scoring feature. The scoring system combines AI analysis with heuristic rules to provide a comprehensive 0-100 score and rationale.

## Scoring Criteria

### 1. Length & Mobile Optimization (20 points)
- **Optimal (50-60 chars)**: 20 points
- **Good (30-49 chars)**: 15 points  
- **Acceptable (61-70 chars)**: 12 points
- **Long (71-80 chars)**: 8 points
- **Too Long (>80 chars)**: 0 points
- **Too Short (<10 chars)**: 5 points

**Rationale**: Mobile email clients show ~50 characters. Optimal length ensures full visibility on mobile devices.

### 2. Engagement & Curiosity (25 points)
Analyzed via LLM assessment:
- **High engagement**: 25 points (compelling, curiosity-inducing)
- **Medium engagement**: 18 points (somewhat interesting)
- **Low engagement**: 10 points (bland, generic)
- **No engagement**: 0 points (boring, promotional)

**Indicators**: Questions, numbers, personalization, urgency (when appropriate), action words

### 3. Clarity & Specificity (20 points)
- **Very clear**: 20 points (immediately understandable purpose)
- **Clear**: 15 points (mostly clear with minor ambiguity)
- **Somewhat clear**: 10 points (requires context to understand)
- **Unclear**: 5 points (vague or confusing)
- **Very unclear**: 0 points (meaningless or misleading)

### 4. Spam & Deliverability (20 points)
Heuristic detection of spam indicators:
- **No spam indicators**: 20 points
- **Minor indicators**: 15 points (1-2 minor flags)
- **Moderate indicators**: 10 points (3-4 flags or 1 major)
- **High spam risk**: 5 points (5+ flags or 2+ major)
- **Very high spam risk**: 0 points (excessive flags)

**Spam Indicators**:
- Major: ALL CAPS, excessive punctuation (!!!), "FREE", "URGENT", "$$$"
- Minor: Multiple caps words, "limited time", "act now", excessive emojis

### 5. Professional Polish (15 points)
- **Excellent**: 15 points (proper grammar, tone consistency)
- **Good**: 12 points (minor issues)
- **Fair**: 8 points (some problems)
- **Poor**: 4 points (multiple issues)
- **Very poor**: 0 points (unprofessional)

## Score Calculation

```typescript
totalScore = lengthScore + engagementScore + clarityScore + spamScore + polishScore
finalScore = Math.min(100, Math.max(0, totalScore))
```

## LLM Integration

The AI component analyzes:
1. **Engagement potential** based on psychological triggers
2. **Clarity** of message intent
3. **Tone appropriateness** for given context
4. **Industry best practices** alignment

## Expected Score Ranges

- **90-100**: Exceptional - High open rate potential
- **80-89**: Very Good - Above average performance expected  
- **70-79**: Good - Solid performance
- **60-69**: Average - Room for improvement
- **50-59**: Below Average - Needs optimization
- **0-49**: Poor - Requires significant changes

## Rationale Generation

Each score includes specific feedback:
- Primary strengths and weaknesses
- Specific improvement suggestions
- Industry best practice recommendations
- Mobile optimization notes

## Example Scoring

| Subject Line | Score | Primary Issues |
|--------------|-------|----------------|
| "Check this out!" | 35 | Too vague, lacks specificity, no clear value |
| "Your Q3 Sales Report is Ready - 3 Key Insights Inside" | 88 | Great length, specific, numbers, clear value |
| "URGENT: CLAIM YOUR FREE GIFT NOW!!!" | 12 | Spam flags, all caps, excessive punctuation |
| "Meeting tomorrow?" | 72 | Good length, question format, but lacks context |