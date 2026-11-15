import { useState } from 'react'
import { useBrainStore } from '../stores/brainStore'
import DiagramRenderer from '../components/diagrams/DiagramRenderer'

const scoreColor = s => s >= 0.7 ? 'var(--green)' : s >= 0.4 ? 'var(--amber)' : 'var(--red)'
const diffColor = { basic: 'var(--green)', intermediate: 'var(--amber)', advanced: 'var(--red)' }

export default function ConceptsPage() {
  const { concepts } = useBrainStore()
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const subjects = ['all', ...new Set(concepts.map(c => c.subject))]
  const filtered = concepts.filter(c =>
    (filter === 'all' || c.subject === filter) &&
    (!search || c.concept.toLowerCase().includes(search.toLowerCase()))
  )
  const selConcept = selected ? concepts.find(c => c.id === selected) : null

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Left list */}
      <div className="scroll-y" style={{ width: 320, borderRight: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
        <div style={{ padding: '20px 16px 12px', position: 'sticky', top: 0, background: 'var(--bg-surface)', zIndex: 2, borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 15, fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 12 }}>◈ All Concepts</div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search concepts..."
            style={{ width: '100%', padding: '7px 10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 12, marginBottom: 10 }}
          />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {subjects.map(s => (
              <button key={s} onClick={() => setFilter(s)} style={{
                padding: '3px 10px', borderRadius: 12, fontSize: 10, fontWeight: 600,
                background: filter === s ? 'var(--violet-dim)' : 'transparent',
                border: `1px solid ${filter === s ? 'var(--border-bright)' : 'var(--border)'}`,
                color: filter === s ? 'var(--violet-light)' : 'var(--text-muted)',
              }}>{s}</button>
            ))}
          </div>
        </div>
        {filtered.map(c => (
          <div key={c.id} onClick={() => setSelected(c.id === selected ? null : c.id)} style={{
            padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border)',
            background: selected === c.id ? 'var(--violet-dim)' : 'transparent',
            transition: 'background 0.15s',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{c.concept}</span>
              <span style={{ fontSize: 11, color: scoreColor(c.confidenceScore), fontWeight: 600 }}>{Math.round(c.confidenceScore * 100)}%</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{c.subject} · <span style={{ color: diffColor[c.difficulty] }}>{c.difficulty}</span></div>
            <div style={{ height: 3, background: 'var(--bg-elevated)', borderRadius: 2 }}>
              <div style={{ height: '100%', width: `${c.confidenceScore * 100}%`, background: scoreColor(c.confidenceScore), borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Right detail */}
      <div className="scroll-y" style={{ flex: 1, padding: 28 }}>
        {selConcept ? (
          <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>{selConcept.subject} · {selConcept.difficulty}</div>
                <div style={{ fontSize: 22, fontFamily: 'var(--font-display)', fontWeight: 700 }}>{selConcept.concept}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.6 }}>{selConcept.oneLinerDefinition}</div>
              </div>
              <div style={{ textAlign: 'center', padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 12, border: `1px solid ${scoreColor(selConcept.confidenceScore)}44` }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: scoreColor(selConcept.confidenceScore) }}>{Math.round(selConcept.confidenceScore * 100)}%</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>confidence</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
              {[
                { label: 'Correct', value: selConcept.timesCorrect, color: 'var(--green)' },
                { label: 'Wrong', value: selConcept.timesWrong, color: 'var(--red)' },
                { label: 'Last Reviewed', value: new Date(selConcept.lastReviewed).toLocaleDateString(), color: 'var(--cyan)' },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {selConcept.diagramJSON && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 12, color: 'var(--cyan)' }}>Auto-Generated Diagram</div>
                <DiagramRenderer json={selConcept.diagramJSON} />
              </div>
            )}

            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 18, marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>Full Notes</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{selConcept.fullNotes}</div>
            </div>

            {selConcept.relatedConcepts.length > 0 && (
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 18 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 12 }}>Related Concepts</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {selConcept.relatedConcepts.map(r => (
                    <span key={r} style={{ padding: '5px 12px', borderRadius: 20, fontSize: 11, background: 'var(--violet-dim)', border: '1px solid var(--border-bright)', color: 'var(--violet-light)' }}>{r}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 56, marginBottom: 16, opacity: 0.2 }}>◈</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Select a concept</div>
            <div style={{ fontSize: 12 }}>See notes, diagrams, confidence scores, and related concepts</div>
          </div>
        )}
      </div>
    </div>
  )
}
