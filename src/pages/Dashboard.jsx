import { useBrainStore } from '../stores/brainStore'
import { useUserStore } from '../stores/userStore'
import { getReviewPriority } from '../utils/decayScore'
import { useNavigate } from 'react-router-dom'

const scoreColor = (s) => s >= 0.7 ? 'var(--green)' : s >= 0.4 ? 'var(--amber)' : 'var(--red)'
const scoreLabel = (s) => s >= 0.7 ? 'Strong' : s >= 0.4 ? 'Learning' : 'Weak'

export default function Dashboard() {
  const { concepts, notes, gaps, getOverallMastery, getSubjectBreakdown } = useBrainStore()
  const { user } = useUserStore()
  const nav = useNavigate()
  const mastery = getOverallMastery()
  const subjects = getSubjectBreakdown()
  const reviewNow = [...concepts].sort((a, b) => getReviewPriority(b) - getReviewPriority(a)).slice(0, 3)
  const recentNotes = [...notes].sort((a, b) => b.uploadedAt - a.uploadedAt).slice(0, 3)

  return (
    <div className="scroll-y" style={{ flex: 1, padding: '28px 32px', background: 'var(--bg-base)' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 4 }}>
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, <span className="glow-text">{user.name.split(' ')[0]}</span>
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
          Your brain has <strong style={{ color: 'var(--violet-light)' }}>{concepts.length} concepts</strong> across {subjects.length} subjects · {gaps.length} gaps detected
        </div>
      </div>

      {/* Top stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Overall Mastery', value: `${Math.round(mastery * 100)}%`, sub: 'brain health', color: 'var(--violet)', icon: '◎' },
          { label: 'Concepts', value: concepts.length, sub: 'in your brain', color: 'var(--cyan)', icon: '◈' },
          { label: 'Study Streak', value: `${user.streakDays}d`, sub: 'days in a row', color: 'var(--amber)', icon: '🔥' },
          { label: 'XP Earned', value: user.xp.toLocaleString(), sub: 'experience points', color: 'var(--green)', icon: '⭐' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '18px 20px',
          }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 8 }}>{stat.icon} {stat.label}</div>
            <div style={{ fontSize: 26, fontFamily: 'var(--font-display)', fontWeight: 700, color: stat.color, marginBottom: 2 }}>{stat.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Subject mastery */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--cyan)' }}>◆</span> Subject Mastery
          </div>
          {subjects.map(s => (
            <div key={s.subject} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.subject}</span>
                <span style={{ fontSize: 12, color: scoreColor(s.mastery), fontWeight: 600 }}>{Math.round(s.mastery * 100)}% · {s.count} concepts</span>
              </div>
              <div style={{ height: 5, background: 'var(--bg-elevated)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${s.mastery * 100}%`, background: `linear-gradient(90deg, ${scoreColor(s.mastery)}, ${scoreColor(s.mastery)}99)`, borderRadius: 3, transition: 'width 0.6s ease' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Review queue */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--amber)' }}>⚡</span> Review Now
          </div>
          {reviewNow.map(c => (
            <div key={c.id} onClick={() => nav('/quiz')} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 8, marginBottom: 8,
              cursor: 'pointer', border: '1px solid transparent', transition: 'border-color 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-bright)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{c.concept}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.subject} · {scoreLabel(c.confidenceScore)}</div>
              </div>
              <div style={{
                padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                background: `${scoreColor(c.confidenceScore)}22`, color: scoreColor(c.confidenceScore),
              }}>{Math.round(c.confidenceScore * 100)}%</div>
            </div>
          ))}
          <button onClick={() => nav('/quiz')} style={{
            width: '100%', padding: '9px', marginTop: 4,
            background: 'linear-gradient(135deg, var(--violet), var(--violet-light))',
            color: '#fff', borderRadius: 8, fontSize: 12, fontWeight: 600,
          }}>Start Quiz Session →</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Gaps */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--red)' }}>◌</span> Knowledge Gaps
            <span style={{ fontSize: 10, background: 'rgba(239,68,68,0.15)', color: 'var(--red)', padding: '2px 7px', borderRadius: 10 }}>{gaps.length} missing</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {gaps.map(g => (
              <span key={g} style={{
                padding: '5px 10px', borderRadius: 20, fontSize: 12,
                background: 'rgba(239,68,68,0.08)', border: '1px dashed rgba(239,68,68,0.3)',
                color: 'var(--text-secondary)',
              }}>+ {g}</span>
            ))}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>
            These concepts are referenced in your notes but not yet in your brain.
          </div>
        </div>

        {/* Recent notes */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--violet-light)' }}>◈</span> Recent Uploads
          </div>
          {recentNotes.map(n => (
            <div key={n.id} style={{
              padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 8, marginBottom: 8,
            }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 3 }}>{n.subject}</div>
              <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.rawText}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                {new Date(n.uploadedAt).toLocaleDateString()} · {n.conceptsExtracted.length} concepts extracted
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
