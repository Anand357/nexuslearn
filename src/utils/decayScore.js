export function applyDecay(concept) {
  const daysSince = (Date.now() - concept.lastReviewed) / 86400000
  if (daysSince < 3) return concept
  const factor = Math.pow(0.95, daysSince - 3)
  return { ...concept, confidenceScore: Math.max(0.05, concept.confidenceScore * factor) }
}

export function getReviewPriority(concept) {
  const daysSince = (Date.now() - concept.lastReviewed) / 86400000
  const urgencyFromTime = Math.min(daysSince / 7, 1.0)
  const urgencyFromScore = 1 - concept.confidenceScore
  return (urgencyFromScore * 0.6) + (urgencyFromTime * 0.4)
}
