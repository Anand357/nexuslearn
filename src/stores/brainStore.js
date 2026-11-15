import { create } from 'zustand'

// Mock data for demo
const mockConcepts = [
  {
    id: 'c1', concept: 'Photosynthesis', subject: 'Biology',
    oneLinerDefinition: 'Plants convert sunlight, water, and CO₂ into glucose and oxygen',
    fullNotes: '## Photosynthesis\nPhotosynthesis is the process by which plants convert sunlight, water, and carbon dioxide into glucose and oxygen. It takes place inside the chloroplast.',
    relatedConcepts: ['Chloroplast', 'Glucose', 'Carbon Dioxide', 'Calvin Cycle', 'ATP'],
    connections: ['c2', 'c3'], confidenceScore: 0.72, lastReviewed: Date.now() - 86400000 * 2,
    timesCorrect: 8, timesWrong: 2, difficulty: 'basic', hasDiagram: true, modelKeyword: 'chloroplast',
    diagramJSON: {
      type: 'flow', title: 'Photosynthesis Process',
      nodes: [
        { id: 'n1', label: 'Sunlight', color: 'amber', subtitle: 'energy source' },
        { id: 'n2', label: 'Chloroplast', color: 'teal', subtitle: 'reaction site' },
        { id: 'n3', label: 'CO₂ + H₂O', color: 'blue', subtitle: 'raw materials' },
        { id: 'n4', label: 'Glucose + O₂', color: 'purple', subtitle: 'products' },
      ],
      edges: [
        { from: 'n1', to: 'n2', label: 'absorbed by' },
        { from: 'n3', to: 'n2', label: 'enter' },
        { from: 'n2', to: 'n4', label: 'produces' },
      ]
    }
  },
  {
    id: 'c2', concept: 'Chloroplast', subject: 'Biology',
    oneLinerDefinition: 'Organelle in plant cells where photosynthesis occurs, containing chlorophyll',
    fullNotes: '## Chloroplast\nThe chloroplast is a membrane-bound organelle found in plant cells and algae. It contains chlorophyll which absorbs light energy.',
    relatedConcepts: ['Photosynthesis', 'Chlorophyll', 'Thylakoid', 'Stroma'],
    connections: ['c1'], confidenceScore: 0.45, lastReviewed: Date.now() - 86400000 * 5,
    timesCorrect: 3, timesWrong: 3, difficulty: 'intermediate', hasDiagram: false, modelKeyword: 'chloroplast',
    diagramJSON: null
  },
  {
    id: 'c3', concept: 'Electron Shells', subject: 'Chemistry',
    oneLinerDefinition: 'Energy levels around an atom nucleus where electrons orbit at specific distances',
    fullNotes: '## Electron Shells\nElectrons are arranged in shells around the nucleus. Each shell has a maximum number of electrons: 2, 8, 18...',
    relatedConcepts: ['Atomic Structure', 'Valence Electrons', 'Semiconductor Bands', 'Energy Levels'],
    connections: ['c4'], confidenceScore: 0.88, lastReviewed: Date.now() - 86400000 * 1,
    timesCorrect: 12, timesWrong: 1, difficulty: 'basic', hasDiagram: true, modelKeyword: null,
    diagramJSON: {
      type: 'hierarchy', title: 'Atomic Shell Structure',
      nodes: [
        { id: 'n1', label: 'Nucleus', color: 'coral', subtitle: 'protons + neutrons' },
        { id: 'n2', label: 'Shell 1 (K)', color: 'amber', subtitle: 'max 2 electrons' },
        { id: 'n3', label: 'Shell 2 (L)', color: 'teal', subtitle: 'max 8 electrons' },
        { id: 'n4', label: 'Shell 3 (M)', color: 'purple', subtitle: 'max 18 electrons' },
      ],
      edges: [
        { from: 'n1', to: 'n2', label: '' },
        { from: 'n2', to: 'n3', label: '' },
        { from: 'n3', to: 'n4', label: '' },
      ]
    }
  },
  {
    id: 'c4', concept: 'Semiconductor Bands', subject: 'Physics',
    oneLinerDefinition: 'Energy band gaps in semiconductors that determine electrical conductivity',
    fullNotes: '## Semiconductor Band Theory\nSemiconductors have a valence band and conduction band separated by a small energy gap. Electrons can jump across this gap.',
    relatedConcepts: ['Electron Shells', 'Energy Levels', 'Conductors', 'Insulators', 'Diodes'],
    connections: ['c3'], confidenceScore: 0.31, lastReviewed: Date.now() - 86400000 * 8,
    timesCorrect: 2, timesWrong: 5, difficulty: 'advanced', hasDiagram: false, modelKeyword: null,
    diagramJSON: null
  },
  {
    id: 'c5', concept: 'Newton\'s Laws', subject: 'Physics',
    oneLinerDefinition: 'Three fundamental laws describing the relationship between force, mass, and motion',
    fullNotes: '## Newton\'s Three Laws\n1. An object remains at rest unless acted upon by a force.\n2. F = ma\n3. For every action there is an equal and opposite reaction.',
    relatedConcepts: ['Force', 'Momentum', 'Inertia', 'Acceleration', 'Mass'],
    connections: [], confidenceScore: 0.91, lastReviewed: Date.now() - 86400000 * 0.5,
    timesCorrect: 15, timesWrong: 0, difficulty: 'basic', hasDiagram: true, modelKeyword: null,
    diagramJSON: {
      type: 'flow', title: "Newton's Laws Summary",
      nodes: [
        { id: 'n1', label: 'Law 1', color: 'blue', subtitle: 'Inertia' },
        { id: 'n2', label: 'Law 2', color: 'purple', subtitle: 'F = ma' },
        { id: 'n3', label: 'Law 3', color: 'teal', subtitle: 'Action-Reaction' },
      ],
      edges: [
        { from: 'n1', to: 'n2', label: 'leads to' },
        { from: 'n2', to: 'n3', label: 'implies' },
      ]
    }
  },
]

