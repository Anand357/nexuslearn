export async function fetch3DModel(keyword) {
  try {
    const res = await fetch(
      `https://api.sketchfab.com/v3/models?q=${encodeURIComponent(keyword)}&count=3&sort_by=-likeCount`
    )
    const data = await res.json()
    if (data.results?.length > 0) {
      const uid = data.results[0].uid
      const oembed = await fetch(`https://sketchfab.com/oembed?url=https://sketchfab.com/models/${uid}`)
      const embedData = await oembed.json()
      return { type: 'iframe', html: embedData.html, uid }
    }
  } catch (e) { /* fallback */ }
  return { type: 'fallback', keyword }
}
