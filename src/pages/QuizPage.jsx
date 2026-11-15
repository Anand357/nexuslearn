import { useState, useEffect } from 'react'
import { useBrainStore } from '../stores/brainStore'
import { useUserStore } from '../stores/userStore'
import { useQuizStore } from '../stores/quizStore'
import { generateQuizQuestion } from '../services/gemini'
import { getReviewPriority } from '../utils/decayScore'

const scoreColor = s => s >= 0.7 ? 'var(--green)' : s >= 0.4 ? 'var(--amber)' : 'var(--red)'

export default function QuizPage() {
  const { concepts, updateConceptScore } = useBrainStore()
  const { apiKeys, addXP } = useUserStore()
  const { activeSession, currentQuestion, currentIndex, score, answers, startSession, setQuestion, setGenerating, answerQuestion, endSession, isGenerating } = useQuizStore()
  const [chosen, setChosen] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [sessionDone, setSessionDone] = useState(false)

  const sortedConcepts = [...concepts].sort((a, b) => getReviewPriority(b) - getReviewPriority(a))
  const BATCH = 5

  function startQuiz() {
    const batch = sortedConcepts.slice(0, BATCH)
    startSession(batch)
    setSessionDone(false)
    setChosen(null)
    setRevealed(false)
    loadQuestion(batch, 0)
  }

  async function loadQuestion(session, index) {
    const concept = session[index]
    if (!concept) { setSessionDone(true); return }
    setGenerating(true)
    setChosen(null)
    setRevealed(false)

    if (!apiKeys.gemini) {
      // Demo questions
      const demoQ = {
        question: `What best describes "${concept.concept}"?`,
        options: [concept.oneLinerDefinition, 'A type of chemical reaction', 'A mathematical theorem', 'A physical constant'],
        correctIndex: 0,
        explanation: `${concept.concept}: ${concept.oneLinerDefinition}`,
      }
      setQuestion(demoQ)
      setGenerating(false)
      return
    }
    try {
      const q = await generateQuizQuestion(concept, apiKeys.gemini)
      setQuestion(q)
    } catch (e) {
      setQuestion({ question: `Define: ${concept.concept}`, options: [concept.oneLinerDefinition, 'Unknown', 'None of the above', 'All of the above'], correctIndex: 0, explanation: concept.oneLinerDefinition })
    }
    setGenerating(false)
  }

  function handleAnswer(idx) {
    if (revealed) return
    setChosen(idx)
    setRevealed(true)
    const correct = idx === currentQuestion.correctIndex
    answerQuestion(correct)
    updateConceptScore(activeSession[currentIndex].id, correct)
    if (correct) addXP(10)
  }

  function next() {
    const nextIndex = currentIndex
    if (nextIndex >= activeSession.length) { setSessionDone(true); return }
    loadQuestion(activeSession, nextIndex)
  }

  if (!activeSession || sessionDone) {
    const finalScore = score
    const total = answers.length
    return (
      <div className="scroll-y" style={{ flex: 1, padding: '40px', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {sessionDone && total > 0 && (
          <div className="fade-in" style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>{finalScore === total ? '🏆' : finalScore >= total * 0.6 ? '⭐' : '📚'}</div>
            <div style={{ fontSize: 24, fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 8 }}>Quiz Complete!</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
              You scored <span style={{ color: 'var(--violet-light)', fontWeight: 700 }}>{finalScore}/{total}</span> · +{finalScore * 10} XP earned
            </div>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              {answers.map((a, i) => (
                <div key={i} style={{ width: 36, height: 36, borderRadius: '50%', background: a ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', border: `2px solid ${a ? 'var(--green)' : 'var(--red)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{a ? '✓' : '✗'}</div>
              ))}
            </div>
          </div>
        )}

        <div style={{ width: '100%', maxWidth: 680 }}>
          <div style={{ fontSize: 16, fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 6 }}>◆ Quiz — Spaced Repetition</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 24 }}>
            Concepts are prioritized by confidence score and time since last review. Lower confidence = reviewed first.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 28 }}>
            {sortedConcepts.slice(0, BATCH).map(c => (
              <div key={c.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{c.concept}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>{c.subject}</div>
                <div style={{ height: 4, background: 'var(--bg-elevated)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${c.confidenceScore * 100}%`, background: scoreColor(c.confidenceScore), borderRadius: 2 }} />
                </div>
                <div style={{ fontSize: 10, color: scoreColor(c.confidenceScore), marginTop: 4 }}>{Math.round(c.confidenceScore * 100)}% confidence</div>
              </div>
            ))}
          </div>
          <button onClick={startQuiz} style={{
            padding: '12px 32px', background: 'linear-gradient(135deg, var(--violet), var(--violet-light))',
            color: '#fff', borderRadius: 10, fontSize: 14, fontWeight: 600,
            boxShadow: 'var(--shadow-glow)',
          }}>
            {sessionDone ? 'Start New Session' : 'Start Quiz Session'} →
          </button>
        </div>
      </div>
    )
  }

  const currentConcept = activeSession[currentIndex]

  return (
    <div className="scroll-y" style={{ flex: 1, padding: '40px 48px', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Progress */}
      <div style={{ width: '100%', maxWidth: 620, marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Question {currentIndex + 1} of {activeSession.length}</span>
          <span style={{ fontSize: 12, color: 'var(--violet-light)' }}>Score: {score}/{answers.length}</span>
        </div>
        <div style={{ height: 4, background: 'var(--bg-elevated)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(currentIndex / activeSession.length) * 100}%`, background: 'linear-gradient(90deg, var(--violet), var(--cyan))', transition: 'width 0.4s ease' }} />
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6 }}>
          {currentConcept?.concept} · {currentConcept?.subject} · {Math.round((currentConcept?.confidenceScore || 0) * 100)}% confidence
        </div>
      </div>

      {/* Question card */}
      <div className="fade-in" style={{ width: '100%', maxWidth: 620 }}>
        {isGenerating ? (
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 32, textAlign: 'center' }}>
            <div className="shimmer" style={{ height: 20, width: '80%', margin: '0 auto 12px' }} />
            <div className="shimmer" style={{ height: 14, width: '60%', margin: '0 auto' }} />
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 16 }}>Generating question with AI...</div>
          </div>
        ) : currentQuestion && (
          <>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.6, marginBottom: 24 }}>{currentQuestion.question}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {currentQuestion.options.map((opt, i) => {
                  const isCorrect = i === currentQuestion.correctIndex
                  const isChosen = i === chosen
                  let bg = 'var(--bg-elevated)', border = 'var(--border)', color = 'var(--text-secondary)'
                  if (revealed) {
                    if (isCorrect) { bg = 'rgba(16,185,129,0.12)'; border = 'var(--green)'; color = 'var(--green)' }
                    else if (isChosen && !isCorrect) { bg = 'rgba(239,68,68,0.12)'; border = 'var(--red)'; color = 'var(--red)' }
                  } else if (isChosen) { bg = 'var(--violet-dim)'; border = 'var(--border-bright)'; color = 'var(--text-primary)' }

                  return (
                    <button key={i} onClick={() => handleAnswer(i)} style={{
                      padding: '12px 16px', background: bg,
                      border: `1px solid ${border}`, borderRadius: 10,
                      color, fontSize: 13, textAlign: 'left', transition: 'all 0.15s',
                      display: 'flex', alignItems: 'center', gap: 10,
                    }}>
                      <span style={{ width: 22, height: 22, borderRadius: '50%', border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, flexShrink: 0 }}>
                        {revealed && isCorrect ? '✓' : revealed && isChosen && !isCorrect ? '✗' : String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </button>
                  )
                })}
              </div>
            </div>

            {revealed && (
              <div className="fade-in" style={{ background: chosen === currentQuestion.correctIndex ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${chosen === currentQuestion.correctIndex ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: 12, padding: 16, marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: chosen === currentQuestion.correctIndex ? 'var(--green)' : 'var(--red)', marginBottom: 6 }}>
                  {chosen === currentQuestion.correctIndex ? '✓ Correct! +10 XP' : '✗ Incorrect'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{currentQuestion.explanation}</div>
              </div>
            )}

            {revealed && (
              <button onClick={next} style={{
                width: '100%', padding: '12px', background: 'linear-gradient(135deg, var(--violet), var(--violet-light))',
                color: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 600,
              }}>
                {currentIndex >= activeSession.length - 1 ? 'Finish Session →' : 'Next Question →'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
