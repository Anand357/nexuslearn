const GEMINI_MODEL = 'gemini-2.0-flash'

export async function callGemini(prompt, apiKey) {
  if (!apiKey) throw new Error('No Gemini API key set')
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    }
  )
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

export async function rewriteNotes(rawText, apiKey) {
  const prompt = `You are a study assistant. Rewrite these student notes into clean, structured notes. Fix spelling and grammar. Add headings. Keep ONLY what the student wrote — do not add new information. If a concept has a process or flow, add [DIAGRAM: brief description]. If a concept refers to a physical object, add [MODEL: keyword]. Return plain text only.

Student notes: "${rawText}"`
  return callGemini(prompt, apiKey)
}

export async function extractConcepts(cleanedText, apiKey) {
  const prompt = `Extract all key concepts from these notes as JSON only. No explanation. No markdown code blocks.
Format: [{ "concept": string, "subject": string, "oneLinerDefinition": string, "relatedConcepts": string[], "difficulty": "basic"|"intermediate"|"advanced", "hasDiagram": boolean, "modelKeyword": string|null }]

Notes: "${cleanedText}"`
  const raw = await callGemini(prompt, apiKey)
  const clean = raw.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

export async function generateDiagram(description, apiKey) {
  const prompt = `Convert this process description into diagram JSON. Return ONLY valid JSON, no markdown.
Format: { "type": "flow"|"cycle"|"hierarchy"|"comparison", "title": string, "nodes": [{ "id": string, "label": string, "color": "purple"|"teal"|"coral"|"amber"|"blue"|"gray", "subtitle": string }], "edges": [{ "from": string, "to": string, "label": string }] }

Description: ${description}`
  const raw = await callGemini(prompt, apiKey)
  const clean = raw.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

export async function generateQuizQuestion(concept, apiKey) {
  const diffMap = { easy: 'direct recall (definition, what is X)', medium: 'application (what happens if, why does)', hard: 'analysis (compare X with Y, what is wrong with)' }
  const diff = concept.confidenceScore < 0.3 ? 'easy' : concept.confidenceScore < 0.7 ? 'medium' : 'hard'
  const prompt = `Generate exactly one quiz question for this concept. Return ONLY JSON, no markdown.
{ "question": string, "options": [string, string, string, string], "correctIndex": number, "explanation": string }
Rules: Ask a ${diffMap[diff]} question.

Concept: ${concept.concept}
Definition: ${concept.oneLinerDefinition}
Notes: ${concept.fullNotes}
Confidence: ${Math.round(concept.confidenceScore * 100)}%`
  const raw = await callGemini(prompt, apiKey)
  const clean = raw.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

export async function askBrainAI(question, relevantConcepts, apiKey) {
  const context = relevantConcepts.map(c =>
    `${c.concept} (confidence: ${Math.round(c.confidenceScore * 100)}%): ${c.oneLinerDefinition}`
  ).join('\n')

  const prompt = `You are this student's personal Brain AI. You know their knowledge and confidence levels.

Their knowledge:
${context || 'No relevant concepts found yet.'}

Instructions:
- Do not re-explain what they already know well (confidence > 70%)
- Focus on gaps and new connections between concepts
- Be concise and direct
- If you notice cross-subject connections, highlight them

Question: ${question}`
  return callGemini(prompt, apiKey)
}