export async function extractTextFromImage(imageFile) {
  // Tesseract.js dynamic import to avoid SSR issues
  const { createWorker } = await import('tesseract.js')
  const worker = await createWorker('eng')
  const { data: { text } } = await worker.recognize(imageFile)
  await worker.terminate()
  return text
}
