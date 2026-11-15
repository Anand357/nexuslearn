import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { useBrainStore } from '../stores/brainStore'

const scoreColor = (s) => s >= 0.7 ? '#10B981' : s >= 0.4 ? '#F59E0B' : '#EF4444'
const subjectColors = { Biology: '#06B6D4', Chemistry: '#F59E0B', Physics: '#7C3AED', Mathematics: '#10B981', 'Computer Science': '#F97316', History: '#EC4899', Other: '#6B7280' }

export default function BrainMapPage() {
  const svgRef = useRef()
  const { concepts } = useBrainStore()
  const [selected, setSelected] = useState(null)
  const [hovered, setHovered] = useState(null)

  useEffect(() => {
    if (!svgRef.current || concepts.length === 0) return
    const el = svgRef.current
    const w = el.clientWidth || 800
    const h = el.clientHeight || 560

    d3.select(el).selectAll('*').remove()
    const svg = d3.select(el)
      .attr('width', w).attr('height', h)

    // Background gradient
    const defs = svg.append('defs')
    const radial = defs.append('radialGradient').attr('id', 'bg-grad')
    radial.append('stop').attr('offset', '0%').attr('stop-color', '#1a1a2e')
    radial.append('stop').attr('offset', '100%').attr('stop-color', '#0A0A0F')
    svg.append('rect').attr('width', w).attr('height', h).attr('fill', 'url(#bg-grad)')

    // Add glow filter
    const filter = defs.append('filter').attr('id', 'glow')
    filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'coloredBlur')
    const merge = filter.append('feMerge')
    merge.append('feMergeNode').attr('in', 'coloredBlur')
    merge.append('feMergeNode').attr('in', 'SourceGraphic')

    // Build nodes/links
    const nodes = concepts.map(c => ({ ...c, x: w / 2, y: h / 2 }))
    const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]))
    const links = []
    concepts.forEach(c => {
      c.connections.forEach(targetId => {
        if (nodeMap[targetId] && c.id < targetId) {
          links.push({ source: c.id, target: targetId })
        }
      })
    })

    const sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(130).strength(0.4))
      .force('charge', d3.forceManyBody().strength(-280))
      .force('center', d3.forceCenter(w / 2, h / 2))
      .force('collision', d3.forceCollide(50))

    const g = svg.append('g')

    // Links
    const link = g.append('g').selectAll('line').data(links).enter().append('line')
      .attr('stroke', 'rgba(124,58,237,0.35)').attr('stroke-width', 1.5)
      .attr('filter', 'url(#glow)')

    // Node groups
    const node = g.append('g').selectAll('g').data(nodes).enter().append('g')
      .attr('cursor', 'pointer')
      .call(d3.drag()
        .on('start', (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y })
        .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y })
        .on('end', (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null })
      )
      .on('click', (e, d) => setSelected(d))

    // Outer glow ring
    node.append('circle')
      .attr('r', d => 24 + d.confidenceScore * 8)
      .attr('fill', 'none')
      .attr('stroke', d => scoreColor(d.confidenceScore))
      .attr('stroke-width', 1)
      .attr('opacity', 0.3)
      .attr('filter', 'url(#glow)')

    // Main circle
    node.append('circle')
      .attr('r', d => 18 + d.confidenceScore * 6)
      .attr('fill', d => `${subjectColors[d.subject] || '#7C3AED'}22`)
      .attr('stroke', d => subjectColors[d.subject] || '#7C3AED')
      .attr('stroke-width', 2)

    // Confidence arc
    node.append('circle')
      .attr('r', d => 18 + d.confidenceScore * 6)
      .attr('fill', 'none')
      .attr('stroke', d => scoreColor(d.confidenceScore))
      .attr('stroke-width', 2.5)
      .attr('stroke-dasharray', d => { const r = 18 + d.confidenceScore * 6; const circ = 2 * Math.PI * r; return `${circ * d.confidenceScore} ${circ}` })
      .attr('opacity', 0.8)
      .attr('transform', 'rotate(-90)')

    // Label
    node.append('text')
      .text(d => d.concept.length > 12 ? d.concept.slice(0, 11) + '…' : d.concept)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', 9)
      .attr('font-family', 'Space Grotesk, sans-serif')
      .attr('font-weight', 600)
      .attr('fill', '#F0F0F8')
      .attr('pointer-events', 'none')

    // Score label below
    node.append('text')
      .text(d => `${Math.round(d.confidenceScore * 100)}%`)
      .attr('text-anchor', 'middle')
      .attr('dy', d => (18 + d.confidenceScore * 6) + 14)
      .attr('font-size', 8)
      .attr('fill', d => scoreColor(d.confidenceScore))
      .attr('font-family', 'Inter, sans-serif')
      .attr('pointer-events', 'none')

    // Zoom
    svg.call(d3.zoom().scaleExtent([0.4, 3]).on('zoom', e => g.attr('transform', e.transform)))

    sim.on('tick', () => {
      link.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x).attr('y2', d => d.target.y)
      node.attr('transform', d => `translate(${d.x},${d.y})`)
    })

    return () => sim.stop()
  }, [concepts])

  const selConcept = selected

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Graph */}
      <div style={{ flex: 1, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 5, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {Object.entries(subjectColors).map(([sub, color]) => {
            const count = concepts.filter(c => c.subject === sub).length
            if (!count) return null
            return (
              <div key={sub} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: 'rgba(10,10,15,0.8)', borderRadius: 20, border: `1px solid ${color}44` }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
                <span style={{ fontSize: 10, color: '#9090B0' }}>{sub} ({count})</span>
              </div>
            )
          })}
        </div>
        <div style={{ position: 'absolute', bottom: 16, left: 16, zIndex: 5, fontSize: 10, color: 'var(--text-muted)' }}>
          Scroll to zoom · drag to pan · click node to inspect
        </div>
        <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Detail panel */}
      {selConcept && (
        <div className="fade-in scroll-y" style={{ width: 300, borderLeft: '1px solid var(--border)', padding: 20, background: 'var(--bg-surface)' }}>
          <button onClick={() => setSelected(null)} style={{ fontSize: 11, color: 'var(--text-muted)', background: 'none', marginBottom: 16 }}>← Close</button>
          <div style={{ fontSize: 10, color: subjectColors[selConcept.subject], letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 4 }}>{selConcept.subject}</div>
          <div style={{ fontSize: 16, fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 8 }}>{selConcept.concept}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>{selConcept.oneLinerDefinition}</div>

          {/* Confidence */}
          <div style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: 14, marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Confidence</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: scoreColor(selConcept.confidenceScore) }}>{Math.round(selConcept.confidenceScore * 100)}%</span>
            </div>
            <div style={{ height: 6, background: 'var(--bg-card)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${selConcept.confidenceScore * 100}%`, background: scoreColor(selConcept.confidenceScore), borderRadius: 3 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{ fontSize: 10, color: 'var(--green)' }}>✓ {selConcept.timesCorrect} correct</span>
              <span style={{ fontSize: 10, color: 'var(--red)' }}>✗ {selConcept.timesWrong} wrong</span>
            </div>
          </div>

          {selConcept.connections.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.8px', marginBottom: 8, textTransform: 'uppercase' }}>Connected Concepts</div>
              {/* show connections */}
            </div>
          )}

          {selConcept.relatedConcepts.length > 0 && (
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.8px', marginBottom: 8, textTransform: 'uppercase' }}>Related</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {selConcept.relatedConcepts.map(r => (
                  <span key={r} style={{ padding: '3px 8px', borderRadius: 12, fontSize: 10, background: 'var(--violet-dim)', color: 'var(--violet-light)', border: '1px solid var(--border-bright)' }}>{r}</span>
                ))}
              </div>
            </div>
          )}

          {selConcept.fullNotes && (
            <div style={{ marginTop: 14, padding: 12, background: 'var(--bg-elevated)', borderRadius: 8 }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.8px', marginBottom: 8, textTransform: 'uppercase' }}>Full Notes</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{selConcept.fullNotes}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
