import { useMemo } from 'react'

const colorMap = {
  purple: { bg: 'rgba(124,58,237,0.15)', border: '#7C3AED', text: '#C4B5FD' },
  teal: { bg: 'rgba(6,182,212,0.15)', border: '#06B6D4', text: '#67E8F9' },
  coral: { bg: 'rgba(249,115,22,0.15)', border: '#F97316', text: '#FDBA74' },
  amber: { bg: 'rgba(245,158,11,0.15)', border: '#F59E0B', text: '#FCD34D' },
  blue: { bg: 'rgba(59,130,246,0.15)', border: '#3B82F6', text: '#93C5FD' },
  gray: { bg: 'rgba(107,114,128,0.15)', border: '#6B7280', text: '#D1D5DB' },
}

function FlowDiagram({ nodes, edges }) {
  const cols = Math.ceil(Math.sqrt(nodes.length))
  const nodeSize = { w: 120, h: 52 }
  const pad = { x: 48, y: 40 }
  const totalW = cols * (nodeSize.w + pad.x) - pad.x + 40
  const rows = Math.ceil(nodes.length / cols)
  const totalH = rows * (nodeSize.h + pad.y) - pad.y + 40

  const positions = {}
  nodes.forEach((n, i) => {
    const col = i % cols, row = Math.floor(i / cols)
    positions[n.id] = { x: 20 + col * (nodeSize.w + pad.x), y: 20 + row * (nodeSize.h + pad.y) }
  })

  return (
    <svg viewBox={`0 0 ${totalW} ${totalH}`} style={{ width: '100%', maxWidth: totalW, overflow: 'visible' }}>
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="rgba(124,58,237,0.7)" />
        </marker>
      </defs>
      {edges.map((e, i) => {
        const s = positions[e.from], t = positions[e.to]
        if (!s || !t) return null
        const sx = s.x + nodeSize.w / 2, sy = s.y + nodeSize.h
        const tx = t.x + nodeSize.w / 2, ty = t.y
        const mx = (sx + tx) / 2, my = (sy + ty) / 2
        return (
          <g key={i}>
            <path d={`M${sx},${sy} C${sx},${my} ${tx},${my} ${tx},${ty}`}
              stroke="rgba(124,58,237,0.4)" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
            {e.label && <text x={mx} y={my - 5} textAnchor="middle" fill="#5A5A7A" fontSize="9" fontFamily="Inter">{e.label}</text>}
          </g>
        )
      })}
      {nodes.map(n => {
        const pos = positions[n.id]
        const c = colorMap[n.color] || colorMap.purple
        return (
          <g key={n.id} transform={`translate(${pos.x},${pos.y})`}>
            <rect width={nodeSize.w} height={nodeSize.h} rx="8" fill={c.bg} stroke={c.border} strokeWidth="1.5" />
            <text x={nodeSize.w / 2} y={20} textAnchor="middle" fill={c.text} fontSize="11" fontWeight="600" fontFamily="Space Grotesk">{n.label}</text>
            <text x={nodeSize.w / 2} y={35} textAnchor="middle" fill="#5A5A7A" fontSize="8" fontFamily="Inter">{n.subtitle}</text>
          </g>
        )
      })}
    </svg>
  )
}

