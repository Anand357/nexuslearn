import { NavLink } from 'react-router-dom'
import { useUserStore } from '../../stores/userStore'
import { useBrainStore } from '../../stores/brainStore'

const navItems = [
  { to: '/', label: 'Dashboard', icon: '⬡', end: true },
  { to: '/notes', label: 'My Notes', icon: '◈' },
  { to: '/concepts', label: 'Concepts', icon: '◆' },
  { to: '/brain', label: 'Brain Map', icon: '◎' },
  { to: '/models', label: '3D Models', icon: '◷' },
  { to: '/quiz', label: 'Quiz', icon: '⟐' },
  { to: '/ai', label: 'Brain AI', icon: '◉' },
]

const subjectColors = {
  Biology: '#06B6D4', Chemistry: '#F59E0B', Physics: '#7C3AED',
  Mathematics: '#10B981', 'Computer Science': '#F97316', History: '#EC4899'
}

export default function Sidebar() {
  const { user } = useUserStore()
  const { concepts, getOverallMastery, getSubjectBreakdown } = useBrainStore()
  const mastery = getOverallMastery()
  const subjects = getSubjectBreakdown()

  return (
    <aside style={{
      width: 224, minWidth: 224, height: '100vh',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'linear-gradient(135deg, #7C3AED, #06B6D4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 800, flexShrink: 0, color: '#fff',
            boxShadow: '0 0 16px rgba(124,58,237,0.45)',
          }}>N</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, letterSpacing: '-0.3px' }}>
              Nexus<span style={{ color: 'var(--violet-light)' }}>Learn</span>
            </div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.6px', textTransform: 'uppercase' }}>AI Second Brain</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '10px 8px', flex: 1 }}>
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} end={item.end} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 9,
            padding: '8px 11px', borderRadius: 8, marginBottom: 1,
            color: isActive ? '#fff' : 'var(--text-secondary)',
            background: isActive ? 'rgba(124,58,237,0.18)' : 'transparent',
            borderLeft: `2px solid ${isActive ? 'var(--violet)' : 'transparent'}`,
            fontSize: 12.5, fontWeight: isActive ? 600 : 400,
            transition: 'all 0.12s ease', textDecoration: 'none',
          })}
            onMouseEnter={e => { if (!e.currentTarget.classList.contains('active')) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
            onMouseLeave={e => { if (!e.currentTarget.classList.contains('active')) e.currentTarget.style.background = 'transparent' }}
          >
            <span style={{ fontSize: 14, lineHeight: 1 }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--border)', margin: '10px 4px' }} />

        <NavLink to="/settings" style={({ isActive }) => ({
          display: 'flex', alignItems: 'center', gap: 9,
          padding: '8px 11px', borderRadius: 8,
          color: isActive ? '#fff' : 'var(--text-muted)',
          background: isActive ? 'rgba(124,58,237,0.18)' : 'transparent',
          borderLeft: `2px solid ${isActive ? 'var(--violet)' : 'transparent'}`,
          fontSize: 12.5, textDecoration: 'none', transition: 'all 0.12s',
        })}>
          <span style={{ fontSize: 14 }}>◧</span> Settings
        </NavLink>
      </nav>

      {/* Brain health card */}
      <div style={{ margin: '0 10px 10px', background: 'var(--bg-elevated)', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.8px', marginBottom: 8, textTransform: 'uppercase' }}>Brain Health</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{concepts.length} concepts</span>
          <span style={{ fontSize: 11, color: 'var(--violet-light)', fontWeight: 700 }}>{Math.round(mastery * 100)}%</span>
        </div>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden', marginBottom: 8 }}>
          <div style={{ height: '100%', width: `${mastery * 100}%`, background: 'linear-gradient(90deg, #7C3AED, #06B6D4)', borderRadius: 2, transition: 'width 0.5s' }} />
        </div>
        {/* Subject dots */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {subjects.map(s => (
            <div key={s.subject} title={`${s.subject}: ${Math.round(s.mastery * 100)}%`} style={{
              width: 6, height: 6, borderRadius: '50%',
              background: subjectColors[s.subject] || '#6B7280',
              opacity: 0.5 + s.mastery * 0.5,
            }} />
          ))}
        </div>
      </div>

      {/* User */}
      <div style={{ padding: '10px 14px 14px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 9 }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'linear-gradient(135deg, #7C3AED, #06B6D4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700, flexShrink: 0, color: '#fff',
        }}>{user.name[0]}</div>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
          <div style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>🔥 {user.streakDays}d · {user.xp.toLocaleString()} XP</div>
        </div>
      </div>
    </aside>
  )
}
