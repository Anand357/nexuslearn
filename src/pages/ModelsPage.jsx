import { useState, useEffect } from 'react'
import { useBrainStore } from '../stores/brainStore'
import { fetch3DModel } from '../services/sketchfab'

export default function ModelsPage() {
  const { concepts } = useBrainStore()
  const modelConcepts = concepts.filter(c => c.modelKeyword)
  const [selected, setSelected] = useState(modelConcepts[0] || null)
  const [model, setModel] = useState(null)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!selected?.modelKeyword) return
    setLoading(true)
    setModel(null)
    fetch3DModel(selected.modelKeyword)
      .then(m => setModel(m))
      .finally(() => setLoading(false))
  }, [selected])

  const filtered = modelConcepts.filter(c =>
    !search || c.concept.toLowerCase().includes(search.toLowerCase()) || c.modelKeyword.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div className="scroll-y" style={{ width: 260, borderRight: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
        <div style={{ padding: '20px 16px 12px' }}>
          <div style={{ fontSize: 15, fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 12 }}>◷ 3D Models</div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search models..."
            style={{ width: '100%', padding: '7px 10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 12 }}
          />
        </div>
        {filtered.map(c => (
          <div key={c.id} onClick={() => setSelected(c)} style={{
            padding: '12px 16px', cursor: 'pointer',
            background: selected?.id === c.id ? 'var(--violet-dim)' : 'transparent',
            borderLeft: `3px solid ${selected?.id === c.id ? 'var(--violet)' : 'transparent'}`,
            borderBottom: '1px solid var(--border)',
            transition: 'all 0.15s',
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{c.concept}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>🔍 "{c.modelKeyword}"</div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
            No 3D models yet.<br />Upload notes with physical objects to see models here.
          </div>
        )}
      </div>

      {/* Viewer */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 24 }}>
        {selected ? (
          <>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: 'var(--violet-light)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 4 }}>3D Model · {selected.subject}</div>
              <div style={{ fontSize: 20, fontFamily: 'var(--font-display)', fontWeight: 700 }}>{selected.concept}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{selected.oneLinerDefinition}</div>
            </div>

            <div style={{
              flex: 1, borderRadius: 'var(--radius-lg)', overflow: 'hidden',
              border: '1px solid var(--border)', background: 'var(--bg-surface)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
              minHeight: 400,
            }}>
              {loading && (
                <div style={{ textAlign: 'center' }}>
                  <div className="shimmer" style={{ width: 200, height: 16, margin: '0 auto 12px' }} />
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Loading 3D model from Sketchfab...</div>
                </div>
              )}
              {!loading && model?.type === 'iframe' && (
                <div dangerouslySetInnerHTML={{ __html: model.html.replace('width="480"', 'width="100%"').replace('height="480"', 'height="100%"') }}
                  style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }} />
              )}
              {!loading && model?.type === 'fallback' && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 64, marginBottom: 16, opacity: 0.3 }}>◷</div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>No 3D model found for "{model.keyword}"</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Try adding the concept to Sketchfab or check your internet connection</div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 64, marginBottom: 16, opacity: 0.2 }}>◷</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Select a concept to view its 3D model</div>
            <div style={{ fontSize: 12 }}>3D models are fetched from Sketchfab for any physical object in your notes</div>
          </div>
        )}
      </div>
    </div>
  )
}