function CycleDiagram({ nodes }) {
  const r = 100, cx = 160, cy = 160, nr = 34
  const positions = nodes.map((_, i) => {
    const angle = (i / nodes.length) * 2 * Math.PI - Math.PI / 2
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
  })

  return (
    <svg viewBox="0 0 320 320" style={{ width: '100%', maxWidth: 320 }}>
      <defs>
        <marker id="carrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="rgba(124,58,237,0.7)" />
        </marker>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(124,58,237,0.15)" strokeWidth="1" strokeDasharray="4,4" />
      {positions.map((pos, i) => {
        const next = positions[(i + 1) % positions.length]
        const angle = Math.atan2(next.y - pos.y, next.x - pos.x)
        const ox = Math.cos(angle) * nr, oy = Math.sin(angle) * nr
        return (
          <line key={i} x1={pos.x + ox} y1={pos.y + oy} x2={next.x - ox} y2={next.y - oy}
            stroke="rgba(124,58,237,0.45)" strokeWidth="1.5" markerEnd="url(#carrow)" />
        )
      })}
      {nodes.map((n, i) => {
        const pos = positions[i]
        const c = colorMap[n.color] || colorMap.purple
        return (
          <g key={n.id}>
            <circle cx={pos.x} cy={pos.y} r={nr} fill={c.bg} stroke={c.border} strokeWidth="1.5" />
            <text x={pos.x} y={pos.y - 4} textAnchor="middle" fill={c.text} fontSize="9" fontWeight="600" fontFamily="Space Grotesk">{n.label.length > 10 ? n.label.slice(0,9)+'…' : n.label}</text>
            <text x={pos.x} y={pos.y + 9} textAnchor="middle" fill="#5A5A7A" fontSize="7" fontFamily="Inter">{n.subtitle?.slice(0,12)}</text>
          </g>
        )
      })}
    </svg>
  )
}

function HierarchyDiagram({ nodes, edges }) {
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]))
  const levels = {}
  const assignLevel = (id, level) => {
    levels[id] = Math.max(levels[id] || 0, level)
    edges.filter(e => e.from === id).forEach(e => assignLevel(e.to, level + 1))
  }
  const roots = nodes.filter(n => !edges.some(e => e.to === n.id))
  roots.forEach(n => assignLevel(n.id, 0))
  const maxLevel = Math.max(...Object.values(levels), 0)
  const byLevel = {}
  Object.entries(levels).forEach(([id, lv]) => { if (!byLevel[lv]) byLevel[lv] = []; byLevel[lv].push(id) })
  const maxPerRow = Math.max(...Object.values(byLevel).map(a => a.length), 1)
  const W = Math.max(maxPerRow * 130 + 40, 320)
  const H = (maxLevel + 1) * 90 + 40
  const positions = {}
  Object.entries(byLevel).forEach(([lv, ids]) => {
    ids.forEach((id, i) => {
      positions[id] = { x: 20 + i * (W - 40) / Math.max(ids.length - 1, 1), y: 20 + Number(lv) * 80 }
    })
  })

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
      <defs>
        <marker id="harrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="rgba(124,58,237,0.6)" />
        </marker>
      </defs>
      {edges.map((e, i) => {
        const s = positions[e.from], t = positions[e.to]
        if (!s || !t) return null
        return <line key={i} x1={s.x} y1={s.y + 22} x2={t.x} y2={t.y - 2}
          stroke="rgba(124,58,237,0.4)" strokeWidth="1.5" markerEnd="url(#harrow)" />
      })}
      {nodes.map(n => {
        const pos = positions[n.id]
        if (!pos) return null
        const c = colorMap[n.color] || colorMap.purple
        return (
          <g key={n.id} transform={`translate(${pos.x - 50},${pos.y})`}>
            <rect width={100} height={44} rx="6" fill={c.bg} stroke={c.border} strokeWidth="1.5" />
            <text x={50} y={17} textAnchor="middle" fill={c.text} fontSize="10" fontWeight="600" fontFamily="Space Grotesk">{n.label}</text>
            <text x={50} y={30} textAnchor="middle" fill="#5A5A7A" fontSize="7" fontFamily="Inter">{n.subtitle?.slice(0,16)}</text>
          </g>
        )
      })}
    </svg>
  )
}

export default function DiagramRenderer({ json }) {
  if (!json) return null
  const { type, title, nodes, edges } = json

  return (
    <div style={{ background: 'var(--bg-elevated)', borderRadius: 12, padding: 20 }}>
      {title && <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 16, textAlign: 'center' }}>{title}</div>}
      {type === 'flow' && <FlowDiagram nodes={nodes} edges={edges || []} />}
      {type === 'cycle' && <CycleDiagram nodes={nodes} edges={edges || []} />}
      {type === 'hierarchy' && <HierarchyDiagram nodes={nodes} edges={edges || []} />}
      {!['flow','cycle','hierarchy'].includes(type) && <FlowDiagram nodes={nodes} edges={edges || []} />}
    </div>
  )
}
