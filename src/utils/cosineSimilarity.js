export function cosineSimilarity(textA, textB) {
  const wordsA = new Set(textA.toLowerCase().split(/\s+/))
  const wordsB = new Set(textB.toLowerCase().split(/\s+/))
  const intersection = [...wordsA].filter(w => wordsB.has(w))
  if (wordsA.size === 0 || wordsB.size === 0) return 0
  return intersection.length / Math.sqrt(wordsA.size * wordsB.size)
}

export function findConnections(newConcept, existingConcepts, threshold = 0.3) {
  return existingConcepts
    .filter(ec => ec.id !== newConcept.id)
    .filter(ec => cosineSimilarity(newConcept.oneLinerDefinition, ec.oneLinerDefinition) >= threshold)
    .map(ec => ec.id)
}
