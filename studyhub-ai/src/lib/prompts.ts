import { DomainStats } from "./placement-lookup";

export function buildFlashcardsPrompt(summary: string): string {
  return `
Based on the following summary of study notes, generate exactly 5 high-quality flashcards for revision.
Return ONLY a valid JSON array of objects, each with 'question' and 'answer' fields.

Summary:
${summary}

JSON format:
[
  {"question": "...", "answer": "..."},
  ...
]
  `.trim();
}

export function buildPlacementPrompt(topic: string, stats: DomainStats): string {
  return `
Topic: ${topic}
Domain: ${stats.domain}

Campus recruitment data (Kaggle) for this domain:
- Avg Placement Rate: ${stats.rate}%
- Avg UG Degree % of placed students: ${stats.avgDegreeP}%
- Higher placement odds with work experience: ${stats.workexWithRate}%
- Typical starting package: ${stats.avgSalary} INR

In exactly 5 concise lines, provide placement advice:
1. Tech significance of ${topic} for placements.
2. Recommended academic profile/scores for ${stats.domain}.
3. Key technical concepts in ${topic} for interviews.
4. Professional boost: How work experience or internships help.
5. Action plan: What to focus on technically.

Be direct and use the data provided above.
  `.trim();
}