const mockNotes = [
  {
    id: 'n1', rawText: 'photsynthsis — sunlite + water + CO2 --> glucos + O2, happns in chloroplst',
    cleanedText: '## Photosynthesis\nPhotosynthesis is the process by which plants convert sunlight, water, and carbon dioxide into glucose and oxygen. It takes place inside the chloroplast. [DIAGRAM: sunlight + water + CO2 enter leaf, glucose + O2 exit] [MODEL: chloroplast]',
    subject: 'Biology', conceptsExtracted: ['c1', 'c2'],
    uploadedAt: Date.now() - 86400000 * 3, processingStatus: 'done',
  },
  {
    id: 'n2', rawText: 'Electrons in shells around nucleus. K shell = 2, L shell = 8, M = 18',
    cleanedText: '## Electron Shells\nElectrons are arranged in energy shells around the atom nucleus. The first shell (K) holds max 2 electrons, the second (L) holds 8, and the third (M) holds 18.',
    subject: 'Chemistry', conceptsExtracted: ['c3'],
    uploadedAt: Date.now() - 86400000 * 1, processingStatus: 'done',
  },
]

export const useBrainStore = create((set, get) => ({
  concepts: mockConcepts,
  notes: mockNotes,
  gaps: ['Calvin Cycle', 'ATP', 'Chlorophyll', 'Thylakoid', 'Valence Electrons'],
  processingQueue: [],
  selectedConcept: null,

  addConcept: (concept) => set(s => ({ concepts: [...s.concepts, { ...concept, id: `c${Date.now()}` }] })),

  updateConceptScore: (id, correct) => set(s => ({
    concepts: s.concepts.map(c => {
      if (c.id !== id) return c
      const delta = correct ? 0.15 : -0.20
      return { ...c, confidenceScore: Math.min(1, Math.max(0, c.confidenceScore + delta)), lastReviewed: Date.now(), timesCorrect: correct ? c.timesCorrect + 1 : c.timesCorrect, timesWrong: !correct ? c.timesWrong + 1 : c.timesWrong }
    })
  })),

  addNote: (note) => set(s => ({ notes: [note, ...s.notes] })),
  updateNote: (id, updates) => set(s => ({ notes: s.notes.map(n => n.id === id ? { ...n, ...updates } : n) })),
  setSelectedConcept: (c) => set({ selectedConcept: c }),

  getOverallMastery: () => {
    const { concepts } = get()
    if (!concepts.length) return 0
    return concepts.reduce((sum, c) => sum + c.confidenceScore, 0) / concepts.length
  },

  getSubjectBreakdown: () => {
    const { concepts } = get()
    const map = {}
    concepts.forEach(c => {
      if (!map[c.subject]) map[c.subject] = { total: 0, sum: 0, count: 0 }
      map[c.subject].sum += c.confidenceScore
      map[c.subject].count++
    })
    return Object.entries(map).map(([subject, d]) => ({ subject, mastery: d.sum / d.count, count: d.count }))
  },

  applyDecay: () => set(s => ({
    concepts: s.concepts.map(c => {
      const days = (Date.now() - c.lastReviewed) / 86400000
      if (days < 3) return c
      const factor = Math.pow(0.95, days - 3)
      return { ...c, confidenceScore: Math.max(0.05, c.confidenceScore * factor) }
    })
  })),
}))
