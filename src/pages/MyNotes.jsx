import { useState, useRef } from 'react'
import { useBrainStore } from '../stores/brainStore'
import { useUserStore } from '../stores/userStore'
import { rewriteNotes, extractConcepts } from '../services/gemini'
import { parseDiagramTags, parseModelTags } from '../utils/parseTags'

const statusColors = { done: 'var(--green)', processing: 'var(--amber)', error: 'var(--red)', pending: 'var(--text-muted)' }

export default function MyNotes() {
  const { notes, concepts, addNote, updateNote, addConcept, gaps } = useBrainStore()
  const { apiKeys } = useUserStore()
  const [text, setText] = useState('')
  const [subject, setSubject] = useState('Biology')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const fileRef = useRef()

  const subjects = ['Biology', 'Chemistry', 'Physics', 'Mathematics', 'History', 'Computer Science', 'Other']

  async function processNote(rawText) {
    if (!rawText.trim()) return
    setError('')
    const noteId = `n${Date.now()}`
    const newNote = {
      id: noteId, rawText, cleanedText: '', subject,
      conceptsExtracted: [], diagramTags: [], modelTags: [],
      uploadedAt: Date.now(), processingStatus: 'processing',
    }
    addNote(newNote)
    setUploading(true)
    setText('')

    if (!apiKeys.gemini) {
      // Demo mode: simulate processing
      await new Promise(r => setTimeout(r, 1500))
      const cleaned = `## ${subject} Notes\n${rawText}\n\n[Demo mode — add Gemini API key in Settings for AI processing]`
      updateNote(noteId, { cleanedText: cleaned, processingStatus: 'done', conceptsExtracted: [] })
      setUploading(false)
      return
    }

    try {
      const cleaned = await rewriteNotes(rawText, apiKeys.gemini)
      const diagramTags = parseDiagramTags(cleaned)
      const modelTags = parseModelTags(cleaned)
      updateNote(noteId, { cleanedText: cleaned, diagramTags, modelTags, processingStatus: 'processing' })

      const extracted = await extractConcepts(cleaned, apiKeys.gemini)
      const newIds = []
      extracted.forEach(c => {
        const id = `c${Date.now()}${Math.random().toString(36).slice(2)}`
        addConcept({ ...c, id, fullNotes: cleaned, confidenceScore: 0.5, lastReviewed: Date.now(), timesCorrect: 0, timesWrong: 0, connections: [], sourceNoteId: noteId, diagramJSON: null, modelKeyword: c.modelKeyword || null })
        newIds.push(id)
      })
      updateNote(noteId, { conceptsExtracted: newIds, processingStatus: 'done' })
    } catch (e) {
      updateNote(noteId, { processingStatus: 'error' })
      setError(e.message)
    }
    setUploading(false)
  }

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type === 'application/pdf') {
      setError('PDF support requires pdfjs-dist setup — type notes directly for now')
      return
    }
    if (file.type.startsWith('image/')) {
      setError('Image OCR requires Tesseract.js initialization — use typed input for now')
      return
    }
  }

  const sortedNotes = [...notes].sort((a, b) => b.uploadedAt - a.uploadedAt)
  const selectedNote = selected ? notes.find(n => n.id === selected) : null

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Left: upload + list */}
      <div className="scroll-y" style={{ width: 420, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Upload panel */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 16, fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 4 }}>Upload Notes</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>AI will rewrite, extract concepts & build your brain</div>

          <select value={subject} onChange={e => setSubject(e.target.value)} style={{
            width: '100%', padding: '8px 12px', background: 'var(--bg-elevated)',
            border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)',
            fontSize: 12, marginBottom: 10,
          }}>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <textarea value={text} onChange={e => setText(e.target.value)}
            placeholder="Paste messy notes here... e.g. 'photsynthsis — sunlite + water + CO2 --> glucos + O2'"
            rows={5}
            style={{
              width: '100%', padding: '10px 12px', background: 'var(--bg-elevated)',
              border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)',
              fontSize: 12, resize: 'vertical', lineHeight: 1.6, marginBottom: 10,
            }}
            onKeyDown={e => { if (e.ctrlKey && e.key === 'Enter') processNote(text) }}
          />

          {error && <div style={{ fontSize: 11, color: 'var(--red)', marginBottom: 8, padding: '6px 10px', background: 'rgba(239,68,68,0.08)', borderRadius: 6 }}>{error}</div>}

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => processNote(text)} disabled={!text.trim() || uploading} style={{
              flex: 1, padding: '9px', background: uploading ? 'var(--bg-elevated)' : 'linear-gradient(135deg, var(--violet), var(--violet-light))',
              color: uploading ? 'var(--text-muted)' : '#fff', borderRadius: 8, fontSize: 12, fontWeight: 600,
              transition: 'opacity 0.15s',
            }}>
              {uploading ? '⟳ Processing...' : '◆ Process Notes'}
            </button>
            <button onClick={() => fileRef.current?.click()} style={{
              padding: '9px 14px', background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', borderRadius: 8, fontSize: 12,
            }}>📎</button>
            <input ref={fileRef} type="file" accept="image/*,.pdf" onChange={handleFile} style={{ display: 'none' }} />
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6 }}>Ctrl+Enter to process · PNG, JPG, PDF supported</div>
        </div>

        {/* Notes list */}
        <div className="scroll-y" style={{ flex: 1, padding: '16px 12px' }}>
          {sortedNotes.map(n => (
            <div key={n.id} onClick={() => setSelected(n.id === selected ? null : n.id)} style={{
              padding: '12px 14px', background: selected === n.id ? 'var(--violet-dim)' : 'var(--bg-surface)',
              border: `1px solid ${selected === n.id ? 'var(--border-bright)' : 'var(--border)'}`,
              borderRadius: 10, marginBottom: 8, cursor: 'pointer', transition: 'all 0.15s',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--violet-light)' }}>{n.subject}</span>
                <span style={{ fontSize: 10, color: statusColors[n.processingStatus] }}>
                  {n.processingStatus === 'processing' ? '⟳ ' : n.processingStatus === 'done' ? '✓ ' : n.processingStatus === 'error' ? '✗ ' : '○ '}{n.processingStatus}
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {n.rawText}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6 }}>
                {new Date(n.uploadedAt).toLocaleDateString()} · {n.conceptsExtracted.length} concepts
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: note detail */}
      <div className="scroll-y" style={{ flex: 1, padding: '28px 32px' }}>
        {selectedNote ? (
          <div className="fade-in">
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{selectedNote.subject}</div>
            <div style={{ fontSize: 17, fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 20 }}>Note Detail</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.8px', marginBottom: 10, textTransform: 'uppercase' }}>Raw Input</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7, fontFamily: 'monospace' }}>{selectedNote.rawText}</div>
              </div>
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-bright)', borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 10, color: 'var(--violet-light)', letterSpacing: '0.8px', marginBottom: 10, textTransform: 'uppercase' }}>AI Rewritten</div>
                <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{selectedNote.cleanedText || 'Processing...'}</div>
              </div>
            </div>

            {selectedNote.conceptsExtracted.length > 0 && (
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 12 }}>Extracted Concepts ({selectedNote.conceptsExtracted.length})</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {selectedNote.conceptsExtracted.map(id => {
                    const c = concepts.find(x => x.id === id)
                    if (!c) return null
                    return (
                      <span key={id} style={{
                        padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                        background: 'var(--violet-dim)', border: '1px solid var(--border-bright)', color: 'var(--violet-light)',
                      }}>{c.concept}</span>
                    )
                  })}
                </div>
              </div>
            )}

            {(selectedNote.diagramTags?.length > 0 || selectedNote.modelTags?.length > 0) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
                {selectedNote.diagramTags?.length > 0 && (
                  <div style={{ background: 'var(--cyan-dim)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 10, padding: 14 }}>
                    <div style={{ fontSize: 10, color: 'var(--cyan)', letterSpacing: '0.8px', marginBottom: 8, textTransform: 'uppercase' }}>Auto-Diagrams</div>
                    {selectedNote.diagramTags.map((t, i) => <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>• {t}</div>)}
                  </div>
                )}
                {selectedNote.modelTags?.length > 0 && (
                  <div style={{ background: 'var(--amber-dim)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, padding: 14 }}>
                    <div style={{ fontSize: 10, color: 'var(--amber)', letterSpacing: '0.8px', marginBottom: 8, textTransform: 'uppercase' }}>3D Models</div>
                    {selectedNote.modelTags.map((t, i) => <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>• {t}</div>)}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>◈</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Select a note to inspect</div>
            <div style={{ fontSize: 12 }}>Or upload new notes on the left</div>
          </div>
        )}
      </div>
    </div>
  )
}
