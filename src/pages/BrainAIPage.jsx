import { useState, useRef, useEffect } from 'react'
import { useBrainStore } from '../stores/brainStore'
import { useUserStore } from '../stores/userStore'
import { askBrainAI } from '../services/gemini'

export default function BrainAIPage() {
  const { concepts } = useBrainStore()
  const { apiKeys } = useUserStore()
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your Brain AI. I know everything in your knowledge brain — your concepts, confidence levels, and gaps. Ask me anything and I'll help you connect the dots across subjects.", ts: Date.now() }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef()
  const textRef = useRef()

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function send() {
    const q = input.trim()
    if (!q || loading) return
    setInput('')
    setMessages(m => [...m, { role: 'user', content: q, ts: Date.now() }])
    setLoading(true)

    if (!apiKeys.gemini) {
      await new Promise(r => setTimeout(r, 800))
      setMessages(m => [...m, {
        role: 'assistant',
        content: `[Demo mode] You asked about: "${q}"\n\nTo get real AI responses that use your knowledge brain, add your Gemini API key in Settings. The Brain AI will then know about your ${concepts.length} concepts and ${Math.round(concepts.reduce((s, c) => s + c.confidenceScore, 0) / concepts.length * 100)}% overall mastery.`,
        ts: Date.now()
      }])
      setLoading(false)
      return
    }

    try {
      const relevant = concepts.filter(c => q.toLowerCase().split(' ').some(w => w.length > 3 && c.concept.toLowerCase().includes(w)))
      const reply = await askBrainAI(q, relevant.length > 0 ? relevant : concepts.slice(0, 5), apiKeys.gemini)
      setMessages(m => [...m, { role: 'assistant', content: reply, ts: Date.now() }])
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', content: `Error: ${e.message}`, ts: Date.now(), error: true }])
    }
    setLoading(false)
  }

  const suggestions = ['Explain the cross-subject connections in my brain', 'What are my weakest concepts right now?', 'How does Photosynthesis relate to Chemistry?', 'Quiz me verbally on my gaps']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-base)' }}>
      {/* Header */}
      <div style={{ padding: '18px 28px', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--violet), var(--cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, boxShadow: 'var(--shadow-glow)' }}>◉</div>
        <div>
          <div style={{ fontSize: 15, fontFamily: 'var(--font-display)', fontWeight: 700 }}>Brain AI</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Knows your {concepts.length} concepts · Gemini 2.0 Flash</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 16 }}>
          {[
            { label: 'Concepts', value: concepts.length, color: 'var(--violet-light)' },
            { label: 'Mastery', value: `${Math.round(concepts.reduce((s, c) => s + c.confidenceScore, 0) / concepts.length * 100)}%`, color: 'var(--cyan)' },
            { label: 'Subjects', value: [...new Set(concepts.map(c => c.subject))].length, color: 'var(--amber)' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="scroll-y" style={{ flex: 1, padding: '24px 28px' }}>
        {messages.map((m, i) => (
          <div key={i} className="fade-in" style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 16 }}>
            {m.role === 'assistant' && (
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--violet), var(--cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, marginRight: 10, flexShrink: 0, marginTop: 4 }}>◉</div>
            )}
            <div style={{
              maxWidth: '72%', padding: '12px 16px', borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: m.role === 'user' ? 'linear-gradient(135deg, var(--violet), var(--violet-light))' : 'var(--bg-surface)',
              border: m.role === 'assistant' ? '1px solid var(--border)' : 'none',
              color: 'var(--text-primary)', fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-line',
            }}>
              {m.content}
              <div style={{ fontSize: 9, color: m.role === 'user' ? 'rgba(255,255,255,0.5)' : 'var(--text-muted)', marginTop: 6 }}>
                {new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--violet), var(--cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>◉</div>
            <div style={{ padding: '12px 16px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px 16px 16px 4px', display: 'flex', gap: 4, alignItems: 'center' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--violet)', animation: `pulse-dot 1.2s ${i * 0.2}s ease-in-out infinite` }} />
              ))}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {messages.length === 1 && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>Suggested questions:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {suggestions.map(s => (
                <button key={s} onClick={() => { setInput(s); textRef.current?.focus() }} style={{
                  padding: '7px 12px', background: 'var(--violet-dim)', border: '1px solid var(--border-bright)',
                  borderRadius: 20, color: 'var(--violet-light)', fontSize: 11, cursor: 'pointer',
                  transition: 'all 0.15s',
                }}>{s}</button>
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '16px 28px', borderTop: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <textarea ref={textRef} value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder="Ask Brain AI anything about your notes... (Enter to send)"
            rows={2} style={{
              flex: 1, padding: '10px 14px', background: 'var(--bg-elevated)',
              border: '1px solid var(--border)', borderRadius: 10,
              color: 'var(--text-primary)', fontSize: 13, resize: 'none', lineHeight: 1.5,
              transition: 'border-color 0.15s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--border-bright)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <button onClick={send} disabled={!input.trim() || loading} style={{
            padding: '10px 18px', background: input.trim() && !loading ? 'linear-gradient(135deg, var(--violet), var(--violet-light))' : 'var(--bg-elevated)',
            color: input.trim() && !loading ? '#fff' : 'var(--text-muted)', borderRadius: 10, fontSize: 13, fontWeight: 600, transition: 'all 0.15s', height: 44,
          }}>Send</button>
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6 }}>Enter to send · Shift+Enter for new line · Powered by Gemini 2.0 Flash</div>
      </div>
    </div>
  )
}