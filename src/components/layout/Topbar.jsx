import { useLocation } from 'react-router-dom'
import { useBrainStore } from '../../stores/brainStore'

const routeInfo = {
  '/': { label: 'Dashboard', desc: 'Your learning overview' },
  '/notes': { label: 'My Notes', desc: 'Upload & manage your notes' },
  '/concepts': { label: 'Concepts', desc: 'Browse your knowledge brain' },
  '/brain': { label: 'Brain Map', desc: 'Interactive knowledge graph' },
  '/models': { label: '3D Models', desc: 'Explore concepts in 3D' },
  '/quiz': { label: 'Quiz', desc: 'Spaced repetition review' },
  '/ai': { label: 'Brain AI', desc: 'Chat with your personal AI' },
  '/settings': { label: 'Settings', desc: 'Configure API keys & preferences' },
}

export default function Topbar() {
  const loc = useLocation()
  const info = routeInfo[loc.pathname] || { label: 'NexusLearn', desc: '' }
  const { concepts, gaps } = useBrainStore()

  return (
    <div style={{
      height: 52, minHeight: 52,
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center',
      padding: '0 24px', gap: 16,
    }}>
      <div style={{ flex: 1 }}>
        <span style={{ fontSize: 14, fontFamily: 'var(--font-display)', fontWeight: 700 }}>{info.label}</span>
        {info.desc && <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 10 }}>{info.desc}</span>}
      </div>

      {/* Quick stats */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        {gaps.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 20 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--red)' }} className="pulse" />
            <span style={{ fontSize: 10, color: 'var(--red)' }}>{gaps.length} gaps detected</span>
          </div>
        )}
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {concepts.length} concepts · {[...new Set(concepts.map(c => c.subject))].length} subjects
        </div>
      </div>
    </div>
  )
}
