import { useState } from 'react'
import { useUserStore } from '../stores/userStore'

export default function Settings() {
  const { apiKeys, setApiKeys } = useUserStore()
  const [gemini, setGemini] = useState(apiKeys.gemini)
  const [groq, setGroq] = useState(apiKeys.groq)
  const [saved, setSaved] = useState(false)

  function save() {
    setApiKeys({ gemini, groq })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="scroll-y" style={{ flex: 1, padding: '32px', background: 'var(--bg-base)' }}>
      <div style={{ maxWidth: 560 }}>
        <div style={{ fontSize: 20, fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 6 }}>Settings</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 28 }}>Configure your API keys to enable AI features. Keys are stored locally in your browser.</div>

        {[
          { key: 'gemini', label: 'Gemini 2.0 Flash', state: gemini, setState: setGemini, desc: 'Primary AI: note rewriting, concept extraction, Brain AI chat, quiz generation', link: 'https://aistudio.google.com', linkLabel: 'Get free key →', color: 'var(--cyan)' },
          { key: 'groq', label: 'Groq (Llama 3)', state: groq, setState: setGroq, desc: 'Fallback AI: used when Gemini quota is hit. Very fast inference.', link: 'https://console.groq.com', linkLabel: 'Get free key →', color: 'var(--amber)' },
        ].map(f => (
          <div key={f.key} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{f.label}</div>
              <a href={f.link} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: f.color }}>{f.linkLabel}</a>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.5 }}>{f.desc}</div>
            <input type="password" value={f.state} onChange={e => f.setState(e.target.value)}
              placeholder={`Enter ${f.label} API key...`}
              style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 12, fontFamily: 'monospace' }}
            />
            {f.state && <div style={{ fontSize: 10, color: 'var(--green)', marginTop: 5 }}>✓ Key entered — {f.state.length} characters</div>}
          </div>
        ))}

        <button onClick={save} style={{
          padding: '10px 24px', background: saved ? 'rgba(16,185,129,0.2)' : 'linear-gradient(135deg, var(--violet), var(--violet-light))',
          color: saved ? 'var(--green)' : '#fff', borderRadius: 8, fontSize: 13, fontWeight: 600,
          border: saved ? '1px solid var(--green)' : 'none', transition: 'all 0.2s',
        }}>
          {saved ? '✓ Saved!' : 'Save API Keys'}
        </button>

        <div style={{ marginTop: 32, padding: 16, background: 'var(--amber-dim)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--amber)', marginBottom: 6 }}>Demo Mode</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            NexusLearn works without API keys in demo mode. Note processing will simulate AI, and Brain AI chat will show placeholder responses. Add your Gemini key above to unlock the full AI-powered experience.
          </div>
        </div>
      </div>
    </div>
  )
}