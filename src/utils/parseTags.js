export function parseDiagramTags(text) {
  const tags = []
  const regex = /\[DIAGRAM:\s*([^\]]+)\]/gi
  let match
  while ((match = regex.exec(text)) !== null) tags.push(match[1].trim())
  return tags
}

export function parseModelTags(text) {
  const tags = []
  const regex = /\[MODEL:\s*([^\]]+)\]/gi
  let match
  while ((match = regex.exec(text)) !== null) tags.push(match[1].trim())
  return tags
}
